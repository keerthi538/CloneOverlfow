const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const answerSchema = new Schema({
//     author: String,
//     content: String
// })

const answerType = {
    content: String,
    author: String
}


const questionSchema = new Schema({
    head: {
        type: String,
        // required: true
    },
    body: {
        type: String,
        // required: true
    },
    author:{
        type: String
    },
    answers: [answerType],
    

}, { timestamps: true});

const Question = mongoose.model('Question', questionSchema)

module.exports = Question;