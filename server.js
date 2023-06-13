import mongoose from 'mongoose';
//import importData from './db-initialization.js';
import app from './src/app.js';
import AddressInfo from './src/components/address-info/model.js';
import CompanyInfo from './src/components/company-info/model.js';
import ContactInfo from './src/components/contact-info/model.js';
import DeliveryInfo from './src/components/delivery-info/model.js';

//importData().then(() => {
const PORT = process.env.PORT || 3000;

mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(async () => {
		// await ContactInfo.collection.drop();
		// await CompanyInfo.collection.drop();
		// await DeliveryInfo.collection.drop();
		// await AddressInfo.collection.drop();

		app.listen(PORT, () =>
			console.log(`API is listening on port ${PORT}`)
		);
	})
	.catch(err => {
		console.log(`Failed to connect to database: ${err.message}`);
	});

process.on('unhandledRejection', event => {
	console.log(event.promise);
	console.log(event.reason);
});
//});
