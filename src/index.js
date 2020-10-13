require('dotenv').config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;

const { Client } = require('discord.js');
const client = new Client();

client.login(TOKEN);

client.on("ready",()=>{
    console.log("Bot online");
})

client.on('message',(message)=>{
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
            case "":

                break;
            default:
            
                message.channel.send(`<@${authorID}>, I don't know that command 🥴`)
                break;
        }
    }

})

client.on("update",(msg)=>{
    client.channels.fetch("")
})

// client.emit("update","AI starts soon");