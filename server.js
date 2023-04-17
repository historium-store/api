import { createServer } from 'http';
import app from './src/app.js';

const PORT = process.env.PORT ?? '3000';

app.set('port', PORT);

const server = createServer(app);

server.listen(PORT);

server.on('error', error => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	switch (error.code) {
		case 'EADDRINUSE':
			console.error(`Port ${PORT} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
});

server.on('listening', () => console.log(`Listening on port ${PORT}`));
