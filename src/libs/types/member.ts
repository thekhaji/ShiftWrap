import {MemberStatus, MemberType} from '../enums/member.enum';
import {Types} from 'mongoose';

export interface Member {
    _id: Types.ObjectId;
    telegramId: number;
    name: string;
    username?: string;
    phone: string;
    type: MemberType;
    status: MemberStatus;
    branchId?: Types.ObjectId; //set by Boss/Admin
    hourlyRate?: number; //set by manager
    bankName?: string;  //set by manager
    bankAccount?: string; //set by manager
    createdAt: Date;
    updatedAt: Date;
}

export interface MemberInput {
    telegramId: number;
    name: string;
    username?: string;
    phone: string;
    type?: MemberType;
    status?: MemberStatus;
}