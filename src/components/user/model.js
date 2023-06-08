import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const userSchema = new Schema(
	{
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
		},

		role: {
			type: String,
			required: true,
			default: 'user'
		},

		reviews: [
			{
				type: ObjectId,
				ref: 'Review',
				required: false
			}
		],

		restorationToken: {
			type: String,
			required: false
		},

		favorites: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],

		cart: {
			type: ObjectId,
			ref: 'Cart',
			required: false
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		}
	},
	{
		versionKey: false,
		timestamps: true,
		strict: false
	}
);

userSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const User = model('User', userSchema);

export default User;
