const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));

// ---------- CORS ----------
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ---------- Раздача сохранённых файлов ----------
app.use('/backups', express.static(path.join(__dirname, 'backups')));

// ---------- Сохранение ----------
app.post('/upload.php', (req, res) => {
    const { secret, code, timestamp } = req.body;
    if (secret !== 'LOOPBLADE_BACKUP') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (!code) {
        return res.status(400).json({ error: 'No code' });
    }
    const dir = path.join(__dirname, 'backups');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = path.join(dir, `loopblade_${timestamp || Date.now()}.html`);
    fs.writeFileSync(filename, code);
    res.json({ status: 'ok', file: `backups/${path.basename(filename)}`, size: code.length });
});

// ---------- Список сохранений (открывается в браузере) ----------
app.get('/list', (req, res) => {
    const dir = path.join(__dirname, 'backups');
    if (!fs.existsSync(dir)) {
        return res.send('Папка backups не найдена.');
    }
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .sort()
        .reverse(); // сначала новые

    if (files.length === 0) {
        return res.send('Сохранений пока нет.');
    }

    let html = '<h1>Сохранения Loopblade</h1><ul>';
    files.forEach(f => {
        html += `<li><a href="/backups/${f}">${f}</a></li>`;
    });
    html += '</ul>';
    res.send(html);
});

// ---------- Запуск ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
