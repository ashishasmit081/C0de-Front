const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum: ['easy', 'medium', 'hard'],
        required:true
    },
    tags:{ //Array, hash map, graph, sorting
        type:String,
        enum: ['array', 'linkedList', 'graph', 'dp'],
        required:true
    },
    visibleTestCases:[ //examples (multiple so array)
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddenTestCases:[ 
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],
    startCode:[ //boilerplate code
        {
            language:{
                type:String,
                required:true
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],
    referenceSolution:[ // correct code
        {
            language:{
                type:String,
                required:true
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],
    problemCreator:{ //storing obj id of admin -
        type:Schema.Types.ObjectId, //- who made question
        ref:'user', // from collection user
        required:true
    }
},{ 
  timestamps: true
})

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;