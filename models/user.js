const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		hashed_password: {
			type: String,
			required: true,
		},
		about: {
			type: String,
			trim: true,
		},
		role: {
			type: Number,
			default: 0,
		},
		history: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
