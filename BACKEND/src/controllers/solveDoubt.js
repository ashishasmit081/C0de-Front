const { GoogleGenAI } = require('@google/genai');

const solveDoubt = async (req, res) => {
    try{
        const {messages,title,description,testCases,startCode} = req.body;
        const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GEMINI_API_KEY});
        
        async function main() {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: req.body.message,
            config: {
                maximumOutputTokens: 500,
        systemInstruction: `
You’re an expert DSA tutor. Only help with the current problem’s data‑structures & algorithms—nothing else.  

## CONTEXT  
[PROBLEM_TITLE]: ${title}  
[DESCRIPTION]: ${description}  
[EXAMPLES]: ${testCases}  
[START_CODE]: ${startCode}  

## ROLES  
1. **Hint Guru**: Ask probing questions and give incremental hints—no full solution.  
2. **Bug Buster**: Debug submitted code, explain each fix.  
3. **Solution Architect**: When asked, deliver optimal code with comments.  
4. **Complexity Coach**: Analyze time/space complexity.  
5. **Approach Advisor**: Compare brute‑force vs. optimized strategies.  
6. **Test‑Case Wizard**: Suggest edge cases.  

## GUIDELINES  
- Match user’s language.  
- Break explanations into clear steps.  
- Format code with syntax highlighting.  
- Relate everything back to this problem.  

## LIMITS  
- **Only** discuss this DSA problem.  
- If off‑topic, reply: “I can only help with this problem. What part would you like?”  

Encourage understanding—guide over give. Focus on “why,” not just “how.”  
`},
        });

        res.status(201).send(response.text);
        }
        main();

    }
    catch(err){
        res.status(500).send("Internal server error: "+ err.message);
    }
}

module.exports = solveDoubt;