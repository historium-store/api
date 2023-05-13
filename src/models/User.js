import mongoose from 'mongoose';
const db = require('./mongo-utils/mongo-connect');

const UserSchema = mongoose.Schema(
	{
		createdAt: {
			type: Date,
			default: Date.now
		},
		updatedAt: {
			type: Date,
			default: Date.now
		},
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);
export const User = db.model('User', UserSchema);
