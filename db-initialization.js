import { BSON } from 'bson';
import fs from 'fs/promises';
import { MongoClient } from 'mongodb';
import path from 'path';

const importData = async () => {
	//#region
	// const client = new MongoClient(process.env.CONNECTION_STRING);
	// try {
	// 	client.connect();
	// 	const db = client.db('historium-db');
	// 	const list = await db.listCollections();
	// 	if ((await list.toArray()).length == 0) {
	// 		console.log('База не обнаружена. Происходит инициализация.');
	// 		const backupDir = process.env.BACKUP_DIR_PATH;
	// 		await fs.readdir(backupDir, async (err, data) => {
	// 			if (err) throw err;
	// 			for (const file of data) {
	// 				if (file.endsWith('.bson')) {
	// 					const collectionName = path.basename(file, '.bson');
	// 					const colection = db.collection(collectionName);
	// 					const filePath = path.join(backupDir, file);
	// 					await fs.readFile(filePath, async (err, data) => {
	// 						if (err) throw err;
	// 						let index = 0;
	// 						const documents = [];
	// 						while (data.length > index) {
	// 							index = BSON.deserializeStream(
	// 								data,
	// 								index,
	// 								1,
	// 								documents,
	// 								documents.length
	// 							);
	// 						}
	// 						console.log(
	// 							`Происходит инициализация коллекции ${collectionName}`
	// 						);
	// 						if (documents.length != 0) {
	// 							await colection.insertMany(documents);
	// 						}
	// 						console.log(
	// 							`Инициализация коллекции ${collectionName} завершина`
	// 						);
	// 					});
	// 				}
	// 			}
	// 		});
	// 	} else console.log('База обнаружена.');
	// } catch (error) {
	// 	console.log('Ошибка при работе с бд:', error);
	// 	client.close();
	// }
	//#endregion
	const client = new MongoClient(process.env.CONNECTION_STRING);

	try {
		await client.connect();

		const db = client.db('historium-db');
		const collections = await db.listCollections().toArray();

		if (collections.length != 0) {
			return;
		} else {
			console.log('База не обнаружена. Происходит инициализация.');

			const backupDir = process.env.BACKUP_DIR_PATH;
			const files = await fs.readdir(backupDir);

			for (const file of files) {
				if (file.endsWith('.bson')) {
					const collectionName = path.basename(file, '.bson');
					const colection = db.collection(collectionName);

					const filePath = path.join(backupDir, file);

					const fileData = await fs.readFile(filePath);

					let index = 0;
					const documents = [];
					while (fileData.length > index) {
						index = BSON.deserializeStream(
							fileData,
							index,
							1,
							documents,
							documents.length
						);
					}

					if (documents.length !== 0) {
						console.log(
							`Происходит инициализация коллекции ${collectionName}`
						);
						await colection.insertMany(documents).then(() => {
							console.log(
								`Инициализация коллекции ${collectionName} завершена`
							);
						});
					}
				}
			}
		}
	} catch (error) {
		console.log('Ошибка при работе с бд:', error);
	} finally {
		client.close();
	}
};

export default importData;
