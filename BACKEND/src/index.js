const express = require('express');
const app = express();
const path = require('path');
const _dirname = path.resolve();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis')
const problemRouter = require('./routes/problemCreate');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');


console.log("PORT_NO from .env:", process.env.PORT_NO);


const cors = require('cors');

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser())

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);

app.use(express.static(path.join(_dirname, "/FRONTEND/dist")));
app.get('/*splat', (_, res)=>{
    res.sendFile(path.resolve(_dirname, "FRONTEND", "dist", "index.html"));
})

const InitializeConnection = async ()=>{
    try{
        await Promise.all([main(), redisClient.connect()]);
        console.log("DBs connected")

        app.listen(process.env.PORT_NO,()=> {
        console.log("Port is listening")
        })
    }
    catch(err){ 
        console.log(err);
    }
}
InitializeConnection();

