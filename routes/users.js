const {User, validateUser} = require('../models/users');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middlewares/auth');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        if(file.mimetype === "audio/mp3"){
            cb(null, './audioFiles/')
        }else
            cb(null, './profileImages/')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "audio/webm" || file.mimetype === "audio/mp3"){
        //accepting file
        cb(null,true);
    }else {
        //rejecting file
        cb(new Error("Profile Image type should be jpeg, jpg or png"), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


router.post('/register', upload.single('profilePicture') ,async (req, res)=> {
    const {error} = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let newUser = await User.findOne({email: req.body.email});
    if (newUser) return res.status(400).send("User email already registered");

    const salt = await bcrypt.genSalt(10);
    newUser = new User({
        firstName: req.body.firstName,
        lastName:req.body.lastName,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
        accountCreatedOn: Date.now(),
        profilePicturePath:checkPicture()
    })
    function checkPicture(){
        if(req.file !== undefined)
            return req.file.filename;
        else return null
    }

    await newUser.save();
    const token = newUser.generateAuthToken();
    res.header("x-auth-token",token).send( _.pick(newUser, ["name","actualName","email","accountCreatedOn"]) );
})

router.post('/auth', async (req, res)=> {
    console.log(req.body);
    const {error} = validateAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let authUser = await User.findOne({email: req.body.email});
    if (!authUser) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(req.body.password, authUser.password);
    if(!validPassword) return res.status(400).send("Invalid email or password");

    const token = authUser.generateAuthToken();
    res.status(200).send(token);
})

router.put('/modify',upload.single('profilePicture'),async (req,res)=>{
    console.log('this is request body for put');
    console.log(req.body)

    console.log("req validated");
    const modifyUser = await User.findOne({email: req.body.email});

    modifyUser.firstName = req.body.firstName;
    modifyUser.lastName = req.body.lastName;
    modifyUser.userName= req.body.userName;
    modifyUser.email = req.body.email;
    modifyUser.about = req.body.about;
    modifyUser.address = req.body.address;
    modifyUser.country=req.body.country;
    modifyUser.state = req.body.state;
    modifyUser.zip = req.body.zip;

    if(req.file)
        modifyUser.profilePicturePath = req.file.filename;

    await modifyUser.save()
    res.status(200).send("Successfully updated your profile");

})

router.delete('/delete',auth,async (req,res)=>{
    const deleteUser = await User.findByIdAndRemove(req.user._id,{useFindAndModify: false});

    if(!deleteUser) return res.status(400).send("User not found");
    res.status(200).send(`${deleteUser.name} successfully deleted`);
})

function validateAuth(req){
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(req);
}

router.get('/getUser',auth ,async (req, res) =>{
    const giveUser = await User.findById(req.user._id,{useFindAndModify: false});
    if(!giveUser) return res.status(400).send("User not found");

    console.log("user is ");
    console.log(giveUser);
    res.status(200).send(_.pick(giveUser, ["firstName","lastName","email","accountCreatedOn", "about", "profilePicturePath", "address","country","state","zip","userName"]));
})

router.post('/audio',upload.any(), async (req,res)=>{
    let formData = req.body;
    let files = req.files;
    console.log('form data', formData, 'file' , files);
    res.sendStatus(200);
})


module.exports = router
