const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RiddleSchema = new Schema({
    body:String,
    answer:String
})

const Lesson = mongoose.model("riddles",LessonSchema);

module.exports = Lesson;