const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

function sleep(milliseconds){
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

const riddleGame = async(players,channel,client) => {

    // channel.send('Game starts in 5 seconds...');

    await RiddleSession.collection.drop();
    
    // Get riddles from db
    let riddle = await Riddle.find({});
    let random = Math.floor(Math.random()*riddle.length-1);
    console.log(riddle)
    console.log(random)

    riddle = riddle[random];
    let points = [];
    // Create a riddle session
    players.forEach(player => {
        points.push(0);
    });
    
    let answered = [];
    let current = riddle._id;
    let session = {players,points,answered,current}

    await new RiddleSession({players,points,answered,session,current}).save();
    
    // start game
    
    // implement pause and countdown
    // sleep(10000);

    channel.send(`> ${riddle.body}`);

}

module.exports = riddleGame