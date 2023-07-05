import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50
		},

		lastName: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50
		},

		phoneNumber: {
			type: String,
			required: true,
			unique: true,
			index: true
		},

		email: {
			type: String,
			required: true,
			unique: true,
			index: true
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

		temporaryPassword: {
			type: String,
			required: false
		},

		wishlist: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],

		history: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],

		products: {
			type: [
				{
					type: ObjectId,
					ref: 'Product',
					required: false
				}
			],
			required: false,
			default: []
		},

		cart: {
			type: ObjectId,
			ref: 'Cart',
			required: false
		},

		birthDate: {
			type: Number,
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
