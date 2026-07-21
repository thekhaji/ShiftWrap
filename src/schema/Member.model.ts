import mongoose, { Schema } from 'mongoose';
import {MemberType, MemberStatus} from '../libs/enums/member.enum';

const memberSchema = new Schema({
    telegramId: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        unique: true,
        sparse: true
    },
    phone: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: MemberType, 
        default: MemberType.USER 
    },
    status: { 
        type: String, 
        enum: MemberStatus, 
        default: MemberStatus.ACTIVE 
    },
    hourlyRate: { 
        type: Number //set by manager
    }, 
    bankName: { 
        type: String //set by manager
    },  
    bankAccount: { 
        type: String //set by manager
    }, 
},
    {timestamps: true}
);

export default mongoose.model('Member', memberSchema);

