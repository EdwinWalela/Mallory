const router = require("express").Router();
const Riddle = require("../models/Riddle");
const RiddleSession = require("../models/RiddleSession");

router.get("/",async(req,res)=>{
    let riddles = await Riddle.find({});
    res.send({riddles});

})

router.post("/",async(req,res)=>{
    let answers = req.body.answers.split(",");
    try{
        await new Riddle({
            body:req.body.body,
            answers
        }).save();
    }catch(err){
        console.log(err)
        res.status(500).send({msg:"Error,check logs"});
    }

    res.status(201).send({msg:"New riddle created"})
})

module.exports = router;