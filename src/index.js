require('dotenv').config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;
let RIDDLE_MODE = false;

const { Client } = require('discord.js');
const mongoose = require("mongoose");
const express = require("express");

const riddle = require("./callbacks/riddle");

const LessonRoutes = require("./routes/Lessons");
const RiddleRoutes = require("./routes/Riddles");

const Lesson = require("./models/Lesson");
const Riddle = require("./models/Riddle");
const RiddleSession = require("./models/RiddleSession");

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
app.use('/api/riddles',RiddleRoutes);

app.get('/',(req,res)=>{
    res.send({msg:"Hello World 🌍"})
})

const client = new Client({disableEveryone:false});

client.login(TOKEN);

client.on("ready",async()=>{
    console.log("Bot online");
    const channel = await client.channels.fetch(process.env.GENERAL_CHANNEL);

    //"Hello @everyone, I'm back! 🥳","Hi @everyone, What did I miss?"
    // const greetings = ["Hello World 🌍","I come in peace 👽"]
    
    // channel.send(greetings[Math.floor(Math.random()*greetings.length)]);
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
                message.channel.send(`🏓 Pong! ${ping} ms`);
                break;
            case "next":
                if(isBot) return; 
                let lesson = await nextClass();
                let activities = ["Rocket League","Among us","PUBG","Assignments"];

                let activity = activities[Math.floor(Math.random()*activities.length)];
             
                
                let msg = lesson.length !=0 ? 
                    `Hello <@${authorID}>, The next class is ${lesson.title} at ${lesson.startHour}.00 hrs\n\nLink 🔗: ${lesson.link}` 
                 :
                    `Hi <@${authorID}>, You have no more classes today🥳 \n\n${activity}? 😏`;

                message.channel.send(msg)

                break;

            case "riddle":
                RIDDLE_MODE = true;
                await riddle(["edwin","mallory"],message.channel,client);
                break;

            case "help":
                
                let body = `Hi <@${authorID}>\n\n`
                body += `\`\`\`Here are the commands I can respond to:\n\n`
                body += `.ping - check latency\n\n`
                body += `.next - an update on when the next class starts\n\n`
                body += `.riddle - play a quick riddle game\n\n`
                body += ` pass - end the riddle game\`\`\``
                message.channel.send(body);
                break;
            
            default:
                message.channel.send(`<@${authorID}>, I don't know that command 🥴\n\n Try  .help`)
                break;
        }
    }else if(RIDDLE_MODE){
        let session = await RiddleSession.findOne({});
        let riddle = await Riddle.findById(session.current);

        if(riddle.answers.includes(content) ){
            message.channel.send(`GG <@${authorID}> 🥳`)
            RIDDLE_MODE = false;
        }else if(content == "pass" ){
            message.channel.send("Better luck next time 🙃");
        }else{
            let choice = Math.floor(Math.random()*5)
            switch (choice) {
                case 1:
                    message.channel.send("Try again");
                    break;
                case 2:
                    message.channel.send("Not quite");
                    break;

                case 3:
                    message.channel.send("Give it another shot");
                    break;

                // case 4:
                    // message.channel.send(`Hint: Ends with '${riddle.answers[0][riddle.answers.length-1]}' 😉`)
                    // break;

                default:
                    message.channel.send(`Hint: Starts with '${riddle.answers[0][0]}' 😉`);
                    break;
            }
           
           
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

// },5000) //5 seconds
},10*60000) // 10 minutes

const nextClass = async() =>{
    let time  = new Date().getUTCHours() + 3;
    let day = new Date().getDay();

    let lessons = await Lesson.find({day});

    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time <= 8)

    if(lessons.length != 0){
        return lessons[0]
    }else{
        return [];
    }
}

