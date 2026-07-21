import mongoose, { Schema } from 'mongoose';

const attendanceSchema = new Schema({
    memberId: { 
        type: Schema.Types.ObjectId,
        required: true, 
        ref: 'Member',
    },
    branchId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Branch',
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    reminderSentAt: {
        type: Date,
    }, 
},
    { timestamps: true }
);