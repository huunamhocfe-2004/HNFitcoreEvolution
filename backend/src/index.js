
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/feedback', require('./routes/feedback'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
const { MulterError } = require('multer');
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Tệp tải lên quá lớn (tối đa 5MB)' });
        }
        return res.status(400).json({ message: 'Lỗi tải lên tệp: ' + err.message });
    }
    if (err.message && err.message.includes('Chỉ cho phép tải lên tệp ảnh')) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal Server Error: ' + err.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Fitcore API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
