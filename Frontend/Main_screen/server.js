const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

// 1. Cấu hình Middleware
app.use(cors());
app.use(express.json());

// 2. Định nghĩa các Route (Lên trên app.listen)

// Route lấy dữ liệu từ file JSON
app.get('/data', (req, res) => {
    fs.readFile('test.json', 'utf8', (err, data) => {
        if (err) {
            // Nếu file chưa tồn tại (lần đầu chạy), trả về mảng rỗng
            return res.json([]);
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            res.status(500).send('Lỗi định dạng file JSON');
        }
    });
});

// Route ghi dữ liệu vào file JSON
app.post('/save', (req, res) => {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFile('test.json', data, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Lỗi khi ghi file');
        }
        res.send('Đã lưu thành công');
    });
});

// 3. Khởi động Server (Luôn để ở cuối cùng)
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});