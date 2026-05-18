async function loadItems(page = 1) {
    const search = document.getElementById('search-input').value;
    const sort = document.getElementById('sort-select').value;

    const res = await fetch(`/api/items?page=${page}&search=${search}&sort=${sort}`);
    const data = await res.json();

    renderTable(data.items);
    renderPagination(data.totalPages, data.currentPage);
}

function renderTable(items) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; 
    tbody.innerHTML = items.map(p => `
        <tr id="row-${p.id}">
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.description}</td>
            <td><button onclick="deleteItem(${p.id})">❌</button></td>
        </tr>
    `).join('');
}

function renderPagination(total, current) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.style.margin = '0 5px';
        if (i === current) btn.style.backgroundColor = '#d4af37';
        btn.onclick = () => loadItems(i);
        container.appendChild(btn);
    }
}

loadItems(1);

async function deleteItem(id) {
    if (!confirm('Удалить?')) return;
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (res.ok) document.getElementById(`row-${id}`).remove();
}

document.getElementById('add-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('desc').value;

    const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    });

    if (res.ok) loadItems(1);
};
