import express from 'express';
import bodyParser from 'body-parser';
import * as store from './store.js';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

// Главная страница
app.get('/', async (req, res) => {
    const products = await store.getAll();
    res.render('index', { title: 'Ювелирный магазин', products });
});

// Страница чата (Вариант 4 — Typing Indicator)
app.get('/chat', (req, res) => {
    res.render('chat', { title: 'Чат с индикатором набора' });
});

// API Маршруты
app.get('/api/items', async (req, res) => {
    let products = await store.getAll();

    const search = req.query.search;
    if (search) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    const sort = req.query.sort;
    if (sort === 'asc') {
        products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'desc') {
        products.sort((a, b) => b.name.localeCompare(a.name));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const startIndex = (page - 1) * limit;
    const totalPages = Math.ceil(products.length / limit);
    const paginatedItems = products.slice(startIndex, startIndex + limit);

    res.json({
        items: paginatedItems,
        totalPages: totalPages,
        currentPage: page
    });
});

app.post('/api/items', async (req, res) => {
    const newItem = await store.create(req.body);
    res.status(201).json(newItem);
});

app.delete('/api/items/:id', async (req, res) => {
    const success = await store.deleteById(req.params.id);
    success ? res.sendStatus(204) : res.sendStatus(404);
});

export { app };
