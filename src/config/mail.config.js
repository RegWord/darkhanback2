import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true для 465 порта, false для других портов
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Проверка подключения
transporter.verify((error, success) => {
    if (error) {
        console.log('Error with email server:', error);
    } else {
        console.log('Email server is ready');
    }
});
