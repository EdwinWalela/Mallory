require('dotenv').config();
require("ffmpeg-static");
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;
let RIDDLE_MODE = false;

const { Client } = require('discord.js');
const mongoose = require("mongoose");
const express = require("express");



const LessonRoutes = require("./routes/Lessons");
const RiddleRoutes = require("./routes/Riddles");
const HangmanRoutes = require("./routes/Hangman");

const {baseCommands,riddleCommands} = require("./callbacks/commands");

const Lesson = require("./models/Lesson");

const app = express();
const client = new Client({disableEveryone:false});

app.use(express.json())
app.use(express.urlencoded({extended:true}));


app.listen(PORT,()=>{
    console.log(`listening for requests on port ${PORT}`)
})

mongoose.connect(DB_URI,()=>{
    console.log(`Connected to DB`)
}).catch(err=>{
    console.log(`Failed to connect to db\n${err}`)
})

app.use('/api/lessons',LessonRoutes); 
app.use('/api/riddles',RiddleRoutes);
app.use('/api/hangman',HangmanRoutes);

app.get('/',(req,res)=>{
    res.send({msg:"Hello World 🌍"})
})

client.login(TOKEN);

client.on("ready",async()=>{
    console.log("Bot online");
    client.user.setActivity('Lo-Fi',{type:'LISTENING'})
})

client.on('message',async(message)=>{
    const requestTime = new Date().getMilliseconds();
    let content = message.content;
    let isBot = message.author.bot;
    let authorID = message.author.id;

    if(isBot) return;

    if(content.toLowerCase().includes("gg")){
        message.channel.send('😎');
        return
    }

    if(content.startsWith(".")){
        const [CMD,...args] = content.trim()   
            .toLowerCase()
            .substr(1,content.length)
            .split(/\s+/)
        
       RIDDLE_MODE = await baseCommands(CMD,args,message,client,requestTime)
        
    }else if(RIDDLE_MODE){
        RIDDLE_MODE = await riddleCommands(content,message.channel,authorID)    
    }
})

client.on("class-update",async(lesson)=>{
    const channel = await client.channels.fetch(process.env.CLASS_UPDATES_CHANNEL);

    let msg = lesson.startHour < 12 ? "Good morning @everyone🥳🥳\n\n" : "Heads up @everyone📢📢\n\n";

    msg += `**${lesson.title}** is about to start\n\nHere is the link 🔗\n${lesson.link}`;
   
    channel.send(msg);
})  

setInterval(async()=>{
    let date = new Date();
    let time  = date.getUTCHours() + 3;
    let day = date.getDay();
    let minute = date.getMinutes();

    let lessons = await Lesson.find({day});
    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time == 0)
    if(lessons.length != 0){
        if(minute < 10){
            client.emit("class-update",lessons[0]);
        }
    }

    console.log(`last check at ${new Date().getTime()}`)

// },5s000) //5 seconds
},9*60000) // 10 minutes

