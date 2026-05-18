import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filename = path.join(__dirname, 'db.json');

const readData = async () => {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
};

const saveChanges = data => fs.writeFile(filename, JSON.stringify(data, null, 2));

export const getAll = async () => {
    const data = await readData();
    return data.products;
};

export const getById = async (id) => {
    const data = await readData();
    return data.products.find(item => item.id === parseInt(id));
};

export const create = async (itemData) => {
    const data = await readData();
    const newItem = { id: Date.now(), ...itemData };
    data.products.push(newItem);
    await saveChanges(data);
    return newItem;
};

export const deleteById = async (id) => {
    const data = await readData();
    const initialLength = data.products.length;
    data.products = data.products.filter(item => item.id !== parseInt(id));
    await saveChanges(data);
    return initialLength !== data.products.length;
};

export const updateById = async (id, fields) => {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...fields };
        await saveChanges(data);
        return data.products[index];
    }
    return null;
};
