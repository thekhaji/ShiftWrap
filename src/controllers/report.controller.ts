import { Bot, InputFile } from 'grammy';
import { Types } from 'mongoose';
import { MyContext } from '../server';
import AttendanceService from '../models/Attendance.service';
import MemberService from '../models/Member.service';
import ReportService from '../models/Report.service';
import BranchService from '../models/Branch.service';
import { Attendance } from '../libs/types/attendance';
import { isBossOrAdmin, hasManagerPermission } from '../libs/utils/permission';
import { branchPickerView, monthPickerView } from '../views/index';
import { getMonthsBetween } from '../libs/utils/date';

const attendanceService = new AttendanceService();
const memberService = new MemberService();
const reportService = new ReportService();
const branchService = new BranchService();

export function reportController(bot: Bot<MyContext>) {
    bot.hears("📊 Hisobot", async (ctx) => {
        if (!ctx.from) return;

        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) {
            await ctx.reply("Siz ro'yxatdan o'tmagansiz.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const branchIds = await attendanceService.getBranchIdsForMemberAndMonth(member._id, year, month);

        if (branchIds.length === 0) {
            await ctx.reply("Sizda ushbu oy uchun hisobot mavjud emas.");
            return;
        }

        if (branchIds.length === 1) {
            // only one branch worked — skip the picker, generate directly
            const shifts = await attendanceService.getShiftsForMemberBranchAndMonth(member._id, branchIds[0], year, month);
            const buffer = await reportService.generateReportFile(member, shifts, year, month);
            await ctx.replyWithDocument(new InputFile(buffer, `${member.name}_${month}_${year}.xlsx`));
            return;
        }

        const branches = await branchService.getBranchesByIds(branchIds);
        const view = branchPickerView(branches, year, month);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.hears("🏢 Filial hisoboti", async (ctx) => {
        if (!ctx.from) return;
        ctx.session.awaitingAction = "get_branch_report";
        ctx.session.awaitingSince = Date.now();
        
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        if (!hasManagerPermission(member) && !isBossOrAdmin(member)) {
            await ctx.reply("Sizda bu buyruq uchun ruxsat yo'q.");
            return;
        }
        else if (hasManagerPermission(member)) {
            const branchId = member.branchId!;
            const branch = await branchService.getBranchById(branchId);
        }
        else if (isBossOrAdmin(member)) {
            branchPickerView(await branchService.getAllBranches(), new Date().getFullYear(), new Date().getMonth() + 1, "get_branch_report");
        }
       
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const memberIds = await attendanceService.getMemberIdsForBranchAndMonth(branchId, year, month);
        const members = await memberService.getMembersByIds(memberIds);

        const shiftsByMember = new Map<string, Attendance[]>();
        for (const m of members) {
            const shifts = await attendanceService.getMemberReport(m.telegramId, month, year);
            shiftsByMember.set(m._id.toString(), shifts);
        }

        const buffer = await reportService.generateBranchReportFile(members, shiftsByMember, year, month);
        await ctx.replyWithDocument(new InputFile(buffer, `${branch!.name}_${year}-${month}.xlsx`));
    });

    bot.hears("🗂 Eski hisobotlar", async (ctx) => {
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        const firstCheckIn = await attendanceService.getFirstCheckInDate(member._id);
        if (!firstCheckIn) {
            await ctx.reply("Sizda hali hech qanday hisobot yo'q.");
            return;
        }

        const now = new Date();
        const months = getMonthsBetween(
            firstCheckIn.getFullYear(), firstCheckIn.getMonth() + 1,
            now.getFullYear(), now.getMonth() + 1
        );

        if (months.length === 0) {
            await ctx.reply("Hali o'tgan oylar uchun hisobot mavjud emas.");
            return;
        }

        const view = monthPickerView(months);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.callbackQuery(/^history_month:/, async (ctx) => {
        await ctx.answerCallbackQuery();
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        const [year, month] = ctx.callbackQuery.data.split(":")[1].split("-").map(Number);

        // reuse the exact same branch-count logic from the current-month report
        const branchIds = await attendanceService.getBranchIdsForMemberAndMonth(member._id, year, month);

        if (branchIds.length === 0) {
            await ctx.reply("Bu oy uchun ma'lumot topilmadi.");
            return;
        }

        if (branchIds.length === 1) {
            const shifts = await attendanceService.getShiftsForMemberBranchAndMonth(member._id, branchIds[0], year, month);
            const buffer = await reportService.generateReportFile(member, shifts, year, month);
            await ctx.replyWithDocument(new InputFile(buffer, `${member.name}_${month}_${year}.xlsx`));
            return;
        }
        const branches = await branchService.getBranchesByIds(branchIds);
        const view = branchPickerView(branches, year, month);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.callbackQuery(/^personal_report:/, async (ctx) => {
        await ctx.answerCallbackQuery();
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;
        const [branchIdStr, year, month] = ctx.callbackQuery.data.split(":")[1].split(",");
        const branchId = new Types.ObjectId(branchIdStr);

        const shifts = await attendanceService.getShiftsForMemberBranchAndMonth(member._id, branchId, Number(year), Number(month));
        const buffer = await reportService.generateReportFile(member, shifts, Number(year), Number(month));
        await ctx.replyWithDocument(new InputFile(buffer, `${member.name}_${month}_${year}.xlsx`));
    });
}

