const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    age: { type: Number, required: true },
    income: { type: Number, required: true },
    employmentStatus: { type: String, required: true },
    existingLoans: { type: Number, required: true },
    creditScore: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    maritalStatus: { type: String, required: true },
    paymentHistory: { type: String, required: true },
    
    riskPrediction: { 
        type: String, 
        enum: ['Low Risk', 'Medium Risk', 'High Risk'],
        required: true
    },
    probabilityScore: { type: Number, required: true },
    
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    comments: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
