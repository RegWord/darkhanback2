import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, verificationLink) => {
    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
        `
    };

    await transporter.sendMail(mailOptions);
}; 