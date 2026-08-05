import { Keyboard, InlineKeyboard } from "grammy";
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
    const keyboard = new Keyboard()
        .text("✅ Check In")
        .text("🚪 Check Out")
        .row()
        .text("🏢 Filial qo'shish")
        .row()
        .text("📊 Hisobot")
        .row()
        .text("🗂 Eski hisobotlar")
        .resized()
        .persistent();

    if (member && hasManagerPermission(member)) {
        keyboard.row().text("🏢 Filial hisoboti");
        keyboard.row().text("👥 Xodimlar ma'lumotlarini sozlash");
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

export function branchPickerView(branches: Branch[]) {
    const keyboard = new InlineKeyboard();
    for (const branch of branches) {
        keyboard.text(branch.name, `personal_report:${branch._id.toString()}`).row();
    }
    return {
        text: "Qaysi filial uchun hisobot kerak?",
        keyboard,
    };
}

export function monthPickerView(months: { year: number; month: number }[]) {
    const keyboard = new InlineKeyboard();
    const monthNames = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"];

    for (const { year, month } of months) {
        const label = `${monthNames[month - 1]} ${year}`;
        keyboard.text(label, `history_month:${year}-${month}`).row();
    }

    return {
        text: "Qaysi oy hisobotini ko'rmoqchisiz?",
        keyboard,
    };
}

export function userPickerView(users: Member[]) {
    const keyboard = new InlineKeyboard(); 
    const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
    for (const user of sortedUsers) {
        keyboard.text(user.name, `user_report:${user._id.toString()}`).row();
    }
    return {
        text: "Qaysi foydalanuvchi ma'lumotlarini o'zgartirmoqchisiz?",
        keyboard,
    };
}