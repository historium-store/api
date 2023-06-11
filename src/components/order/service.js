import AddressInfo from '../address-info/model.js';
import CompanyInfo from '../company-info/model.js';
import ContactInfo from '../contact-info/model.js';
import DeliveryInfo from '../delivery-info/model.js';
import Order from './model.js';

const createOne = async orderData => {
	const { contactInfo, receiverInfo, companyInfo, deliveryInfo } =
		orderData;

	try {
		companyInfo.addressInfo = (
			await AddressInfo.create(companyInfo.addressInfo)
		).id;
		deliveryInfo.addressInfo = (
			await AddressInfo.create(deliveryInfo.addressInfo)
		).id;
		deliveryInfo.contactInfo = (
			await ContactInfo.create(deliveryInfo.contactInfo)
		).id;

		return await Order.create({
			...orderData,
			contactInfo: (await ContactInfo.create(contactInfo)).id,
			receiverInfo: (await ContactInfo.create(receiverInfo)).id,
			companyInfo: (await CompanyInfo.create(companyInfo)).id,
			deliveryInfo: (await DeliveryInfo.create(deliveryInfo)).id
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
