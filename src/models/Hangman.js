const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
    word:String,
    category:String,
    difficulty:String,
})

const Lesson = mongoose.model("Hangman-words",LessonSchema);

module.exports = Lesson;