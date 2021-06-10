const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const users = require('./routes/users');
const PORT = process.env.PORT || 8080
const app = express();
var cors = require('cors')
const cookieParser = require('cookie-parser');
const config = require('config');


mongoose.connect('mongodb://localhost/covital', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err => {
        console.log("Could not connect to MongoDB");
        console.log(err);
    }));

app.listen(PORT, ()=>{
    console.log(`Server is running at PORT: ${PORT}`);
})
