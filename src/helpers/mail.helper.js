import { transporter } from '../config/mail.config.js'

export const sendVerificationEmail = async (email, verificationLink) => {
	try {
		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: email,
			subject: 'Verify Your Email',
			html: `
                <h1>Email Verification</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>
            `,
		}

		const result = await transporter.sendMail(mailOptions)
		console.log('Email sent successfully')
		return result
	} catch (error) {
		console.error('Error sending email:', error)
		throw error
	}
}

export const sendEmailReceipt = async (email, order) => {
	try {
		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: email,
			subject: 'Order Confirmation',
			html: `
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
                <h3>Order Details:</h3>
                <p>Order ID: ${order._id}</p>
                <p>Total: $${order.totalPrice}</p>
                <p>Status: ${order.status}</p>
                <h3>Items:</h3>
                ${order.items
									.map(
										item => `
                    <div>
                        <p>${item.food.name} x ${item.quantity}</p>
                        <p>Price: $${item.price}</p>
                    </div>
                `
									)
									.join('')}
            `,
		}

		const result = await transporter.sendMail(mailOptions)
		console.log('Order confirmation email sent successfully')
		return result
	} catch (error) {
		console.error('Error sending order confirmation email:', error)
		throw error
	}
}
