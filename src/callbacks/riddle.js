const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

const riddleGame = async(players,channel) => {
    // Get riddles from db
    let riddles = await Riddle.find({});
    let points = [];

    // Create a riddle session
    players.forEach(player => {
        points.push(0);
    });
    
    let session = await new RiddleSession({players,points});
    
    // start game
    channel.send('Game starts in 5 seconds...');
    
    // implement pause and countdown
    console.log(riddles)

    riddles.forEach(riddle=>{
        setTimeout(()=>{
            channel.send(`> ${riddle.body}`)
        },3000)
    })

    

}

module.exports = riddleGame