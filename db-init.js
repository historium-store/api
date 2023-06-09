import { BSON } from 'bson';
import fs from 'fs/promises';
import { MongoClient } from 'mongodb';
import path from 'path';

const importData = async () => {
	const client = new MongoClient(process.env.CONNECTION_STRING);

	try {
		await client.connect();

		const db = client.db('historium-db');
		const collections = await db.listCollections().toArray();

		for (let { name } of collections) {
			const documentCount = await db
				.collection(name)
				.countDocuments();

			if (documentCount > 0) {
				return;
			}
		}

		console.log('Base not found. Initialization in progress.');

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
						`The \'${collectionName}\' collection is being initialized`
					);
					await colection.insertMany(documents).then(() => {
						console.log(
							`\'${collectionName}\' collection initialization complete`
						);
					});
				}
			}
		}
	} catch (error) {
		console.log('Database error:', error);
	} finally {
		client.close();
	}
};

export default importData;
