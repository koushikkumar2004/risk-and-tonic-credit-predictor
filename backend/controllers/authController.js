const User = require('../models/User');
const Loan = require('../models/Loan');
const generateToken = require('../utils/generateToken');

const enrichUserData = async (userObj) => {
    const latestLoan = await Loan.findOne({ user: userObj._id }).sort({ createdAt: -1 });
    if (latestLoan) {
        if (!userObj.creditScore) userObj.creditScore = latestLoan.creditScore;
    }
    if (!userObj.phone || userObj.phone === '') {
        const idStr = userObj._id.toString();
        const num1 = parseInt(idStr.slice(-6, -3), 16) % 900 + 100;
        const num2 = parseInt(idStr.slice(-3), 16) % 9000 + 1000;
        userObj.phone = `+91 98${num1} ${num2}`;
    }
    if (!userObj.address || userObj.address === '') {
        userObj.address = 'Bangalore, Karnataka, India';
    }
    if (!userObj.creditScore) {
        userObj.creditScore = 720;
    }
    return userObj;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, occupation } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            occupation: occupation || 'Other'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                occupation: user.occupation,
                phone: user.phone,
                address: user.address,
                message: 'Registration successful. Please login to continue.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const enriched = await enrichUserData(user.toObject());
            res.json({
                _id: enriched._id,
                name: enriched.name,
                email: enriched.email,
                role: enriched.role,
                occupation: enriched.occupation,
                phone: enriched.phone,
                address: enriched.address,
                creditScore: enriched.creditScore,
                token: generateToken(enriched._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth employee/admin & get token
// @route   POST /api/auth/employee-login
// @access  Public
const authEmployee = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (user.role === 'admin' || user.role === 'employee') && (await user.matchPassword(password))) {
            const enriched = await enrichUserData(user.toObject());
            res.json({
                _id: enriched._id,
                name: enriched.name,
                email: enriched.email,
                role: enriched.role,
                occupation: enriched.occupation,
                phone: enriched.phone,
                address: enriched.address,
                creditScore: enriched.creditScore,
                token: generateToken(enriched._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid employee credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const enriched = await enrichUserData(user.toObject());
            res.json({
                _id: enriched._id,
                name: enriched.name,
                email: enriched.email,
                role: enriched.role,
                occupation: enriched.occupation,
                phone: enriched.phone,
                address: enriched.address,
                creditScore: enriched.creditScore
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.occupation = req.body.occupation || user.occupation;

            const updatedUser = await user.save();
            const enriched = await enrichUserData(updatedUser.toObject());

            res.json({
                _id: enriched._id,
                name: enriched.name,
                email: enriched.email,
                role: enriched.role,
                occupation: enriched.occupation,
                phone: enriched.phone,
                address: enriched.address,
                creditScore: enriched.creditScore,
                token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : generateToken(enriched._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/AdminOrEmployee
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        const loans = await Loan.find({}).sort({ createdAt: -1 });

        const usersWithDetails = users.map(user => {
            const userObj = user.toObject();
            const userLoans = loans.filter(l => l.user && l.user.toString() === user._id.toString());
            const latestLoan = userLoans[0];

            if (latestLoan) {
                if (!userObj.creditScore) {
                    userObj.creditScore = latestLoan.creditScore;
                }
            }

            if (!userObj.phone || userObj.phone === '') {
                const idStr = userObj._id.toString();
                const num1 = parseInt(idStr.slice(-6, -3), 16) % 900 + 100;
                const num2 = parseInt(idStr.slice(-3), 16) % 9000 + 1000;
                userObj.phone = `+91 98${num1} ${num2}`;
            }
            if (!userObj.address || userObj.address === '') {
                userObj.address = 'Bangalore, Karnataka, India';
            }
            if (!userObj.creditScore) {
                userObj.creditScore = 720;
            }

            return userObj;
        });

        res.json(usersWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile by Admin
// @route   PUT /api/auth/users/:id
// @access  Private/AdminOrEmployee
const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.address = req.body.address !== undefined ? req.body.address : user.address;
            user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
            user.creditScore = req.body.creditScore !== undefined ? req.body.creditScore : user.creditScore;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();
            const enriched = await enrichUserData(updatedUser.toObject());

            res.json(enriched);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    authEmployee,
    getUserProfile,
    updateUserProfile,
    getUsers,
    updateUserByAdmin,
    updateUserPassword
};
