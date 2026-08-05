export function getMonthsBetween(startYear: number, startMonth: number, endYear: number, endMonth: number): { year: number; month: number }[] {
    const months: { year: number; month: number }[] = [];
    let y = startYear;
    let m = startMonth;

    while (y < endYear || (y === endYear && m < endMonth)) {
        months.push({ year: y, month: m });
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }

    return months;
}