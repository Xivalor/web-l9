import { Server } from 'socket.io';

const users = new Map();

export function initSocket(httpServer) {
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('Подключение:', socket.id);

        socket.on('join', (username) => {
            const name = username.trim() || `Пользователь_${socket.id.slice(0, 4)}`;

            users.set(socket.id, name);
            io.emit('system', `${name} присоединился к чату`);

            io.emit('userList', getUserList());

            console.log(`Пользователь ${name} (${socket.id}) вошёл`);
        });

        socket.on('chatMessage', (text) => {
            const name = users.get(socket.id) || 'Неизвестный';
            io.emit('chatMessage', {
                from: name,
                text: text.trim(),
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            });
        });

        socket.on('typing', () => {
            const name = users.get(socket.id);
            if (name) {
                socket.broadcast.emit('typing', name);
            }
        });

        socket.on('stopTyping', () => {
            const name = users.get(socket.id);
            if (name) {
                socket.broadcast.emit('stopTyping', name);
            }
        });

        socket.on('disconnect', () => {
            const name = users.get(socket.id);
            if (name) {
                users.delete(socket.id);
                io.emit('system', `${name} покинул чат`);
                io.emit('userList', getUserList());
                console.log(`Пользователь ${name} (${socket.id}) отключился`);
            }
        });
    });
}

function getUserList() {
    return Array.from(users.values());
}
