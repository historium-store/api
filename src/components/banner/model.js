import { Schema, model } from 'mongoose';

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
		timestamps: true
	}
);

const Banner = model('Banner', bannerSchema);

export default Banner;
