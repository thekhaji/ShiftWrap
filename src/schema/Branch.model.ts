import mongoose, { Schema } from 'mongoose';


const branchSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
},
    { timestamps: true }
);

export default mongoose.model('Branch', branchSchema);