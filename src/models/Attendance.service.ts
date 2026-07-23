import AttendanceModel from '../schema/Attendance.model';
import MemberModel from '../schema/Member.model';
import { Attendance } from '../libs/types/attendance';
import Errors, { Message, HttpCode } from '../libs/Errors';

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
                checkIn: new Date(),
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
            { checkOut: new Date() },
            { new: true }
        );
        return closed!.toObject();
    }

    async getMemberReport(telegramId: number, month: number, year:number): Promise<Attendance[]>{
        const member = await this.memberModel.findOne({telegramId});
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        const memberId = member._id;

         const start = new Date(year, month - 1, 1);   // 1st of the target month, 00:00
        const end = new Date(year, month, 1);          // 1st of the NEXT month, 00:00 (exclusive)

        const shift: Attendance[] = await this.attendanceModel.find({
            memberId,
            checkIn: { $gte: start, $lt: end },
        })
        .sort({ checkIn: 1 })
        .lean();
        
        return shift;
    }

    
}

export default AttendanceService;