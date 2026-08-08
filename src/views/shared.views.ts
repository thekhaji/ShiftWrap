import { Keyboard } from "grammy";
import { Member } from "../libs/types/member";
import { hasManagerPermission } from "../libs/utils/permission";

function mainMenuKeyboard(member?: Member) {
    const keyboard = new Keyboard()
        .text("✅ Check In")
        .text("🚪 Check Out")
        .row()
        .text("📊 Hisobot")
        .row()
        .text("🗂 Eski hisobotlar")
        .resized()
        .persistent();

    if (member && (hasManagerPermission(member) || member?.type === "BOSS" || member?.type === "ADMIN")) {
        keyboard.row().text("🏢 Filial hisoboti");
        keyboard.row().text("👥 Xodimlar ma'lumotlarini sozlash");
        keyboard.row().text("🏢 Filial qo'shish");
    }

    return keyboard;
}

export function mainMenuView(member: Member) {
    return {
        text: `Xush kelibsiz, ${member.name}! 👋\nKerakli amalni tanlang:`,
        keyboard: mainMenuKeyboard(member),
    };
}

export function backToMenuView(member?: Member) {
    return {
        text: "Bosh menyu 🏠",
        keyboard: mainMenuKeyboard(member),
    };
}

export function menuUpdatedView(member: Member) {
    return {
        text: "Botda yangilanish bo'ldi! ✨\nMenyu yangilandi, quyidagi tugmalardan foydalanishingiz mumkin:",
        keyboard: mainMenuKeyboard(member),
    };
}

export function errorView() {
    return {
        text: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring 🙏",
    };
}
