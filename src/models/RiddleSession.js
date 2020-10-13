const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiddleSessionSchema = new Schema({
    riddleID:String,
    players:[String],
    points:[Number]
})

const Lesson = mongoose.model("riddlesessions",RiddleSessionSchema);

module.exports = Lesson;