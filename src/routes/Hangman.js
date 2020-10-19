const router = require("express").Router();
const HangmanWord = require("../models/Hangman");

router.get("/",async(req,res)=>{
    let words = await HangmanWord.find({});
    res.send({words});

})

router.post("/",async(req,res)=>{
    try{
        await new HangmanWord({
            word:req.body.word,
            category:req.body.category,
            difficulty:req.body.difficulty
        }).save();
    }catch(err){
        console.log(err)
        res.status(500).send({msg:"Error,check logs"});
    }

    res.status(201).send({msg:"New hangman word created"})
})

module.exports = router;