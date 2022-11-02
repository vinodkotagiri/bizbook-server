const SibApiV3Sdk = require('sib-api-v3-sdk')

//Create a new instance and api key
const client = SibApiV3Sdk.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.SENDINBLUE_API
//create new transaction email instance
const mailOptions = new SibApiV3Sdk.TransactionalEmailsApi()
//Specify the sender
const sender = {
	email: 'noreply@bizbook.io',
	name: 'BizBook.io',
}

//For Sending Reset Code
const sendResetEmail = (email, token) => {
	const recipients = [
		{
			email: email,
		},
	]
	mailOptions
		.sendTransacEmail({
			sender,
			to: recipients,
			subject: 'WRITZER password reset code',
			htmlContent: `<p>Your password reset code is: <mark>${token}</mark></p>`,
		})
		.then(console.log)
		.catch(console.log)
}

//For Sending User Creation Mail
const emailUserDetails = (name, email, password) => {
	const recipients = [
		{
			email: email,
		},
	]
	mailOptions
		.sendTransacEmail({
			sender,
			to: recipients,
			subject: 'WRITZER account created',
			htmlContent: `
        <h1>Hi ${name}</h1>
        <p>Your WRITZER CMS account has been created successfully.</p>
        <h3>Your login details</h3>
        <p style="color:red;">Email: ${email}</p>
        <p style="color:red;">Password: ${password}</p>
        <small>We recommend you to change your password after login.</small>
        `,
		})
		.then(console.log)
		.catch(console.log)
}

const sendContactMail = ({ name, email, message }) => {
	const recipients = [
		{
			email: email,
		},
	]
	mailOptions
		.sendTransacEmail({
			sender,
			to: recipients,
			subject: 'Email received from WRITZER contact form',
			htmlContent: `
        <h3>Contact form message</h3>
		<p><u>Name</u></p>
		<p>${name}</p>
		<p><u>Email</u></p>
		<p>${email}</p>
		<p><u>Message</u></p>
		<p>${message}</p>
        `,
		})
		.then(console.log)
		.catch(console.log)
}
const sendOrderMail = (order) => {
	const recipients = [
		{
			email: 'mernfsd@gmail.com',
		},
	]
	mailOptions
		.sendTransacEmail({
			sender,
			to: recipients,
			subject: `A new order is received`,
			htmlContent: `
            <p>Customer name:</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>
        `,
		})
		.then(console.log)
		.catch(console.log)
}
module.exports = {
	sendResetEmail,
	emailUserDetails,
	sendContactMail,
	sendOrderMail,
}
