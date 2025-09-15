const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const cleanUpTrash = require('./utils/cleanUpTrash');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Chạy cleanUpTrash mỗi ngày một lần (86400000 ms = 24 giờ)
setInterval(() => {
  cleanUpTrash().catch(err => {
    console.error('Lỗi khi dọn dẹp thùng rác:', err);
  });
}, 86400000);

// Chạy ngay khi server khởi động để dọn dẹp trước
cleanUpTrash().catch(err => {
  console.error('Lỗi khi dọn dẹp thùng rác lần đầu:', err);
});