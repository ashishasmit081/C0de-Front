const Submission = require('../models/submission');
const Problem = require('../models/dsaproblem');
const User = require('../models/user');

const {submitBatch, getLanguageById, submitToken} = require('../utils/problemUitility');

//Submit code against hidden test cases and save in DB
const submitCode = async(req, res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language} = req.body;
        if( !userId || !problemId || !code || !language){
            return res.status(400).send("Few fields are missing");
        }
        // fetch problem from database by id
        const problem = await Problem.findById(problemId);
        
        //Submitting the partial info 
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status:'pending',
            testCasesTotal:problem.hiddenTestCases.length
            })

        //JUDGE0 submission
        const languageId = getLanguageById(language); 
        // CREATING BATCH SUBMISSION FOR JUDGE0     
        const sanitizeText = (text) => {
            return text
                .replace(/[^\x00-\x7F]/g, "")  // Remove non-ASCII characters
                .replace(/\u00A0/g, " ");      // Replace non-breaking space with normal space
        };

        // Inside your submitCode function, update this block:
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: sanitizeText(code),                  // sanitize code
            language_id: languageId,
            stdin: sanitizeText(testcase.input),              // sanitize input
            expected_output: sanitizeText(testcase.output)    // sanitize output
        }));

        //POSTING BATCH SUBMISSION (returns tokens)
        const submitResult = await submitBatch(submissions);
        //storing all tokens from submitResult
        const resultToken = submitResult.map((value)=>value.token);
            //GETTING BATCH SUBMISSION (final output)
        const testResult = await submitToken(resultToken);
        // Extracting The left out information from testResult-----------------(1)
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;
        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
                //we console logged testResult to find out it's elements in JSON that we are using
                runtime += parseFloat(test.time); //test.time is time per test case 
                memory = Math.max(memory, test.memory); //memory per test case
            }
            else{
                if (test.status_id == 4) {
                    status = 'wrong answer';
                } else if (test.status_id == 5) {
                    status = 'time limit exceeded';
                } else if (test.status_id == 6) {
                    status = 'compilation error';
                } else if (test.status_id == 7) {
                    status = 'runtime error';
                }
                else{
                    status = 'error';
                } 
                errorMessage = test.stderr; //error stored in stderr              
            }            
        }
        // Storing the extracted information in DataBase-----------------(2)
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.status = status;
        submittedResult.errorMessage = errorMessage;
        await submittedResult.save(); //saving

        //Inserting problem id in User schema in (solvedproblems) if not present
        // Add problemId to problemSolved if not already present
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { problemSolved: problemId } },
            { new: true }
        );
        res.status(201).send(submittedResult);
    }
    catch(err){
        res.status(500).send("Internal Server Error "+err.message);
    }
}

//Only to run on visible test cases (we will not save in database)
const runCode = async(req, res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language} = req.body;
        if( !userId || !problemId || !code || !language){
            return res.status(400).send("Few fields are missing");
        }
        // fetch problem from database by id
        const problem = await Problem.findById(problemId);

        //  ***NOT SUBMITTING THE PARTIAL INFO ***
        //JUDGE0 submission
        const languageId = getLanguageById(language); 
        // CREATING BATCH SUBMISSION FOR JUDGE0     
        const sanitizeText = (text) => {
            return text
                .replace(/[^\x00-\x7F]/g, "")  // Remove non-ASCII characters
                .replace(/\u00A0/g, " ");      // Replace non-breaking space with normal space
        };

        // Sending VISIBLE TEST CASES HERE ***
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: sanitizeText(code),                  // sanitize code
            language_id: languageId,
            stdin: sanitizeText(testcase.input),              // sanitize input
            expected_output: sanitizeText(testcase.output)    // sanitize output
        }));

        //POSTING BATCH SUBMISSION (returns tokens)
        const submitResult = await submitBatch(submissions);
        //storing all tokens from submitResult
        const resultToken = submitResult.map((value)=>value.token);
            //GETTING BATCH SUBMISSION (final output)
        const testResult = await submitToken(resultToken);
        // *** NOT EXTRACTING THE REMAINING INFO AND NOT SUBMITTING TO DB ***   
        // Format response to match frontend expectations
            const responseData = {
            success: testResult.every(result => result.status_id === 3), // 3 = Accepted in Judge0
            testCases: testResult.map(result => ({
                stdin: result.stdin,
                expected_output: result.expected_output,
                stdout: result.stdout || '',
                status_id: result.status_id,
                error: result.stderr || result.message || ''
            })),
            runtime: testResult.reduce((max, result) => Math.max(max, parseFloat(result.time) || 0), 0), // Max runtime
            memory: testResult.reduce((max, result) => Math.max(max, result.memory || 0), 0) // Max memory
            };

            // Return formatted test result
            res.status(200).send(responseData); // Using 200 OK for run operation
    }
    catch(err){
        res.status(500).send("Internal Server Error "+err.message);
    }
}

module.exports = {submitCode, runCode};     