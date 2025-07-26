const express = require('express');
const problemRouter = express.Router();
const isAdminMiddleware = require('../middleware/isAdminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

const {createProblem, updateProblem, deleteProblem, getAllProblem, 
        getProblemById, solvedAllProblemByUser, submittedProblem} = require('../controllers/userProblem');

//Creating problem (REQUIRE ADMIN ACCESS)
problemRouter.post("/create", isAdminMiddleware, createProblem);
//Update problem (REQUIRE ADMIN ACCESS)
problemRouter.put("/update/:id", isAdminMiddleware, updateProblem);
//Delete problem (REQUIRE ADMIN ACCESS)
problemRouter.delete("/delete/:id", isAdminMiddleware, deleteProblem);

//Fetch problem (User + Admin both can fetch it so no restriction)
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);//fetch all problems
problemRouter.get("/problemById/:id",userMiddleware, getProblemById); //fetch only 1 problem
//fetching all problems solved by a specific user
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblemByUser);

//fetching all the submissions for a particular problem by user (use :pid, it is just a name)
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);


module.exports = problemRouter;