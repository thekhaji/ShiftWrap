import mongoose, { Schema } from 'mongoose';
import {Attendance} from '../libs/types/attendance';

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

// At most one OPEN shift per member (checkOut absent = open); closed shifts are unlimited.
attendanceSchema.index({
    memberId: 1
},
    {
        unique: true,
        partialFilterExpression: { checkOut: { $exists: false } },
    }
);

export default mongoose.model<Attendance>('Attendance', attendanceSchema);