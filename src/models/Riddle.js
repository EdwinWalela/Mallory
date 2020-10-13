const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiddleSchema = new Schema({
    body:String,
    answers:[String]
})

const Lesson = mongoose.model("riddles",RiddleSchema);

module.exports = Lesson;