const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Create Admin
        const adminExists = await User.findOne({ email: 'admin@creditrisk.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin Employee',
                email: 'admin@creditrisk.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin user seeded: admin@creditrisk.com / password123');
        } else {
            console.log('Admin already exists');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
