import { Keyboard } from "grammy";
import { Branch } from "../libs/types/branch";

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
            .row()
            .text("🏢 Filial qo'shish")
            .resized()
            .persistent(),
    };
}

export function errorView() {
    return {
        text: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring 🙏",
    };
}

export function askLocationView() {
    return {
        text: "Joylashuvingizni yuboring 📍",
        keyboard: new Keyboard()
            .requestLocation("📍 Joylashuvni yuborish")
            .resized()
            .oneTime(),
    };
}

export function checkInSuccessView(checkInTime: Date) {
    return {
        text: `Siz muvaffaqiyatli check in qildingiz! ⏰\nCheck In vaqti: ${checkInTime.toLocaleString()}`,
    };
}

export function checkOutSuccessView(checkInTime: Date, checkOutTime: Date) {
    return {
        text: `Siz muvaffaqiyatli check out qildingiz! ⏰\nCheck In vaqti: ${checkInTime.toLocaleString()}\nCheck Out vaqti: ${checkOutTime.toLocaleString()}`,
    };
}

export function noOpenShiftView() {
    return {
        text: "Sizda ochiq shift mavjud emas! ❌\nIltimos, avval check in qiling.",
    };
}

export function askBranchNameView() {
    return {
        text: "Yangi filial nomini kiriting ✍️",
        keyboard: { remove_keyboard: true as const },
    };
}

export function branchRegisteredView(branch: Branch) {
    return {
        text: `Filial muvaffaqiyatli qo'shildi! 🏢\nNomi: ${branch.name}\nKoordinatalar: ${branch.lat}, ${branch.lng}`,
    };
}