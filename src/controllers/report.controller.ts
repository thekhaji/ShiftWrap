import { Bot, InputFile } from 'grammy';
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

        // More than one branch — show the picker.
        // NOTE: branchPickerView's callback_data ("personal_report:<branchId>") has no handler
        // registered for it anywhere yet, so selecting a branch here currently does nothing.
        const branches = await branchService.getBranchesByIds(branchIds);
        const view = branchPickerView(branches);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.hears("🏢 Filial hisoboti", async (ctx) => {
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        if (!hasManagerPermission(member) && !isBossOrAdmin(member)) {
            await ctx.reply("Sizda bu buyruq uchun ruxsat yo'q.");
            return;
        }

        // Scoped to the manager's own branch. Boss/admin accounts aren't tied to a single
        // branch, so member.branchId is only guaranteed to exist for the manager case above —
        // a branch picker for boss/admin isn't implemented yet.
        const branchId = member.branchId!;
        const branch = await branchService.getBranchById(branchId.toString());
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
        if (!ctx.from) return;
        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) return;

        const [year, month] = ctx.callbackQuery.data.split(":")[1].split("-").map(Number);
        await ctx.answerCallbackQuery();

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

        // Same picker/handler gap as the current-month flow above — the selected month
        // also isn't threaded through branchPickerView's callback_data, so this needs the
        // same fix once the "personal_report:" handler is added.
        const branches = await branchService.getBranchesByIds(branchIds);
        const view = branchPickerView(branches);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });
}

