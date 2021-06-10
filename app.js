const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const users = require('./routes/users');
const PORT = process.env.PORT || 8080
const app = express();
var cors = require('cors')
const cookieParser = require('cookie-parser');
const config = require('config');


if(!config.get("jwtPrivateKey")){
    console.log("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser())
app.use(morgan('tiny'));
app.use(express.static('profileImages'));
app.use('/users', users);


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
