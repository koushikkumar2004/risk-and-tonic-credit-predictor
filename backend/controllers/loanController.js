const Loan = require('../models/Loan');
const User = require('../models/User');
const Notification = require('../models/Notification');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// @desc    Apply for a new loan
// @route   POST /api/loan/apply
// @access  Private
const applyLoan = async (req, res) => {
    const {
        age, income, employmentStatus, existingLoans,
        creditScore, loanAmount, maritalStatus, paymentHistory
    } = req.body;

    try {
        // 1. Send data to Flask ML API for prediction
        let mlResponse;
        const flaskUrl = (process.env.FLASK_API_URL || 'http://127.0.0.1:5001').replace('localhost', '127.0.0.1');
        try {
            mlResponse = await axios.post(`${flaskUrl}/api/predict`, {
                age, income, employmentStatus, existingLoans,
                creditScore, loanAmount, maritalStatus, paymentHistory
            });
        } catch (mlError) {
            console.error('ML API Error:', mlError.message);
            return res.status(500).json({ message: 'Error getting ML prediction. Is Flask API running?' });
        }

        const { riskLevel, probability } = mlResponse.data;

        // 2. Save Loan Application to Database
        const loan = await Loan.create({
            user: req.user._id,
            age, income, employmentStatus, existingLoans,
            creditScore, loanAmount, maritalStatus, paymentHistory,
            riskPrediction: riskLevel,
            probabilityScore: probability,
            status: 'pending'
        });

        // Update User's creditScore and occupation in database
        const occ = employmentStatus === 'Self-Employed' ? 'Business' : (employmentStatus || 'Other');
        await User.findByIdAndUpdate(req.user._id, { creditScore, occupation: occ });
        
        // Create initial notification for loan submission
        await Notification.create({
            userId: req.user._id,
            title: 'Loan Application Submitted',
            message: `Your loan application for ${formatINR(loanAmount)} has been successfully submitted and is under review.`,
            type: 'success'
        });

        // 3. Send email confirmation to user
        try {
            const formattedAmount = formatINR(loanAmount);
            await sendEmail({
                email: req.user.email,
                subject: 'Risk & Tonic Loan Application Received',
                message: `Hi ${req.user.name}, your loan application for ${formattedAmount} has been received and is currently under review by our AI decision engine. “Because Every Loan Has a Hangover.”`,
                htmlMessage: `<h3>Risk & Tonic Loan Application Received</h3><p>Hi ${req.user.name},</p><p>Your loan application for <strong>${formattedAmount}</strong> has been received and is currently under review by our AI decision engine.</p><p>You will be notified once there is an update.</p><p><em>“Because Every Loan Has a Hangover.”</em></p>`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's loan applications
// @route   GET /api/loan/status
// @access  Private
const getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all loan applications (Employee/Admin)
// @route   GET /api/loan/all
// @access  Private/AdminOrEmployee
const getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find({}).populate('user', 'id name email occupation phone address').sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update loan status (Approve/Reject)
// @route   PUT /api/loan/:id/status
// @access  Private/AdminOrEmployee
const updateLoanStatus = async (req, res) => {
    const { status, comments } = req.body;

    try {
        const loan = await Loan.findById(req.params.id).populate('user');

        if (!loan) {
            return res.status(404).json({ message: 'Loan application not found' });
        }

        loan.status = status;
        if (comments) {
            loan.comments = comments;
        }

        const updatedLoan = await loan.save();

        // Create Notifications in MongoDB
        if (status === 'approved') {
            await Notification.create({
                userId: loan.user._id,
                title: 'Loan Application Approved',
                message: 'Your loan application has been approved.',
                type: 'success'
            });
        } else if (status === 'rejected') {
            await Notification.create({
                userId: loan.user._id,
                title: 'Loan Application Rejected',
                message: 'Your loan application has been rejected.',
                type: 'error'
            });
        }

        if (comments && comments.trim() !== '') {
            await Notification.create({
                userId: loan.user._id,
                title: 'Admin Comments Added',
                message: `Admin added comments to your application: "${comments}"`,
                type: 'info'
            });
        }

        // Send email notification about status change
        try {
            const formattedAmount = formatINR(loan.loanAmount);
            await sendEmail({
                email: loan.user.email,
                subject: `Risk & Tonic Loan Application ${status.toUpperCase()}`,
                message: `Hi ${loan.user.name}, your loan application for ${formattedAmount} has been ${status}. ${comments ? 'Comments: ' + comments : ''} “Because Every Loan Has a Hangover.”`,
                htmlMessage: `<h3>Risk & Tonic Application Update</h3><p>Hi ${loan.user.name},</p><p>Your loan application for <strong>${formattedAmount}</strong> has been <strong>${status}</strong>.</p>${comments ? `<p><strong>Notes from reviewer:</strong> ${comments}</p>` : ''}<p><em>“Because Every Loan Has a Hangover.”</em></p>`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.json(updatedLoan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLoan,
    getMyLoans,
    getAllLoans,
    updateLoanStatus
};
