import { Keyboard } from "grammy";
import { Branch } from "../libs/types/branch";
import { Member } from "../libs/types/member";
import { hasManagerPermission } from "../libs/utils/permission";

export function askPhoneView() {
    return {
        text: "Assalomu alaykum! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring 👇",
        keyboard: new Keyboard()
            .requestContact("📱 Raqamni yuborish")
            .resized()
            .oneTime(),
    };
}

function mainMenuKeyboard(member?: Member) {
    const keyboard =  new Keyboard()
        .text("✅ Check In")
        .text("🚪 Check Out")
        .row()
        .text("🏢 Filial qo'shish")
        .row()
        .text("📊 Hisobot")
        .resized()
        .persistent();

    if (member && hasManagerPermission(member)) {
        keyboard.row().text("🏢 Filial hisoboti");
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
            .row()
            .text("🔙 Bosh menyu")
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
        keyboard: new Keyboard()
            .text("🔙 Bosh menyu")
            .resized()
            .oneTime(),
    };
}

export function branchRegisteredView(branch: Branch) {
    return {
        text: `Filial muvaffaqiyatli qo'shildi! 🏢\nNomi: ${branch.name}\nKoordinatalar: ${branch.lat}, ${branch.lng}`,
    };
}