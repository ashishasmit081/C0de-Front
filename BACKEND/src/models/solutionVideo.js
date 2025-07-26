const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
   },
   cloudinaryPublicId: { //public id is like file name(helpful for queries)
    type: String,
    required: true,
    unique: true
  },
  secureUrl: { //https format
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
},{
    timestamps:true
});

const SolutionVideo = mongoose.model("solutionVideo",videoSchema);
module.exports = SolutionVideo;
