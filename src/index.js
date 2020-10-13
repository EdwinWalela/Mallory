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

client.on("class-update",async(msg)=>{
    const channel = await client.channels.fetch("765523835545321472");
    channel.send(msg);
})


setInterval(()=>{
    let time  = new Date().getUTCHours() + 3;
    if(time == 8){
        //query db for classes
    }

    if(time == 14){
        // query db for classes
    }

},5000)
// },300000) // 5 minutes
