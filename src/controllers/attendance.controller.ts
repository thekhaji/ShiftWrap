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
const memberService = new MemberService();

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

    bot.hears("📊 Hisobot", async (ctx)=>{
        if (!ctx.from) return;

        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        if (!member) {
            await ctx.reply("Siz ro'yxatdan o'tmagansiz.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const shift = await attendanceService.getMemberReport(ctx.from.id, month, year);
        printMonthlyReport(member, shift, year, month);

    });

    function printMonthlyReport(member: Member, shifts: any[], year: number, month: number) {
        console.log(`Name: ${member.name}`);
        console.log("");
        console.log("Number of days\tDate\t\tFrom\tTo\tTotal Hours");

        const daysInMonth = new Date(year, month, 0).getDate();
        const shiftsByDay = new Map<number, any>();
        for (const shift of shifts) {
            const day = new Date(shift.checkIn).getDate();
            shiftsByDay.set(day, shift);
        }

        let totalMinutes = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shiftsByDay.get(day);

            if (!shift || !shift.checkOut) {
                console.log(`${day}`);
                continue;
            }

            const dateStr = new Date(shift.checkIn).toISOString().slice(0, 10);
            const from = new Date(shift.checkIn).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            const to = new Date(shift.checkOut).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

            const minutes = Math.round((new Date(shift.checkOut).getTime() - new Date(shift.checkIn).getTime()) / 60000);
            totalMinutes += minutes;

            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const durationStr = `${hours}:${mins.toString().padStart(2, "0")}`;

            console.log(`${day}\t${dateStr}\t${from}\t${to}\t${durationStr}`);
        }

        const totalHours = Math.floor(totalMinutes / 60);
        const totalMins = totalMinutes % 60;
        const totalWage = Math.round((totalMinutes / 60) * member.hourlyRate!);

        console.log("");
        console.log(`Total Worked Hours\t${totalHours}:${totalMins.toString().padStart(2, "0")}`);
        console.log(`Wage per hour\t${member.hourlyRate ?? "N/A"}`);
        console.log(`Total wage\t${totalWage}`);
        console.log("");

        if (member.bankName && member.bankAccount) {
            console.log(`${member.bankName}\t${member.bankAccount}`);
        } else {
            console.log("No bank details available");
        }
}
}