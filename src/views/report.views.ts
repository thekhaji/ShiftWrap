import { InlineKeyboard } from "grammy";

export function monthPickerView(months: { year: number; month: number }[]) {
    const keyboard = new InlineKeyboard();
    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

    for (const { year, month } of months) {
        const label = `${monthNames[month - 1]} ${year}`;
        keyboard.text(label, `history_month:${year}-${month}`).row();
    }

    return {
        text: "Qaysi oy hisobotini ko'rmoqchisiz?",
        keyboard,
    };
}
