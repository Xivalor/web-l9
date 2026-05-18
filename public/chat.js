const socket = io();

// DOM-элементы
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const userListEl = document.getElementById('user-list');

let myName = '';
let typingTimer = null;
let isTyping = false;

// Набор имён, кто сейчас печатает (для корректного отображения нескольких)
const typingUsers = new Set();

// ── Вход в чат ──────────────────────────────────────────────
joinBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (!name) {
        usernameInput.focus();
        return;
    }
    myName = name;

    socket.emit('join', name);

    // Разблокировать форму сообщений
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();

    // Заблокировать форму входа
    usernameInput.disabled = true;
    joinBtn.disabled = true;
});

// Войти по Enter в поле имени
usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinBtn.click();
});

// ── Отправка сообщения ───────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    socket.emit('chatMessage', text);
    messageInput.value = '';

    // Остановить индикатор на нашей стороне
    stopTypingEmit();
}

// ── Индикатор набора текста ──────────────────────────────────
messageInput.addEventListener('input', () => {
    if (!myName) return;

    if (!isTyping) {
        isTyping = true;
        socket.emit('typing');
    }

    // Сбросить таймер остановки
    clearTimeout(typingTimer);
    typingTimer = setTimeout(stopTypingEmit, 1500);
});

function stopTypingEmit() {
    if (isTyping) {
        isTyping = false;
        socket.emit('stopTyping');
    }
    clearTimeout(typingTimer);
}

// ── Получение событий от сервера ────────────────────────────

// Входящее сообщение чата
socket.on('chatMessage', ({ from, text, time }) => {
    const isOwn = from === myName;
    appendMessage(from, text, time, isOwn ? 'own' : 'other');
    scrollToBottom();
});

// Системное сообщение (вход/выход)
socket.on('system', (text) => {
    appendSystem(text);
    scrollToBottom();
});

// Обновление списка участников
socket.on('userList', (users) => {
    userListEl.innerHTML = '';
    users.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        if (name === myName) li.style.fontWeight = 'bold';
        userListEl.appendChild(li);
    });
});

// Кто-то начал печатать
socket.on('typing', (name) => {
    typingUsers.add(name);
    renderTyping();
});

// Кто-то перестал печатать
socket.on('stopTyping', (name) => {
    typingUsers.delete(name);
    renderTyping();
});

// ── Вспомогательные функции ──────────────────────────────────

function renderTyping() {
    if (typingUsers.size === 0) {
        typingIndicator.textContent = '';
        typingIndicator.className = '';
        return;
    }
    const names = Array.from(typingUsers).join(', ');
    const verb = typingUsers.size === 1 ? 'печатает' : 'печатают';
    typingIndicator.innerHTML = `<span class="typing-dots">${names} ${verb}</span>`;
}

function appendMessage(from, text, time, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = `
        <div class="meta">${type === 'own' ? 'Вы' : from} · ${time}</div>
        <div>${escapeHtml(text)}</div>
    `;
    messagesDiv.appendChild(div);
}

function appendSystem(text) {
    const div = document.createElement('div');
    div.className = 'msg system';
    div.textContent = text;
    messagesDiv.appendChild(div);
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
