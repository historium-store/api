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
			required: true
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

const basketSchema = new Schema(
	{
		items: [
			{
				type: ObjectId,
				ref: 'BasketItem',
				required: false
			}
		],
		user: {
			type: ObjectId,
			ref: 'User',
			required: true,
			unique: true
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

export const BasketItem = model('BasketItem', basketItemSchema);
export const Basket = model('Basket', basketSchema);
