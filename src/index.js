require('dotenv').config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

const { Client } = require('discord.js');
const mongoose = require("mongoose");
const express = require("express");

const LessonRoutes = require("./routes/Lessons");
const Lesson = require("./models/Lesson");

const app = express();

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

const client = new Client({disableEveryone:false});

client.login(TOKEN);

client.on("ready",async()=>{
    console.log("Bot online");
    const channel = await client.channels.fetch(process.env.GENERAL_CHANNEL);

    const greetings = ["Hello @everyone, I'm back! 🥳","Hi @everyone, What did I miss?","Hello World 🌍","I come in peace 👽"]
    
    channel.send(greetings[Math.floor(Math.random()*greetings.length)]);
})

client.on('message',async(message)=>{
    const requestTime = new Date().getMilliseconds();
    let channel = message.channel.name;
    let content = message.content;
    let author = message.author.username;
    let isBot = message.author.bot;
    let authorID = message.author.id;

    if(isBot) return;

    if(content.startsWith(".")){
        const [CMD,...args] = content.trim()   
            .toLowerCase()
            .substr(1,content.length)
            .split(/\s+/)
        
        switch (CMD) {
            case "ping":
                const responseTime = new Date().getMilliseconds();
                const ping = responseTime - requestTime;
                if(channel.substr(1,channel.length) != "bot-commands") return;
                message.channel.send(`🏓 Pong! ${ping} ms`);
                break;
            case "next":
                if(isBot) return;
                if(channel.substr(1,channel.length) != "bot-commands") return;   
                let lesson = await nextClass();
                let activities = ["Rocket League","Amoung us","PUBG","Assignments"];

                let activity = activities[Math.floor(Math.random()*activities.length)];
             
                
                let msg = lesson.length !=0 ? 
                    `Hello <@${authorID}>, The next class is ${lesson.title} at ${lesson.startHour}.00 hrs\n\nLink 🔗: ${lesson.link}` 
                 :
                    `Hi <@${authorID}>, You have no more classes today🥳 \n\n${activity}? 😏`;

                message.channel.send(msg)

                break;

            case "help":
                
                let body = `Hi <@${authorID}>\n\n`
                body += `\`\`\`Here are the commands I can respond to:\n\n`
                body += `.ping - check latency\n`
                body += `.next - an update on when your next class starts\`\`\``
                message.channel.send(body);
                break;
            
            default:
                message.channel.send(`<@${authorID}>, I don't know that command 🥴\n\n Try  .help`)
                break;
        }
    }

})

client.on("class-update",async(lesson)=>{
    const channel = await client.channels.fetch(process.env.CLASS_UPDATES_CHANNEL);

    let msg = lesson.startHour < 12 ? "Good morning @everyone🥳🥳\n\n" : "Heads up @everyone📢📢\n\n";

    msg += `**${lesson.title}** is about to start\n\nHere is the link 🔗\n${lesson.link}`;

    channel.send(msg);
})  


setInterval(async()=>{
    let time  = new Date().getUTCHours() + 3;
    let day = new Date().getDay();

    let lessons = await Lesson.find({day});

    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time == 1)

    if(lessons.length != 0){
        client.emit("class-update",lessons[0]);
    }

// },5000) 5 seconds
},300000) // 5 minutes

const nextClass = async() =>{
    let time  = new Date().getUTCHours() + 3;
    let day = new Date().getDay();

    let lessons = await Lesson.find({day});

    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time == 1)

    if(lessons.length != 0){
        return lesson[0]
    }else{
        return [];
    }

}
