import { Keyboard } from "grammy";

export function askPhoneView() {
    return {
        text: "Assalomu alaykum! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring 👇",
        keyboard: new Keyboard()
            .requestContact("📱 Raqamni yuborish")
            .resized()
            .oneTime(),
    };
}

export function mainMenuView(name: string) {
    return {
        text: `Xush kelibsiz, ${name}! 👋\nKerakli amalni tanlang:`,
        keyboard: new Keyboard()
            .text("✅ Check In")
            .text("🚪 Check Out")
            .resized()
            .persistent(),
    };
}

export function errorView() {
    return {
        text: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring 🙏",
    };
}