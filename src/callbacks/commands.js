const crypto = require("crypto");
const Axios = require("axios");
const Fuse = require("fuse.js");

const Lesson = require("../models/Lesson");
const riddleCallback = require("./riddle");
const Hangman = require("./hangman");
const HangmanWord = require("../models/Hangman");

const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

let game = null;
const COMMANDS = ["ping","next","hangman","guess","end","riddle","sha256","binary","hex","goat","chuck","help"];

const fuse = new Fuse(COMMANDS);

const baseCommands = async (CMD,args,message,client,requestTime) =>{
    let isBot = message.author.bot;
    let authorID = message.author.id;
    switch (CMD) {

        case "join": // Join voice channel
            break;
        
        case "add": // Add music to queue
            break;

        case "play": // Play music from queue
            break;
        
        case "skip": // Skip current track
            break;

        case "ping":
            const responseTime = new Date().getMilliseconds();
            const ping = responseTime - requestTime;
            message.channel.send(`🏓 Pong! ${ping} ms`);
            await Axios.get('https://mallory-bot.herokuapp.com')
            break;
        case "next":
            if(isBot) return; 
            let lesson = await nextClass();
            let activities = ["Rocket League","Among us","PUBG"];
            let activity = activities[Math.floor(Math.random()*activities.length)];

            let msg = lesson.length !=0 ? 
                `Hello <@${authorID}>, The next class is ${lesson.title} at ${lesson.startHour}.00 hrs\n\nLink 🔗: ${lesson.link}` 
             :
                `Hi <@${authorID}>, You have no more classes today🥳`;

            let tomorrowClasses = await nextDayClass();

            if(tomorrowClasses.length != 0){
                msg += "\n\n**Tomorrow's classes 📚**\n\n"
                tomorrowClasses.forEach(l => {
                    msg+= `${l.title} @ ${l.startHour}.00 hrs\n` 
                });    
            }

            message.channel.send(msg)
            break;
        
        case "hangman":
            if(game && !game.isFinished){
                message.channel.send(`There is already a game in progress\n\n${game.gameInfo}`)
                return;
            }
            let gameData = await HangmanWord.find({});
            let randomIndex = Math.floor(Math.random()*gameData.length);
            let randomData = gameData[randomIndex];
            game = new Hangman(randomData.word,randomData.category,randomData.difficulty,message.channel,authorID);
            await game.init();
            break;

        case "guess":
            let choice = args[0];
            if(!game || game.isFinished){
                message.channel.send("No game in progress. You can start one with `.hangman`")
                return;
            }
            if(!choice){
                message.channel.send('You forgot to include your guess\ntry `.guess a`');
                break;
            }
            
            if(choice.length > 1){
                try{
                    await message.delete()
                }catch(err){
                    console.log("message not found")
                }
                message.channel.send('One letter at a time please\ntry `.guess a`');
                return;
            }
            await game.guess(choice,authorID)
            await message.delete();
            break;

        case "end":
           
            let initalMsg;
            if(!game){
                message.channel.send("No game in progress.You can start one with `.hangman`")
                return;
            }
            try{
                initalMsg = await message.channel.messages.fetch(game.msgID.id);
                await initalMsg.delete()
            }catch(err){
                console.log("No game")
                console.log(err)
                message.channel.send("No game in progress.You can start one with `.hangman`")
                return;
            }

            if(game.initiator != authorID){
                message.channel.send("Sorry, you can not do that");
                break;
            }

            game = null;
            let endEmbed = {
                color:3447003,
                description:`Game Ended by <@${authorID}>`
            }

            message.channel.send({embed:endEmbed})
            console.log(game.isFinished)
            break;
        
        case "riddle":
            await riddleCallback(["edwin","mallory"],message.channel,client);
            return true;

        case "sha256":
            const hash = crypto.createHash('sha256');
            hash.update(args.toString().replace(/,/g, ' '))
            message.channel.send(`\`${hash.copy().digest('hex')}\``)
            break;
        
        case "binary":
            let bstr = toBinary(args.toString().replace(/,/g, ' '));
            
            let binaryResult = {
                color:3447003,
                description:bstr
            }
            message.channel.send({embed:binaryResult})
            break;
    
        case "hex":
            let hstr = toHex(args.toString().replace(/,/g, ' '));
            
            let hexResult = {
                color:3447003,
                description:    hstr
            }
            message.channel.send({embed:hexResult})
            break;
        
        case "goat":
            message.channel.send({files:["http://placegoat.com/600.jpg"]})
            let taunt = [
                `That's what you are <@${authorID}>`,
                `All hail <@${authorID}>`,
                `Give it up for <@${authorID}>`,
                `Excuse me <@${authorID}>, you dropped your 👑`
            ]
            let index = Math.floor(Math.random()*taunt.length)
            setTimeout(()=>{
                message.channel.send(taunt[index])
            },2500)
           
            break;

        case "chuck":
            let res = await Axios.get("https://api.chucknorris.io/jokes/random");
            res = res.data.value;
            message.channel.send(res);
            break;
        case "help":
            let advice = await Axios.get("https://api.adviceslip.com/advice");
            advice = advice.data.slip.advice;
                
            let body = `Hi <@${authorID}>\n\n`
            body += `Here are the commands I can respond to:\n\n`
            body += `\` .ping \`  - check if I'm active 🏓\n\n`
            body += `\` .next \` - an update on when the next class starts📚\n\n`
            body += `\` .riddle \` - play a quick riddle game 🤓\n\n`
            body += `\`  pass \` - end the riddle game 🙅‍♂️ \n\n`
            body += `\` .hangman \` - start a hangman game 🤓\n\n`
            body += `\` .end \` - end the current hangman game 🙅‍♂️\n\n`
            body += `\` .chuck \` - get a chuck norris quote🤠\n\n`
            body += `\` .sha256 [plain-text] \` - SHA256 digest 🔐\n\n`
            body += `\` .binary [string] \` - convert string to binary 🔀\n\n`
            body += `\` .hex [string] \` - convert string to hexadecimal 🔀\n\n`
            body += `\` .goat \` - 🐏 \n\n`

            let embed = {
                color: 3447003,
                description:body
            }

            message.channel.send({embed});

            let emoji = ['✨','⛱','🎈','🌍','🌅','🌟','☄','🌙','🌞'];
            let i = Math.floor(Math.random()*emoji.length)
            advice = `${advice}${emoji[i]}`;

            message.author.send(advice);
            break;
        
        default:
            const result = fuse.search(CMD);
            if(result.length>0){
                CMD = result[0].item;
                message.channel.send(`<@${authorID}>, I don't know that command 🥴\n\n Did you mean \`.${CMD}\`?\n\n`);
            }else{
                message.channel.send(`<@${authorID}>, I don't know that command 🥴\n\n Try  .help\n\n`);
            }
            
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
                return true;
            case 2:
                channel.send("Not quite");
                return true;
            case 3:
                channel.send("Give it another shot");
                return true;

            case 4:
                let word = riddle.answers[0];
                let wordLength = word.length
                let lastChar = word[wordLength-1];
                
                channel.send(`Hint: Ends with '${lastChar}' 😉`)
                return true;

            default:
                channel.send(`Hint: Starts with '${riddle.answers[0][0]}' 😉`);
                return true;
        }
       
    }
}

const nextDayClass = async() =>{
    let day = new Date().getDay() + 1;

    let lessons = await Lesson.find({day});

    return lessons;
}

const nextClass = async() =>{
    let time  = new Date().getUTCHours() + 3;
    let day = new Date().getDay();

    let lessons = await Lesson.find({day});

    lessons = lessons.filter(lesson=> Number(lesson.startHour) - time <= 8)

    lessons = lessons.filter(lesson=> Number(lesson.startHour) >= time)

    if(lessons.length != 0){
        return lessons[0]
    }else{
        return [];
    }
}

const toBinary = (string) =>{
    let binary = "";
    [...string].forEach((c,i) => {
        binary += `${string[i].charCodeAt(0).toString(2)} `
    });
    return binary;
}

const toHex = (string)=>{
    let hex = "";
    [...string].forEach((c,i) => {
        hex += `${string[i].charCodeAt(0).toString(16)} `
    });
    return hex;
}

module.exports = {baseCommands,riddleCommands}