const ytdl = require("ytdl-core");
const Youtube = require("discord-youtube-api");

const youtube = new Youtube(process.env.YT_API_KEY);

class YoutubePlayer{

    constructor(vc,tc){
        this.queue = [];
        this.channel = vc;
        this.nowPlaying = "";
        this.connection = "";
        this.connected = false;
        this.tc = tc;
        this.isPlaying = false;
        this.playingTrack = "";
    }

    async join(){
        try{
            this.connection = await this.channel.join();
        }catch(err){
            this.channel.leave();
            console.log(`Unable to join Voice channel\n${err}`)
        }
        this.connected = true;
    }

    async leave(){
        await this.channel.leave();
        this.connected = false;
    }

    async add(query){
        let vid;
        try{
            vid = await youtube.searchVideos(query);
        }catch(err){
            console.log(err);
            let embed = {
                color:3447003,
                description:`Unable to add video to queue`
            }
            this.tc.send({embed})
            return;
        }
        let embed = {
            color:3447003,
            description:`${vid.title} added to queue`
        }
        let newVid = {
            title: vid.title,
            url:vid.url
        }
       this.queue.push(newVid);
        this.tc.send({embed})
        
    }

    play(){
        if(this.queue.length > 0){
            let embed = {
                color:3447003,
                description:`Now playing ${this.queue[0].title}`
            }
            this.tc.send({embed})
            this.isPlaying = true;
            this.playingTrack = this.queue.shift();

            this.connection
                .play(ytdl(this.playingTrack.url,{
                    quality:'highestaudio',
                    highWaterMark:1<<25
                }))
                .on("finish",()=>{
                    console.log("finished playing song");
                    this.queue.shift();
                    this.play();
                })
                .on("error",console.log)
        }else{
            let embed = {
                color:3447003,
                description:`Queue is empty, Use \`.add \` to add a track to the queue`
            }
            this.tc.send({embed})
        }
    }

    skip(){
        if(this.queue.length > 0){
            this.play();
        }else{
            let embed = {
                color:3447003,
                description:`Queue is empty, use \`.add \` to add a new track`
            }
            this.tc.send({embed})
        }
    }

    currentTrack(){
        if(this.isPlaying){
            let embed = {
                color:3447003,
                description:`Now playing: ${this.playingTrack.title}`
            }
            this.tc.send({embed})
        }else{
            let embed = {
                color:3447003,
                description:`No track is playing, use \`.play \` to play a track from the queue`
            }
            this.tc.send({embed})
            
        }
    }

    pause(){
        if(this.isPlaying){
            this.connection.dispatcher.pause();
        }
    }

    resume(){
        if(this.isPlaying){
            this.connection.dispatcher.resume();
        }
    }

    clear(){
        if(this.queue.length >0){
            let embed = {
                color:3447003,
                description:`Queue has been cleared`
            }
            this.queue = [];
            this.tc.send({embed})
        }else{
            let embed = {
                color:3447003,
                description:`Queue is already empty`
            }
            this.tc.send({embed})
        }
    }

    getQueue(){
        return this.queue;
    }

}

module.exports = YoutubePlayer;