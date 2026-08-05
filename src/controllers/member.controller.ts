import { Bot } from "grammy";
import { MyContext } from "../server";
import MemberService from "../models/Member.service";
import { askPhoneView, mainMenuView, errorView } from "../views/index";
import Errors, { Message } from "../libs/Errors";
import { MemberInput } from "../libs/types/member";
import { userPickerView } from "../views/index";

const memberService = new MemberService();

export function memberController(bot: Bot<MyContext>) {

    bot.command("start", async (ctx) => {
        if (!ctx.from) return; // nobody to reply to — silent exit is honest

        const member = await memberService.getMemberByTelegramId(ctx.from.id);

        if (member) {
            const view = mainMenuView(member);
            await ctx.reply(view.text, { reply_markup: view.keyboard });
        } else {
            const view = askPhoneView();
            await ctx.reply(view.text, { reply_markup: view.keyboard });
        }
    });

    bot.on("message:contact", async (ctx) => {
        if (!ctx.from) return;

        // Reject contact cards forwarded from someone else — only self-shared numbers are valid.
        if (ctx.message.contact.user_id !== ctx.from.id) {
            await ctx.reply("Iltimos, o'zingizning raqamingizni yuboring 🙂");
            return;
        }

        // Already registered — just show the menu instead of trying to re-register.
        const existing = await memberService.getMemberByTelegramId(ctx.from.id);
        if (existing) {
            const view = mainMenuView(existing);
            await ctx.reply(view.text, { reply_markup: view.keyboard });
            return;
        }

        const memberInput: MemberInput = {
            telegramId: ctx.from.id,
            name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
            username: ctx.from.username,
            phone: ctx.message.contact.phone_number,
        };

        // createMember throws rather than returning a failure value, so this needs try/catch.
        try {
            const result = await memberService.createMember(memberInput);
            const view = mainMenuView(result);
            await ctx.reply(view.text, { reply_markup: view.keyboard });
        } catch (err) {
            // double-tap race: "already exists" is success from the user's view
            if (err instanceof Errors && err.message === Message.EXISTING_USER) {
                const existingMember = await memberService.getMemberByTelegramId(memberInput.telegramId);
                if (existingMember) {
                    const view = mainMenuView(existingMember);
                    await ctx.reply(view.text, { reply_markup: view.keyboard });
                }
                return;
            }
            console.error("registration failed:", err);
            await ctx.reply(errorView().text);
        }
    });

    bot.hears("👥 Xodimlar ma'lumotlarini sozlash", async (ctx) => {
        // Implementation for updating member information
        const users = await memberService.getAllMembers();
        const view = userPickerView(users);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });
}