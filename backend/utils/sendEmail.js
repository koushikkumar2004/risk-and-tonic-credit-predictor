const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Using Ethereal Email for development/testing
    // To use in production, replace with real SMTP (e.g., SendGrid, Mailgun)
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: '"Credit Risk System" <noreply@creditrisk.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.htmlMessage || `<p>${options.message}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
