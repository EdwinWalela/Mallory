const crypto = require("crypto");
const ytdl = require("ytdl-core");
const YouTube = require("discord-youtube-api")

const youtube = new YouTube(process.env.YT_API_KEY)

const Lesson = require("../models/Lesson");
const riddleCallback = require("./riddle");


const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

let playerQueue = [];
let voiceCh;

const baseCommands = async (CMD,args,message,client,requestTime) =>{
    let channel = message.channel;
    let isBot = message.author.bot;
    let authorID = message.author.id;
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
            await riddleCallback(["edwin","mallory"],channel,client);
            return true;

        case "sha256":
            const hash = crypto.createHash('sha256');
            hash.update(args.toString())
            message.channel.send(`\`${hash.copy().digest('hex')}\``)
            break;
        
        case "goat":
            message.channel.send({files:["http://placegoat.com/600.jpg"]})
            break;

        case "join":
            let voiceChannel = message.member.voice.channel;
            if(!voiceChannel){
                return message.channel.send("You need to be in a voice channel");
            }
            youtubePlayer(voiceChannel);
            break;
        
        case "add":
            let query = args.toString().replace(/,/,' ')
            if(!query){
                return message.channel.send("Remember to add a video title")
            }
            let vid = await youtube.searchVideos(query);
            await addToQueue(vid,message.channel);
            break;

        case "queue":
            let list = `Queue 🎧\n\n`;
            if(playerQueue.length!=0){
                playerQueue.forEach((vid,i) => {
                    list+=`${i+1}. ${vid.title}\n`
                });
                let embedMsg = {
                    color: 3447003,
                    description:list
                }
                message.channel.send({embed:embedMsg})
            }else{
                let embedMsg = {
                    color: 3447003,
                    description:"Queue is empty"
                }
                message.channel.send({embed:embedMsg});
            }
            break;
        case "leave":
            let channel = message.member.voice.channel;
            if(!channel){
                return message.channel.send("You need to be in the voice channel to do that");
            }
            break;
        case "help":
            let body = `Hi <@${authorID}>\n\n`
            body += `Here are the commands I can respond to:\n\n`
            body += `\` .ping \`  - check if I'm active 🏓\n\n`
            body += `\` .next \` - an update on when the next class 📚\n\n`
            body += `\` .riddle \` - play a quick riddle game \n\n`
            body += `\`  pass \` - end the riddle game 🙅‍♂️ \n\n`
            body += `\` .sha256 [plain-text] \` - SHA256 digest \n\n`
            body += `\` .goat \` - 🐏 \n\n`

            let embed = {
                color: 3447003,
                description:body
            }

            message.channel.send({embed});
            break;
        
        default:
            channel.send(`<@${authorID}>, I don't know that command 🥴\n\n Try  .help`)
            break;
    }
}

const riddleCommands = async (answer,channel,authorID) =>{
    let session = await RiddleSession.findOne({});
    let riddle = await Riddle.findById(session.current);

    if(riddle.answers.includes(answer.toLowerCase())){
        channel.send(`GG <@${authorID}> 🥳`)
        return false
    }else if(answer.toLowerCase() == "pass" ){
        channel.send("Better luck next time 🙃");
        return false
    }else{
        let choice = Math.floor(Math.random()*5)
        switch (choice) {
            case 1:
                channel.send("Try again");
                break;
            case 2:
                channel.send("Not quite");
                break;
            case 3:
                channel.send("Give it another shot");
                break;

            case 4:
                let word = riddle.answers[0];
                let wordLength = word.length
                let lastChar = word[wordLength-1];
                
                channel.send(`Hint: Ends with '${lastChar}' 😉`)
                break;

            default:
                channel.send(`Hint: Starts with '${riddle.answers[0][0]}' 😉`);
                break;
        }
       
    }
}

const nextClass = async() =>{
    let time  = new Date().getUTCHours() + 3;
    let day = new Date().getDay();

    let lessons = await Lesson.find({day});

    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time <= 8)

    lessons = lessons.filter(lesson=> Number(lesson.startHour) > time)

    if(lessons.length != 0){
        return lessons[0]
    }else{
        return [];
    }
}

const joinVoice = async(channel) =>{
    try{
        voiceCh = await channel.join()
    }catch(err){
        console.log(err);
        return;
    }
}

const addToQueue = async(vid,channel) =>{
    const info = await ytdl.getInfo(vid.id);
    const video = {
        title:info.videoDetails.title,
        url:info.videoDetails.url
    }
    playerQueue.push(video);

    let embed = {
        color: 3447003,
        description:`${video.title} has been added to the queue`
    }

    return channel.send({embed});
}

module.exports = {baseCommands,riddleCommands}