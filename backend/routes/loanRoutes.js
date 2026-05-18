const express = require('express');
const router = express.Router();
const { applyLoan, getMyLoans, getAllLoans, updateLoanStatus } = require('../controllers/loanController');
const { protect, adminOrEmployee } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyLoan);
router.get('/status', protect, getMyLoans);
router.get('/all', protect, adminOrEmployee, getAllLoans);
router.put('/:id/status', protect, adminOrEmployee, updateLoanStatus);

module.exports = router;
