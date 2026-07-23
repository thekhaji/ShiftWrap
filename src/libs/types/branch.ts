import { Types } from "mongoose";

export interface Branch {
    _id: Types.ObjectId;
    name: string;
    lat: number;
    lng: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface BranchInput {
    name: string;
    lat: number;
    lng: number;
}