import { Schema, model } from 'mongoose';
import getBasketTotalPrice from '../../triggers/basket-total-price.js';

const { ObjectId } = Schema.Types;

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

basketSchema.virtual('totalPrice').get(async function () {
	return await getBasketTotalPrice(this);
});

const Basket = model('Basket', basketSchema);

export default Basket;
