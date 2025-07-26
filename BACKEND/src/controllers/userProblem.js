const {submitBatch, getLanguageById, submitToken} = require('../utils/problemUitility');
const Problem = require('../models/dsaproblem');
const User = require('../models/user');
const Submission = require('../models/submission');
const solutionVideo = require('../models/solutionVideo')

const createProblem = async (req, res)=>{
    try{
        const {title,description,difficulty,tags,visibleTestCases,
            hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;
        
            //reference soln is in array format in schema so we loop upon it
        for(const {language, completeCode} of referenceSolution){ 
            //WE WILL BE SENDING THESE 4 ARGUMENTS TO JUDGE0
            //source_code:// language_id:// stdin://expected_output:
            const languageId = getLanguageById(language); 
            // CREATING BATCH SUBMISSION FOR JUDGE0
            const submissions = visibleTestCases.map((testcase) => ({
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: testcase.input,
                    expected_output: testcase.output
            }));
                //POSTING BATCH SUBMISSION (returns tokens)
            const submitResult = await submitBatch(submissions);
            //storing all tokens from submitResult
            const resultToken = submitResult.map((value)=>value.token);
                //GETTING BATCH SUBMISSION (final output)
            const testResult = await submitToken(resultToken);
            //LOOKUP CODES 
        const statusErrors = {4: "Wrong Answer",5: "Time Limit Exceeded",6: "Compilation Error",
        7: "Runtime Error (SIGSEGV)",8: "Runtime Error (SIGXFSZ)",9: "Runtime Error (SIGFPE)",
        10: "Runtime Error (SIGABRT)",11: "Runtime Error (NZEC)",12: "Runtime Error (Other)",
        13: "Internal Error",14: "Exec Format Error"
        };
            for(const test of testResult){
                if(test.status_id != 3){
                    //send response as per lookup code
                    const errorMessage = statusErrors[test.status_id] || "Unknown Error";
                    return res.status(400).send(errorMessage);
                } //put a return so that loop doesn't go on and on
            }
            //THIS ENTIRE PROCESS WILL BE REPEATED FOR EVERY LANGUAGE (OUTER FOR LOOP)
        }
        //AFTER CODE HAS PASSED ROR ALL LANGUAGES WE WILL NOW STORE IT IN DB
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id //in admin middleware we put id of 
                                         //admin(we are storing it in db now)
        }); 
        res.status(201).send("Problem Created Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
}

const updateProblem = async(req, res)=>{
    //intuition is that we will bring all the data from db in a form and 
    // user can edit the fields he wants and then submit the form to update
    const {id} = req.params; //PROBLEM TO BE UPDATED
    const {title,description,difficulty,tags,visibleTestCases,
            hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;
    try{
        if( !id){
           return res.status(400).send("Missing ID field");
        }
        const DSAPRoblem = await Problem.findById(id);
        if(!DSAPRoblem){
           return res.status(400).send("Problem not found");
        }
        // ------ S A M E   C O D E   A S   I N   C R E A T E   P R O B L E M ------
                    //reference soln is in array format in schema so we loop upon it
        for(const {language, completeCode} of referenceSolution){ 

            const languageId = getLanguageById(language); 
            // CREATING BATCH SUBMISSION FOR JUDGE0
            const submissions = visibleTestCases.map((testcase) => ({
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: testcase.input,
                    expected_output: testcase.output
            }));
                //POSTING BATCH SUBMISSION (returns tokens)
            const submitResult = await submitBatch(submissions);
            //storing all tokens from submitResult
            const resultToken = submitResult.map((value)=>value.token);
                //GETTING BATCH SUBMISSION (final output)
            const testResult = await submitToken(resultToken);
            
            //LOOKUP CODES 
        const statusErrors = {4: "Wrong Answer",5: "Time Limit Exceeded",6: "Compilation Error",
        7: "Runtime Error (SIGSEGV)",8: "Runtime Error (SIGXFSZ)",9: "Runtime Error (SIGFPE)",
        10: "Runtime Error (SIGABRT)",11: "Runtime Error (NZEC)",12: "Runtime Error (Other)",
        13: "Internal Error",14: "Exec Format Error"
        };
            for(const test of testResult){
                if(test.status_id != 3){
                    const errorMessage = statusErrors[test.status_id] || "Unknown Error";
                    return res.status(400).send(errorMessage);
                } 
            }
        }
        //Problem Updated (new : true Updates the problem and returns the updated document )
        // new : false returns the document before update
        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators: true, new: true}); 
        res.status(200).send(newProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err.message); //500 means server error
    }
}

const deleteProblem = async(req, res)=>{
    const {id} = req.params;

    try{
        if(!id){
            return res.status(400).send("Missing ID field");
        }
        //No need to check if problem of that id exists 
        //we are not updating, just deleting so no issue
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if( !deletedProblem){
            throw new Error("Problem is missing")
        }
        res.status(200).send("Problem Deleted Successfully");
    }
    catch(err){
        res.status(404).send("Error: "+err.message);
    }
}

const getAllProblem = async(req, res)=>{
    try{
        const AllProblems = await Problem.find({}).select('_id title difficulty tags');
        if(AllProblems.length == 0){
            return res.status(404).send("Problems not found");
        }
        res.status(200).send(AllProblems);
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemById = async(req, res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).send("Missing ID field");
        }
        const DSAProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution');
        if( !DSAProblem){
            return res.status(404).send("Problem is missing");
        }

        // finding the video using problem id
        const videos = await solutionVideo.findOne({problemId: id});
        if(videos){ //if found then send the problem with urls, thumbnail and duration to display
            
        const responseData = {
            ...DSAProblem.toObject(),
            secureUrl:videos.secureUrl,
            thumbnailUrl : videos.thumbnailUrl,
            duration : videos.duration,
        } 
  
        return res.status(200).send(responseData);
        }
                
        res.status(200).send(DSAProblem); //if video doesn't exist then simply return the problem
    }
    catch(err){
        res.status(404).send("Error: "+err.message);
    }
}

const solvedAllProblemByUser = async(req, res)=>{
    try{
        const userId = req.result._id;
        if(!userId){
            return res.status(400).send("Invalid credentials");
        }
        
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags" //select only these fields
        }); //contains entire user document but problemSolved contains only 'select' fields
        

        //we are only sending the problemSolved part of user 
        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const submittedProblem = async(req, res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;
        
        //To search the submissions collection quickly we created compound index for userId and problemId
        const ans = await Submission.find({userId, problemId}); //in array format
        if(ans.length == 0){
            res.status(200).send("No submissions");
        }
        res.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal Server error while fetching submissions")
    }
}

module.exports = {createProblem, updateProblem, deleteProblem, getAllProblem, 
                 getProblemById, solvedAllProblemByUser, submittedProblem};








