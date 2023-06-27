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
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

const Cart = model('Cart', cartSchema);

export default Cart;
