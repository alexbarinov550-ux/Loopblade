const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Разрешаем JSON размером до 10 МБ
app.use(express.json({ limit: '10mb' }));

// Обработчик загрузки
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

    res.json({ status: 'ok', file: filename, size: code.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));