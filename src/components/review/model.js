import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const reviewSchema = new Schema(
	{
		product: {
			type: ObjectId,
			ref: 'Product',
			required: true
		},
		user: {
			type: ObjectId,
			ref: 'User',
			required: true
		},
		title: {
			type: String,
			required: true
		},
		text: {
			type: String,
			required: true
		},
		likes: {
			type: Number,
			default: 0,
			required: false
		},
		dislikes: {
			type: Number,
			default: 0,
			required: false
		},
		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
			required: false
		},
		date: {
			type: Number,
			required: true
		}
	},
	{
		versionKey: false
	}
);

const Review = model('Review', reviewSchema);

export default Review;
