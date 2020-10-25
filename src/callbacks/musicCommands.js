const YoutubePLayer = require("./youtubePlayer");
let YTplayer;
const Fuse = require("fuse.js");
const COMMANDS = ["join","leave","add","skip","pause","resume","np","help"];

const fuse = new Fuse(COMMANDS);

const baseCommands = async (CMD,args,message) =>{
    let isBot = message.author.bot;
    if(isBot) return;
    let authorID = message.author.id;
    let embed = {}
    switch (CMD) {
        case "join": // Join voice channel
            let vc = message.member.voice.channel;
            let tc = message.channel;
            if(!vc){
                message.channel.send("You need to be in a voice channel first");
                return;
            }
            YTplayer = new YoutubePLayer(vc,tc);
            await YTplayer.join();
            break;
        
        case "leave": // Leave voice channel
            if(YTplayer && YTplayer.connected){
                await YTplayer.leave();
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
            break;

        case "add": // Add music to queue
            if(YTplayer && YTplayer.connected){
                args = args.toString().replace(/,/g, ' ');
                await YTplayer.add(args)
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
            break;

        case "play": // Play music from queue
            if(YTplayer && YTplayer.connected){
                YTplayer.play()
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
           
            break;
        
        case "skip": // Skip current track
            if(YTplayer && YTplayer.connected){
                YTplayer.skip();
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
        
            break;
        
        case "pause":
            if(YTplayer && YTplayer.connected){
                YTplayer.pause()
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
            break;

        case "resume":
            if(YTplayer && YTplayer.connected){
                YTplayer.resume
                ()
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
            break;

        case "np":
            if(YTplayer && YTplayer.connected){
                YTplayer.currentTrack()
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
           
            break;

        case "clear":
            if(YTplayer && YTplayer.connected){
                YTplayer.clear()
            }else{
                message.channel.send("I'm not connected to any channel\n try \`.join\`");
            }
           
            break;

        case "queue":
            if(YTplayer){
                if(YTplayer.getQueue().length > 0){
                    let queue = YTplayer.getQueue();
                    let msg = `Current Queue 🎧[${queue.length} tracks]:\n\n`;
                    queue.forEach((vid,i) => {
                        msg+=`🔹 ${vid.title}\n`
                    });
                    embed = {
                        color:3447003,
                        description:msg
                    }
                    message.channel.send({embed});
                    return;
                }
            }
            embed = {
                color:3447003,
                description:"The queue is empty, use \` .add \` to add tracks to the queue"
            }
            message.channel.send({embed});
            break;

        case "help":
            let body = `Join a voice channel and try these commands\n\n`
            body += `\` .join \`  - Invite me to the voice channel 🎧\n\n`
            body += `\` .add [music-title]\` - Add music to the queue 🆕\n\n`
            body += `\` .play \` - play music from the queue 🎼\n\n`
            body += `\` .skip \` - skip the current playing track ⏭ \n\n`
            body += `\` .pause \` - pause the track ⏸\n\n`
            body += `\` .resume \` - resume the track ▶\n\n`
            body += `\` .np \` - current playing track ℹ\n\n`
            body += `\` .queue \` - music currently on the queue 📋\n\n`
            body += `\` .leave \` - stop playing music ⏹\n\n`

            embed = {
                color: 3447003,
                description:body
            }

            message.channel.send({embed});
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

module.exports = baseCommands;