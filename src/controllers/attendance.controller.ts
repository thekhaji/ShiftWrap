import { Bot } from 'grammy';
import { MyContext } from '../server';
import AttendanceService from '../models/Attendance.service';
import { askLocationView, checkInSuccessView, checkOutSuccessView, errorView } from '../views/index';
import Errors, { HttpCode, Message } from '../libs/Errors';
import BranchService from '../models/Branch.service';
import MemberService from '../models/Member.service';
import { Member } from '../libs/types/member';

const attendanceService = new AttendanceService();
const branchService = new BranchService();


export function attendanceController(bot: Bot<MyContext>) {

    bot.hears("✅ Check In", async (ctx) => {
        if (!ctx.from) return;
        ctx.session.awaitingAction = "checkin";
        ctx.session.awaitingSince = Date.now();
        const view = askLocationView();
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.hears("🚪 Check Out", async (ctx) => {
        if (!ctx.from) return;
        ctx.session.awaitingAction = "checkout";
        ctx.session.awaitingSince = Date.now();
        const view = askLocationView();
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.on("message:location", async (ctx, next) => {
        if (!ctx.from) return;

        const action = ctx.session.awaitingAction;
        if (action !== "checkin" && action !== "checkout") return next();

        const since = ctx.session.awaitingSince ?? 0;
        const expired = Date.now() - since > 60_000;

        ctx.session.awaitingAction = undefined;
        ctx.session.awaitingSince = undefined;

        if (expired) {
            await ctx.reply("Vaqt tugadi. Qaytadan urinib ko'ring.");
            return;
        }

        const { latitude, longitude } = ctx.message.location;

        try {
            const nearestBranch = await branchService.findNearestBranch(latitude, longitude);
                if (action === "checkin") {
                    const shift = await attendanceService.checkIn(ctx.from.id, nearestBranch.branch._id);
                    await ctx.reply(`Ish boshlandi ✅ ${new Date(shift.checkIn).toLocaleTimeString()}`);
                } else {
                    const shift = await attendanceService.checkOut(ctx.from.id, nearestBranch.branch._id);
                    await ctx.reply(`Ish tugadi 🚪 ${new Date(shift.checkOut!).toLocaleTimeString()}`);
                }

        } catch (err) {
            if (err instanceof Errors) {
                await ctx.reply(err.message); // temporary — map to proper views once Message texts exist
            } else {
                console.error("attendance error:", err);
                await ctx.reply("Xatolik yuz berdi.");
            }
        }
    });

}