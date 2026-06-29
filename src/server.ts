import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import {Bot} from 'grammy'


mongoose.connect(process.env.MONGO_URL as string)
.then((data)=>{
    console.log("MongoDB connected successfully");
})
.catch((err)=>{
    console.error("MongoDB connection error:", err);
});

const bot = new Bot(process.env.BOT_TOKEN as string);


bot.command('start', (ctx) => ctx.reply('Hello! I am your bot.'));

bot.start();

