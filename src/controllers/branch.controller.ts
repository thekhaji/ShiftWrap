import { Bot } from 'grammy';
import { MyContext } from '../server';
import BranchService from '../models/Branch.service';
import MemberService from '../models/Member.service';
import { askBranchNameView, askLocationView, branchRegisteredView, mainMenuView } from '../views/index';
import Errors from '../libs/Errors';
import {branchPickerView} from '../views/branch.views';

const branchService = new BranchService();
const memberService = new MemberService();

export function branchController(bot: Bot<MyContext>) {
    bot.hears("📊 Filial hisoboti", async (ctx) => {
        if (!ctx.from) return;

        const branches = await branchService.getAllBranches();
        if (branches.length === 0) {
            await ctx.reply("Hozircha filiallar mavjud emas. Iltimos, avval filial qo'shing.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const view = branchPickerView(branches, year, month);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.hears("🏢 Filial qo'shish", async (ctx) => {
        if (!ctx.from) return;
        ctx.session.awaitingAction = "register_branch_name";
        ctx.session.awaitingSince = Date.now();
        const view = askBranchNameView();
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.on("message:text", async (ctx, next) => {
        if (ctx.session.awaitingAction !== "register_branch_name") return next();

        const since = ctx.session.awaitingSince ?? 0;
        const expired = Date.now() - since > 60_000;

        ctx.session.awaitingAction = undefined;
        ctx.session.awaitingSince = undefined;

        if (expired) {
            await ctx.reply("Vaqt tugadi. Qaytadan urinib ko'ring.");
            return;
        }

        const name = ctx.message.text.trim();
        if (!name) {
            await ctx.reply("Filial nomi bo'sh bo'lishi mumkin emas. Qaytadan urinib ko'ring.");
            return;
        }

        ctx.session.pendingBranchName = name;
        ctx.session.awaitingAction = "register_branch_location";
        ctx.session.awaitingSince = Date.now();

        const view = askLocationView();
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });

    bot.on("message:location", async (ctx, next) => {
        if (ctx.session.awaitingAction !== "register_branch_location") return next();

        const since = ctx.session.awaitingSince ?? 0;
        const expired = Date.now() - since > 60_000;
        const name = ctx.session.pendingBranchName;

        ctx.session.awaitingAction = undefined;
        ctx.session.awaitingSince = undefined;
        ctx.session.pendingBranchName = undefined;

        if (expired || !name) {
            await ctx.reply("Vaqt tugadi. Qaytadan urinib ko'ring.");
            return;
        }

        const { latitude, longitude } = ctx.message.location;

        try {
            const branch = await branchService.createBranch({ name, lat: latitude, lng: longitude });
            const view = branchRegisteredView(branch);
            await ctx.reply(view.text);

            if (ctx.from) {
                const member = await memberService.getMemberByTelegramId(ctx.from.id);
                if (member) {
                    const menu = mainMenuView(member);
                    await ctx.reply(menu.text, { reply_markup: menu.keyboard });
                }
            }
        } catch (err) {
            if (err instanceof Errors) {
                await ctx.reply(err.message);
            } else {
                console.error("branch registration error:", err);
                await ctx.reply("Xatolik yuz berdi.");
            }
        }
    });
}
