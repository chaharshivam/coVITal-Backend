const express = require('express');
const limitter = require('express-rate-limit');

const app = express();

app.use(RateLimit({
    windowMs: 10000,
    max: 5,
    message:{
        code:429,
        message: "too many requests",
    }
}))

const registerLimitter = limitter({
    windowsMs: 10000,
    max: 5
})

const middlewareToLogOnConsole = function (req,res,next){
    console.log(req.rateLimit);
    if(req.rateLimit.remaining === 0){
        console.log("DDOS HAPPENED !!!");
    }
    else
        console.log("everything is fine")
    next();
}

app.get('/',registerLimitter,middlewareToLogOnConsole,(req,res)=>{
    res.send("hello how are you");
})
app.listen(8080,()=>{
    console.log("Server started at 8080")
})
