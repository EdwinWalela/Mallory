const  EMBED_BLUE = 3447003
const  EMBED_GREEN = 3066993
const  EMBED_RED = 15158332

class Hangman{
    constructor(word,category,difficulty,channel){
        this.word = word;
        this.category = category;
        this.difficulty = difficulty;
        this.startTime = new Date().getTime();
        this.guesses = [];
        this.wordProgress = [];
        this.wrongCount = 0;
        this.channel = channel;
    }

    async init(user){
        let gameInfo = `New Game Started by <@${user}>\n\n`;
        gameInfo += `**Category** : ${this.category} (${this.difficulty})\n\n**Word**\n`;

        [...this.word].forEach(c => {
            this.wordProgress.push(`🔵`)
        });

        gameInfo+=this.wordProgress;

        gameInfo+=`\n\n**How To Play**\n`
        gameInfo+=`- Guess any letter using  the command \`.guess [letter]\`\n`
        gameInfo+=`- End the game using the command \`.end\``

        this.gameEmbed = {
            color:EMBED_BLUE,
            description:gameInfo
        }

        let msg = await this.channel.send({embed:this.gameEmbed})
        this.msgID = msg
    }

    async guess(letter,user){

        let gameInfo = `**Category** : ${this.category} (${this.difficulty})\n\n**Word**\n`;

        if(this.guesses.includes(letter)){
            this.channel.send(`already guessed letter \`${letter}\``)
        }else if(this.wrongCount<7){
            this.wrongCount++;
            
        }else{
            let endMsg = `**GAME OVER 🤡**\n\n${gameInfo}${this.word.toUpperCase()}`
            this.gameEmbed = {
                color:EMBED_RED,
                description:endMsg
            }
            this.channel.send({embed:this.gameEmbed});
            let initalMsg;
            try{
                initalMsg = await this.channel.messages.fetch(this.msgID.id);
                await initalMsg.delete()
            }catch(err){
                console.log("msg already deleted")
            }
            return;
        }
        this.guesses.push(letter)
        let word = this.word;

        // a p p l e
        for (let i = 0; i < word.length; i++) {
           if(this.word[i] == letter){
                this.wordProgress[i] = `${letter.toUpperCase()}`;
           }
        }

        if(this.wordProgress.toString().replace(/,/g, '')== this.word.toUpperCase()){
            
            let endMsg = `**GG! We have a winner <@${user}>🥳🥳**\n\n${gameInfo}${this.word.toUpperCase()}`
            this.gameEmbed = {
                color:EMBED_GREEN,
                description:endMsg
            }
            this.channel.send({embed:this.gameEmbed});
            let initalMsg;
            try{
                initalMsg = await this.channel.messages.fetch(this.msgID.id);
                await initalMsg.delete()
            }catch(err){
                console.log("msg already deleted")
            }
            return;
        }

        gameInfo += this.wordProgress.toString().replace(/,/g, ' ')

        let guesses = this.guesses;
        gameInfo +=`\n\n\`Guesses: [`;

        [...guesses].forEach((letter)=>{
            gameInfo+=` ${letter.toUpperCase()} `
        })
        gameInfo+=`]\`\n`
        
        this.gameEmbed = {
            color:EMBED_BLUE,
            description:gameInfo
        }
        let initalMsg;
        try{
            initalMsg = await this.channel.messages.fetch(this.msgID.id);
            await initalMsg.delete()
        }catch(err){
            console.log("msg already deleted")
        }
        
        this.msgID = await this.channel.send({embed:this.gameEmbed})
    }
}

module.exports = Hangman;