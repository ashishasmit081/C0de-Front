const axios = require('axios');

const getLanguageById = (lang) =>{
    //these id have been given by Judge0
    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }
    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions)=>{
    //JUDGE0 BATCH SUBMISSION POST AXIOS
    const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
        base64_encoded: 'false'
    },
    headers: {
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
    },
    data: {
        submissions: submissions
    }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error("Judge0 batch submission failed:", error.response?.data || error.message);
        throw error; // so it bubbles up to your catch block
        }
    }

    return await fetchData();
}
//function to wait
const waiting = async(time)=>{
    setTimeout(()=>{
        return 1;
    }, time);
}

const submitToken = async (resultToken)=>{
    const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
        //converting array to a single string separated by 
        //comma (expected by JUDGE0)
        tokens: resultToken.join(','), 
        base64_encoded: 'false',
        fields: '*'
    },
    headers: {
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error("Judge0 batch submission failed:", error.response?.data || error.message);
        throw error; // so it bubbles up to your catch block
        }
    }

    while(true){ //run until every result is obtained (status_id > 2)
       const result =  await fetchData();
        //we first check the status id of result (if it is 1
        // or 2 then it is still being processed) else
        //we may return the output .every() checks if every is true or not
        const isResultObtained = result.submissions.every((val)=>val.status_id>2);

        if(isResultObtained){ //(every status_id > 2 then return result)
            return result.submissions;
        } 
        //we will wait before running loop again (don't wanna hit the api every sec)
        await waiting(1000);
    }    
}


module.exports = {getLanguageById, submitBatch, submitToken};