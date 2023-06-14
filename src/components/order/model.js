import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const orderSchema = new Schema(
	{
		contactInfo: {
			type: ObjectId,
			ref: 'ContactInfo',
			required: true
		},

		receiverInfo: {
			type: ObjectId,
			ref: 'ContactInfo',
			required: false
		},

		gift: {
			type: Boolean,
			required: true
		},

		companyInfo: {
			type: ObjectId,
			ref: 'CompanyInfo',
			required: false
		},

		callback: {
			type: Boolean,
			required: true
		},

		deliveryInfo: {
			type: ObjectId,
			ref: 'DeliveryInfo',
			required: true
		},

		paymentType: {
			type: String,
			required: true
		},

		comment: {
			type: String,
			required: false
		},

		status: {
			name: {
				type: String,
				required: true
			},

			key: {
				type: String,
				required: true
			}
		},

		user: {
			type: ObjectId,
			ref: 'User',
			required: false
		},

		items: [
			{
				product: {
					_id: {
						type: ObjectId,
						required: true
					},

					name: {
						type: String,
						required: true
					},

					type: {
						name: {
							type: String,
							required: true
						},

						key: {
							type: String,
							required: true
						}
					},

					code: {
						type: String,
						required: false,
						unique: true
					},

					key: {
						type: String,
						required: true,
						unique: true
					},

					price: {
						type: Number,
						required: true,
						min: 0
					},

					image: {
						type: String,
						required: true
					}
				},

				quantity: {
					type: Number,
					required: true
				}
			}
		],

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

const Order = model('Order', orderSchema);

export default Order;
