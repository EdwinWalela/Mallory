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

    if(isBot) return;

    if(content.startsWith(".")){
        const CMD = content.substr(1,content.length);
        switch (CMD) {
            case "ping":
                const responseTime = new Date().getMilliseconds();
                const ping = responseTime - requestTime;
                message.channel.send(`🏓 Pong! ${ping} ms`);
                break;
        
            default:
                break;
        }
    }

})

client.on("update",(msg)=>{
    // client.ch
})

// client.emit("update","AI starts soon");