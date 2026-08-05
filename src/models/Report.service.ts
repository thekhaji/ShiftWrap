import ExcelJS from 'exceljs';
import { Member } from '../libs/types/member';
import { Attendance } from '../libs/types/attendance';

class ReportService {

    async generateReportFile(member: Member, shifts: Attendance[], year: number, month: number): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        this.addEmployeeSheet(workbook, member, shifts, year, month);

        const excelBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(excelBuffer);
    }

    async generateBranchReportFile(
        members: Member[],
        shiftsByMember: Map<string, Attendance[]>,
        year: number,
        month: number
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        for (const member of members) {
            const shifts = shiftsByMember.get(member._id.toString()) ?? [];
            this.addEmployeeSheet(workbook, member, shifts, year, month);
        }

        const excelBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(excelBuffer);
    }

    private addEmployeeSheet(workbook: ExcelJS.Workbook, member: Member, shifts: Attendance[], year: number, month: number): void {
        const sheet = workbook.addWorksheet(member.name);

        let totalMinutes = 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const shiftsByDay = new Map<number, Attendance>();

        sheet.getCell('A1').value = 'Name:';
        sheet.getCell('A1').font = { bold: true };
        sheet.getCell('B1').value = member.name;
        sheet.mergeCells('B1:E1');
        sheet.getCell('B1').font = { bold: true };
        sheet.getCell('B1').alignment = { horizontal: 'center' };

        sheet.addRow([]);

        sheet.mergeCells('C2:D2');
        sheet.getCell('C2').value = 'TIME';
        sheet.getCell('C2').font = { bold: true };
        sheet.getCell('C2').alignment = { horizontal: 'center' };

        const headerRow = sheet.addRow(['Number of days', 'Days', 'From', 'To', 'Total Hours']);
        headerRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        sheet.columns = [
            { width: 16 },
            { width: 14 },
            { width: 12 },
            { width: 12 },
            { width: 12 },
        ];

        for (const shift of shifts) {
            shiftsByDay.set(new Date(shift.checkIn).getUTCDate(), shift);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shiftsByDay.get(day);
            const dateForDay = formatLocalDate(year, month, day);

            if (!shift) {
                const row = sheet.addRow([day, dateForDay]);
                row.eachCell(cell => cell.alignment = { horizontal: 'center' });
                continue;
            }

            if (!shift.checkOut) {
                const from = new Date(shift.checkIn);
                const row = sheet.addRow([day, dateForDay, from, '⚠️ No check-out']);
                row.eachCell(cell => cell.alignment = { horizontal: 'center' });
                continue;
            }

            const from = new Date(shift.checkIn);
            const to = new Date(shift.checkOut);
            const minutes = Math.round((to.getTime() - from.getTime()) / 60000);
            totalMinutes += minutes;

            const row = sheet.addRow([day, dateForDay, from, to, minutes / 1440]);
            row.eachCell(cell => cell.alignment = { horizontal: 'center' });
            row.getCell(3).numFmt = 'hh:mm AM/PM';
            row.getCell(4).numFmt = 'hh:mm AM/PM';
            row.getCell(5).numFmt = '[h]:mm';
        }

        sheet.addRow([]);

        const addSummaryRow = (label: string, value: string | number, numFmt?: string) => {
            const rowNum = sheet.rowCount + 1;
            sheet.mergeCells(`A${rowNum}:D${rowNum}`);
            const labelCell = sheet.getCell(`A${rowNum}`);
            labelCell.value = label;
            labelCell.font = { bold: true };
            labelCell.alignment = { horizontal: 'center' };

            const valueCell = sheet.getCell(`E${rowNum}`);
            valueCell.value = value;
            valueCell.font = { bold: true };
            valueCell.alignment = { horizontal: 'center' };
            if (numFmt) valueCell.numFmt = numFmt;
        };

        addSummaryRow('Total Worked Hours', totalMinutes / 1440, '[h]:mm');
        addSummaryRow('Wage for per hour', member.hourlyRate ?? 'N/A');
        addSummaryRow('Total wage', Math.round((totalMinutes / 60) * (member.hourlyRate ?? 0)));

        if (member.bankName && member.bankAccount) {
            addSummaryRow(member.bankName, member.bankAccount);
        } else {
            addSummaryRow('Bank details', 'Not available');
        }

        this.applyBorderToRange(sheet, 1, sheet.rowCount, 1, 5);
    }

    applyBorderToRange(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number) {
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const cell = sheet.getCell(r, c);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            }
        }
    }
}

function formatLocalDate(year: number, month: number, day: number): string {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

export default ReportService;