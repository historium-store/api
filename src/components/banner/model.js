import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const bannerSchema = new Schema(
	{
		leadsTo: {
			type: String,
			required: true
		},
		image: {
			type: String,
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
		timestamps: true,
		strict: false
	}
);

bannerSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Banner = model('Banner', bannerSchema);

export default Banner;
