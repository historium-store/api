import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const basketItemSchema = new Schema(
	{
		basket: {
			type: ObjectId,
			ref: 'Basket',
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

const BasketItem = model('BasketItem', basketItemSchema);

export default BasketItem;
