import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

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
			required: true,
			default: 0
		},

		dislikes: {
			type: Number,
			required: true,
			default: 0
		},

		rating: {
			type: Number,
			required: true
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

reviewSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Review = model('Review', reviewSchema);

export default Review;
