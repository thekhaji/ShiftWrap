import { Bot, InputFile } from 'grammy';
import { MyContext } from '../server';
import AttendanceService from '../models/Attendance.service';
import MemberService from '../models/Member.service';
import ReportService from '../models/Report.service';
import BranchService from '../models/Branch.service';
import { Attendance } from '../libs/types/attendance';
import { Member } from '../libs/types/member';
import {isManagerOf, isBossOrAdmin, hasManagerPermission} from '../libs/utils/permission';

const attendanceService = new AttendanceService();
const memberService = new MemberService();
const reportService = new ReportService();
const branchService = new BranchService();

export function reportController(bot: Bot<MyContext>){
    bot.hears("📊 Hisobot", async (ctx)=>{
        console.log("u are in report controller!");
        if (!ctx.from) return;

        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) {
            await ctx.reply("Siz ro'yxatdan o'tmagansiz.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const shifts = await attendanceService.getMemberReport(ctx.from.id, month, year);
        
        const buffer = await reportService.generateReportFile(member, shifts, year, month);
        await ctx.replyWithDocument(new InputFile(Buffer.from(buffer), `${member.name}_${month}_${year}.xlsx`));
    });

    bot.hears("🏢 Filial hisoboti", async (ctx) => {
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        // determine which branch — manager: their own; boss/admin: needs a picker (future), for now maybe all branches or ask
        
        if (!hasManagerPermission(member) && !isBossOrAdmin(member)) {
            await ctx.reply("Sizda bu buyruq uchun ruxsat yo'q.");
            return;
        }

        const branchId = member.branchId!; // manager's own branch — boss/admin case needs more thought
        const branch = await branchService.getBranchById(branchId.toString());
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const memberIds = await attendanceService.getMemberIdsForBranchAndMonth(branchId, year, month);
        const members = await memberService.getMembersByIds(memberIds); // new small method needed

        const shiftsByMember = new Map<string, Attendance[]>();
        for (const m of members) {
            const shifts = await attendanceService.getMemberReport(m.telegramId, month, year);
            shiftsByMember.set(m._id.toString(), shifts);
        }

        const buffer = await reportService.generateBranchReportFile(members, shiftsByMember, year, month);
        await ctx.replyWithDocument(new InputFile(buffer, `${branch!.name}_${year}-${month}.xlsx`));
    });
}

