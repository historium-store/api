import { Schema, model } from 'mongoose';
import getCartTotalPrice from '../../triggers/cart-total-price.js';

const { ObjectId } = Schema.Types;

const cartSchema = new Schema(
	{
		items: [
			{
				type: ObjectId,
				ref: 'CartItem',
				required: false
			}
		],

		user: {
			type: ObjectId,
			ref: 'User',
			required: false
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		},

		deletedAt: {
			type: Number,
			required: false
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

cartSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Cart = model('Cart', cartSchema);

export default Cart;
