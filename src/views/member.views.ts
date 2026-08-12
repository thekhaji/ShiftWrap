import { Keyboard, InlineKeyboard } from "grammy";
import { Member } from "../libs/types/member";


export function askPhoneView() {
    return {
        text: "Assalomu alaykum! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring 👇",
        keyboard: new Keyboard()
            .requestContact("📱 Raqamni yuborish")
            .resized()
            .oneTime(),
    };
}

export function userPickerView(users: Member[]) {
    const keyboard = new InlineKeyboard();
    const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
    for (const user of sortedUsers) {
        keyboard.text(user.name, `user_picker:${user.telegramId.toString()}`).row();
    }
    return {
        text: "Qaysi foydalanuvchi ma'lumotlarini o'zgartirmoqchisiz?",
        keyboard,
    };
}

export function userEditView(user: Member, branchName: string | null) {
    const keyboard = new InlineKeyboard()
        .text("Telefon raqamini o'zgartirish", `edit_user:${user.telegramId},phone`).row()
        .text("Bank nomini o'zgartirish", `edit_user:${user.telegramId},bankName`).row()
        .text("Bank hisob raqamini o'zgartirish", `edit_user:${user.telegramId},bankAccount`).row()
        .text("Soatlik narxni o'zgartirish", `edit_user:${user.telegramId},hourlyRate`).row();

    return {
        text: `Foydalanuvchi: ${user.name}\nTelefon: ${user.phone}\nFilial: ${branchName || "Noma'lum"}\nBank: ${user.bankName || "Noma'lum"}\nBank hisob raqami: ${user.bankAccount || "Noma'lum"}\nSoatlik narx: ${user.hourlyRate !== undefined ? user.hourlyRate : "Noma'lum"} won\n\nQaysi ma'lumotni o'zgartirmoqchisiz?`,
        keyboard,
    };
}

export function askEditFieldDetailView(userName: string, field: string) {
    let prompt = "";
    switch (field) {
        case "phone":
            prompt = `${userName}ning yangi telefon raqamini kiriting ✍️`;
            break;
        case "bankName":
            prompt = `${userName}ning yangi bank nomini kiriting ✍️`;
            break;
        case "bankAccount":
            prompt = `${userName}ning yangi bank hisob raqamini kiriting ✍️`;
            break;
        case "hourlyRate":
            prompt = `${userName}ning yangi soatlik narxni kiriting ✍️`;
            break;
    }
    return {
        text: prompt,
        keyboard: new Keyboard()
            .text("🔙 Bosh menyu")
            .resized()
            .oneTime(),
    };
}
