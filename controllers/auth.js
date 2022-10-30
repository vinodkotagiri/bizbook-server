const User = require('../models/user')
const jwt = require('jsonwebtoken') // to generate signed token
const expressJwt = require('express-jwt') // for authorization check
const bcrypt = require('bcrypt')
const { errorHandler } = require('../helpers/dbErrorHandler')

// using promise
exports.signup = async (req, res) => {
	const { name, email, password } = req.body
	try {
		const check = await User.findOne({ email })
		if (check) return res.status(400).json('User already exists with ' + email)
		const hashed_password = await bcrypt.hash(password, 12)
		const user = await new User({
			email,
			name,
			hashed_password,
		}).save()
		res.status(201).json('Registration Succesful')
	} catch (error) {
		res.status(500).json('Something went wrong: ' + error)
	}
}

exports.signin = async (req, res) => {
	// find the user based on email
	const { email, password } = req.body
	try {
		const user = await User.findOne({ email })
		if (!user)
			return res
				.status(400)
				.json('User with that email does not exist. Please signup')
		const checkPasswd = await bcrypt.compare(password, user.hashed_password)
		// if user is found make sure the email and password match
		// create authenticate method in user model
		if (!checkPasswd) {
			return res.status(401).json('Email and password dont match')
		}
		// generate a signed token with user id and secret
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
		// persist the token as 't' in cookie with expiry date
		res.cookie('t', token, { expire: new Date() + 9999 })
		// return response with user and token to frontend client
		const { hashed_password, ...rest } = user._doc
		return res.json({ token, user: rest })
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong: ' + error })
	}
}

exports.signout = (req, res) => {
	res.clearCookie('t')
	res.json({ message: 'Signout success' })
}

exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'auth',
})

exports.isAuth = (req, res, next) => {
	let user = req.profile && req.auth && req.profile._id == req.auth._id
	if (!user) {
		return res.status(403).json({
			error: 'Access denied',
		})
	}
	next()
}

exports.isAdmin = (req, res, next) => {
	if (req.profile.role === 0) {
		return res.status(403).json({
			error: 'Admin resourse! Access denied',
		})
	}
	next()
}

/**
 * google login full
 * https://www.udemy.com/instructor/communication/qa/7520556/detail/
 */
