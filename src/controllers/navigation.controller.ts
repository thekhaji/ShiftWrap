import { Bot } from 'grammy';
import { MyContext } from '../server';
import { backToMenuView } from '../views/index';

export function navigationController(bot: Bot<MyContext>) {
    bot.hears("🔙 Bosh menyu", async (ctx) => {
        if (!ctx.from) return;

        ctx.session.awaitingAction = undefined;
        ctx.session.awaitingSince = undefined;
        ctx.session.pendingBranchName = undefined;

        const view = backToMenuView();
        await ctx.reply(view.text, { reply_markup: view.keyboard });
    });
}
