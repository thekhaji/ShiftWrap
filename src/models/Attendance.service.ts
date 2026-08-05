import AttendanceModel from '../schema/Attendance.model';
import MemberModel from '../schema/Member.model';
import { Attendance } from '../libs/types/attendance';
import Errors, { Message, HttpCode } from '../libs/Errors';
import { Types } from 'mongoose';
import { nowInSeoul } from '../libs/utils/time';

class AttendanceService {
    private readonly attendanceModel = AttendanceModel;
    private readonly memberModel = MemberModel;

    async getOpenShift(memberId: any) {
        return this.attendanceModel.findOne({ memberId, checkOut: { $exists: false } }).lean();
    }

    async checkIn(telegramId: number, branchId: any) {
        const member = await this.memberModel.findOne({ telegramId });
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        if (!member.hourlyRate) throw new Errors(HttpCode.NOT_MODIFIED, Message.NO_RATE_SET);

        try {
            const shift = await this.attendanceModel.create({
                memberId: member._id,
                branchId,
                checkIn: nowInSeoul(),
                hourlyRate: member.hourlyRate,
            });
            return shift.toObject();
        } catch (err: any) {
            if (err.code === 11000) throw new Errors(HttpCode.CONFLICT, Message.ALREADY_CHECKED_IN);
            throw err;
        }
    }

    async checkOut(telegramId: number, branchId: any) {
        const member = await this.memberModel.findOne({ telegramId });
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        const open = await this.getOpenShift(member._id);
        if (!open) throw new Errors(HttpCode.NOT_FOUND, Message.NO_OPEN_SHIFT);

        const closed = await this.attendanceModel.findByIdAndUpdate(
            open._id,
            { checkOut: nowInSeoul() },
            { new: true }
        );
        return closed!.toObject();
    }

    async getMemberReport(telegramId: number, month: number, year:number): Promise<Attendance[]>{
        const member = await this.memberModel.findOne({telegramId});
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        const memberId = member._id;

        const start = new Date(Date.UTC(year, month - 1, 1));   // 1st of the target month, 00:00 Seoul
        const end = new Date(Date.UTC(year, month, 1));          // 1st of the NEXT month, 00:00 Seoul (exclusive)

        const shift: Attendance[] = await this.attendanceModel.find({
            memberId,
            checkIn: { $gte: start, $lt: end },
        })
        .sort({ checkIn: 1 })
        .lean();
        
        return shift;
    }


    async getMemberIdsForBranchAndMonth(branchId: Types.ObjectId, year: number, month: number): Promise<Types.ObjectId[]> {
        const start = new Date(Date.UTC(year, month - 1, 1));   // 1st of the target month, 00:00 Seoul
        const end = new Date(Date.UTC(year, month, 1));          // 1st of the NEXT month, 00:00 Seoul (exclusive)

        const memberIds = await this.attendanceModel.distinct('memberId', {
            branchId,
            checkIn: { $gte: start, $lt: end },
        });

        return memberIds;
    }

    
    async getBranchIdsForMemberAndMonth(memberId: Types.ObjectId, year: number, month: number): Promise<Types.ObjectId[]> {
        const start = new Date(Date.UTC(year, month - 1, 1));   // 1st of the target month, 00:00 Seoul
        const end = new Date(Date.UTC(year, month, 1));          // 1st of the NEXT month, 00:00 Seoul (exclusive)

        return this.attendanceModel.distinct('branchId', {
            memberId,
            checkIn: { $gte: start, $lt: end },
        });
    }

    async getShiftsForMemberBranchAndMonth(memberId: Types.ObjectId, branchId: Types.ObjectId, year: number, month: number) {
        const start = new Date(Date.UTC(year, month - 1, 1));   // 1st of the target month, 00:00 Seoul
        const end = new Date(Date.UTC(year, month, 1));          // 1st of the NEXT month, 00:00 Seoul (exclusive)

        return this.attendanceModel
            .find({ memberId, branchId, checkIn: { $gte: start, $lt: end } })
            .sort({ checkIn: 1 })
            .lean();
    }

    // method for old report generation, to find the first check-in date of a member
    async getFirstCheckInDate(memberId: Types.ObjectId): Promise<Date | null> {
        const earliest = await this.attendanceModel
            .findOne({ memberId })
            .sort({ checkIn: 1 })
            .lean();
        return earliest ? earliest.checkIn : null;
    }

    
}

export default AttendanceService;