import http from 'node:http';
import { app } from './rest.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
