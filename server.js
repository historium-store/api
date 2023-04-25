import { createServer } from 'http';
import app from './src/app.js';

const port = process.env.PORT ?? '3000';

app.set('port', port);

const server = createServer(app);

server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
	if (error.syscall === 'listen' && error.code === 'EADDRINUSE') {
		console.error(`Port ${port} is already in use`);
		process.exit(1);
	}

	throw error;
}

function onListening() {
	console.log(`Listening on port ${port}`);
}
