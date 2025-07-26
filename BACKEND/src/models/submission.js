const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java'] 
  },
  status: {
    type: String,
      enum: ['pending','accepted','wrong answer',
        'time limit exceeded','compilation error','runtime error','error'],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  // Recommended addition
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});

//combining user id and problem id to make a compound index
// user id and problem id are marked as index : true in schema also
submissionSchema.index({userId: 1, problemId: 1});

const Submission = mongoose.model("submission", submissionSchema)

module.exports = Submission;