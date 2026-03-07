const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 👇 Cho phép serve file HTML
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/quanlyhanghoa')
    .then(() => console.log("✅ Đã kết nối MongoDB"))
    .catch(err => console.error("❌ Lỗi kết nối:", err));

const ProductSchema = new mongoose.Schema({
    maSP: String,
    tenSP: String,
    giaSP: String,
    moTa: String
});

const Product = mongoose.model('Product', ProductSchema, 'sanpham');

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));