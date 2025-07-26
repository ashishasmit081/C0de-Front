const express = require('express');
const adminMiddleware = require('../middleware/isAdminMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoSection")

// frontend seeks upload signature and uploads file
videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
//after uploading frontend will send the meta data to save it
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
//route to delete a video
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);


module.exports = videoRouter;