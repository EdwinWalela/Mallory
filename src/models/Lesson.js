const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
    title:String,
    link:String,
    startHour:Number,
    day:Number
})

const Lesson = mongoose.model("lessons",LessonSchema);

module.exports = Lesson;