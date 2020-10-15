const crypto = require("crypto");
const Lesson = require("../models/Lesson");
const riddleCallback = require("./riddle");

const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

const baseCommands = async (CMD,channel,authorID,isBot,client,requestTime) =>{
    switch (CMD) {
        case "ping":
            const responseTime = new Date().getMilliseconds();
            const ping = responseTime - requestTime;
            channel.send(`🏓 Pong! ${ping} ms`);
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

            channel.send(msg)
            break;
        
        case "riddle":
            await riddleCallback(["edwin","mallory"],channel,client);
            return true;

        case "sha256":
            const hash = crypto.createHash('sha256');
            channel.send(`\`${hash.digest('hex')}\``)
            break;
        
        case "goat":
            channel.send({files:["http://placegoat.com/600.jpg"]})
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

            channel.send({embed});
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

module.exports = {baseCommands,riddleCommands}