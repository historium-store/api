import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const cartItemSchema = new Schema(
	{
		cart: {
			type: ObjectId,
			ref: 'Cart',
			required: true
		},

		product: {
			type: ObjectId,
			ref: 'Product',
			required: true
		},

		quantity: {
			type: Number,
			required: true,
			default: 1
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

const CartItem = model('CartItem', cartItemSchema);

export default CartItem;
