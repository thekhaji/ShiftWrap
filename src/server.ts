import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import {Bot} from 'grammy'
import { memberController } from './controllers/member.controller';

mongoose.connect(process.env.MONGO_URL as string)
.then((data)=>{
    console.log("MongoDB connected successfully");
    const bot = new Bot(process.env.BOT_TOKEN as string);
    memberController(bot);
    bot.start();
})
.catch((err)=>{
    console.error("MongoDB connection error:", err);
});
