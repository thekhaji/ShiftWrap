import { Types } from "mongoose";

export interface Attendance{
    memberId: Types.ObjectId;
    branchId: Types.ObjectId;
    checkIn: Date;
    checkOut?: Date;    // absent = shift is open
    hourlyRate: number;  // snapshot of member's rate at check-in (check-in blocked if unset)
    reminderSentAt?: Date;   // set once by missing-checkout cron; absence = not yet nagged
    createdAt: Date;
    updatedAt: Date;
}