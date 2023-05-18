import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const sectionSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		products: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],
		sections: [
			{
				type: ObjectId,
				ref: 'Section',
				required: false
			}
		]
	},
	{
		versionKey: false
	}
);

export default model('Section', sectionSchema);
