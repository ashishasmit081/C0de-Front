const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {submitCode, runCode} = require('../controllers/userSubmission');
const submitCodeRateLimiter = require('../utils/ratelimiter');

//submitting code against a question of :id
submitRouter.post('/submit/:id', userMiddleware, submitCodeRateLimiter, submitCode);
//running code against a question of :id
submitRouter.post('/run/:id', userMiddleware, submitCodeRateLimiter, runCode);


module.exports = submitRouter;  