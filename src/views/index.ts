import { Keyboard, InlineKeyboard } from "grammy";
import { Branch } from "../libs/types/branch";
import { Member } from "../libs/types/member";
import { hasManagerPermission } from "../libs/utils/permission";
import branchService from "../models/Branch.service";




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

export function branchPickerView(branches: Branch[], year: number, month: number) {
    const keyboard = new InlineKeyboard();
    for (const branch of branches) {
        keyboard.text(branch.name, `personal_report:${branch._id.toString()},${year},${month}`).row();
    }
    return {
        text: `Qaysi filial uchun ${month}/${year} hisobot kerak?`,
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
        keyboard.text(user.name, `user_picker:${user.telegramId.toString()}`).row();
    }
    return {
        text: "Qaysi foydalanuvchi ma'lumotlarini o'zgartirmoqchisiz?",
        keyboard,
    };
}

export async function userEditView(user: Member) {
    const keyboard = new InlineKeyboard()
        .text("Telefon raqamini o'zgartirish", `edit_user:${user.telegramId},phone`).row()
        .text("Bank nomini o'zgartirish", `edit_user:${user.telegramId},bankName`).row()
        .text("Bank hisob raqamini o'zgartirish", `edit_user:${user.telegramId},bankAccount`).row()
        .text("Soatlik narxni o'zgartirish", `edit_user:${user.telegramId},hourlyRate`).row()

    const branchServiceInstance = new branchService();
    const branch = user.branchId
        ? await branchServiceInstance.getBranchById(user.branchId)
        : undefined;
    const branchName = branch && typeof branch !== "string" ? branch.name : branch;
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