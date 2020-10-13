const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiddleSessionSchema = new Schema({
    players:[String],
    points:[Number],
    answered:[String],
    current:String,
})

const Lesson = mongoose.model("riddlesessions",RiddleSessionSchema);

module.exports = Lesson;