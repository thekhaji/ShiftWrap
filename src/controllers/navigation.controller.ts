import { Bot } from 'grammy';
import { MyContext } from '../server';
import MemberService from '../models/Member.service';
import { backToMenuView } from '../views/index';

const memberService = new MemberService();

export function navigationController(bot: Bot<MyContext>) {
    bot.hears("🔙 Bosh menyu", async (ctx) => {
        if (!ctx.from) return;

        ctx.session.awaitingAction = undefined;
        ctx.session.awaitingSince = undefined;
        ctx.session.pendingBranchName = undefined;

        const member = await memberService.getMemberByTelegramId(ctx.from.id);
        const view = backToMenuView(member ?? undefined);
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });
}
