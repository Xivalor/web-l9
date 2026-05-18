import { Server } from 'socket.io';

// Хранилище подключённых пользователей: socketId -> username
const users = new Map();

export function initSocket(httpServer) {
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('Подключение:', socket.id);

        // 1. Пользователь входит в чат с именем
        socket.on('join', (username) => {
            const name = username.trim() || `Пользователь_${socket.id.slice(0, 4)}`;
            users.set(socket.id, name);

            // Уведомить всех о новом участнике
            io.emit('system', `${name} присоединился к чату`);

            // Отправить обновлённый список участников всем
            io.emit('userList', getUserList());

            console.log(`Пользователь ${name} (${socket.id}) вошёл`);
        });

        // 2. Получение сообщения из чата
        socket.on('chatMessage', (text) => {
            const name = users.get(socket.id) || 'Неизвестный';
            // Рассылаем сообщение всем клиентам
            io.emit('chatMessage', {
                from: name,
                text: text.trim(),
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            });
        });

        // 3. Индикатор набора текста — пользователь начал печатать
        socket.on('typing', () => {
            const name = users.get(socket.id);
            if (name) {
                // Уведомить всех, кроме отправителя
                socket.broadcast.emit('typing', name);
            }
        });

        // 4. Индикатор набора текста — пользователь перестал печатать
        socket.on('stopTyping', () => {
            const name = users.get(socket.id);
            if (name) {
                socket.broadcast.emit('stopTyping', name);
            }
        });

        // 5. Отключение
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
