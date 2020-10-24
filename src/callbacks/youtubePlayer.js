class YoutubePlayer{

    constructor(vc){
        this.queue = [];
        this.channel = vc;
        this.nowPlaying = "";
        this.connection = "";
        this.connected = false;
    }

    async join(){
        try{
            this.connection = await this.channel.join();
        }catch(err){
            console.log(`Unable to join Voice channel\n${nerr}`)
        }
        this.connected = true;
    }

    async leave(){
        await this.channel.leave();
    }
    add(){

    }

    play(){

    }

    skip(){

    }

    clear(){

    }

}

module.exports = YoutubePlayer;