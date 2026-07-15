import {MemberStatus, MemberType} from '../enums/member.enum';

export interface Member {
    telegramId: number;
    name: string;
    username?: string;
    phone: string;
    type: MemberType;
    status: MemberStatus;
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
    hourlyRate?: number; //set by manager
    bankName?: string;  //set by manager
    bankAccount?: string; //set by manager
}