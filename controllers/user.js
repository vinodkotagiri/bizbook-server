const User = require('../models/user')
const { Order } = require('../models/order')
const { errorHandler } = require('../helpers/dbErrorHandler')
const bcrypt = require('bcrypt')
exports.userById = (req, res, next, id) => {
	User.findById(id).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: 'User not found',
			})
		}
		req.profile = user
		next()
	})
}

exports.read = (req, res) => {
	req.profile.hashed_password = undefined
	req.profile.salt = undefined
	return res.json(req.profile)
}

// exports.update = (req, res) => {
//     console.log('user update', req.body);
//     req.body.role = 0; // role will always be 0
//     User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true }, (err, user) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'You are not authorized to perform this action'
//             });
//         }
//         user.hashed_password = undefined;
//         user.salt = undefined;
//         res.json(user);
//     });
// };

exports.update = async (req, res) => {
	// console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
	const { name, oldPassword, newPassword } = req.body
	console.log(req.body)
	try {
		const user = await User.findOne({ _id: req.auth._id })
		//Check if the old password is correct
		if (oldPassword && newPassword) {
			const checkPswd = await bcrypt.compare(oldPassword, user.hashed_password)
			if (!checkPswd) return res.status(401).send('Incorrect current password')
			const hashed_password = await bcrypt.hash(newPassword, 12)
			await User.findOneAndUpdate({ _id: user._id }, { name, hashed_password })
		} else {
			await User.findOneAndUpdate({ _id: user._id }, { name })
		}
		const updatedUser = await User.findOne({ _id: user._id })
		res.status(201).json({
			user: {
				_id: updatedUser._id,
				name: updatedUser.name,
			},
		})
	} catch (err) {
		res.status(500).json('something went wrong: ' + err)
	}
}

exports.addOrderToUserHistory = (req, res, next) => {
	let history = []

	req.body.order.products.forEach((item) => {
		history.push({
			_id: item._id,
			name: item.name,
			description: item.description,
			category: item.category,
			quantity: item.count,
			transaction_id: req.body.order.transaction_id,
			amount: req.body.order.amount,
		})
	})

	User.findOneAndUpdate(
		{ _id: req.profile._id },
		{ $push: { history: history } },
		{ new: true },
		(error, data) => {
			if (error) {
				return res.status(400).json({
					error: 'Could not update user purchase history',
				})
			}
			next()
		}
	)
}

exports.purchaseHistory = (req, res) => {
	Order.find({ user: req.profile._id })
		.populate('user', '_id name')
		.sort('-created')
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err),
				})
			}
			res.json(orders)
		})
}
