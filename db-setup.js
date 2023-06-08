import fs from 'fs';
import mongoose from 'mongoose';

const importData = async () => {
	try {
		const dataDir = process.env.BACKUP_DIR_PATH;
		const files = fs.readdirSync(dataDir);

		for (const file of files) {
			if (file.endsWith('.bson')) {
				const collectionName = file.slice(0, -5);
				const collectionModel = mongoose.model(collectionName);

				const bsonData = fs.readFileSync(`${dataDir}/${file}`);
				const bsonArray = Array.from(bsonData);

				await collectionModel.insertMany(bsonArray);

				console.log(
					'Данные коллекции ${collectionName} импортирован'
				);
			}
		}
		console.log('Импорт данных успешно завершен');
	} catch (err) {
		console.error('Ошибка при импорте данных:', error);
	}
};

export default importData;
