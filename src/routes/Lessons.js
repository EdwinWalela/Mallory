const router = require("express").Router();
const Lesson = require("../models/Lesson");

router.get('/',async(req,res)=>{
    let lessons = await Lesson.find({});
    res.send({
        "msg":"OK",
        lessons
    })
})

router.post('/',async(req,res)=>{
    let lesson = {
        title:req.body.title.trim(),
        link:req.body.link.trim(),
        startHour:Number(req.body.starthour),
        day:Number(req.body.day)
    };
    
    try{
        await new Lesson(lesson).save();
    }catch(err){
        console.log("Failed to create lesson:\n"+err)
        res.status(500).send({msg:"error,check logs"})
    }

    res.status(201).send({
        msg:"new lesson created"
    })
})

module.exports = router