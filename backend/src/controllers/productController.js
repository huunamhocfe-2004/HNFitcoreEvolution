const pool = require('../config/db');

// GET /api/products
const getAll = async (req, res) => {
    try {
        const where = req.query.category ? 'WHERE category=? AND is_active=1' : 'WHERE is_active=1';
        const params = req.query.category ? [req.query.category] : [];
        const [rows] = await pool.query(`SELECT * FROM products ${where} ORDER BY id DESC`, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/products
const create = async (req, res) => {
    let { name, description, category, price, stock_qty, image_url } = req.body;
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }
    if (!name || !price) return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, category, price, stock_qty, image_url) VALUES (?,?,?,?,?,?)',
            [name, description || null, category || 'other', Number(price), Number(stock_qty) || 0, image_url || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Thêm sản phẩm thành công', image_url });
    } catch (err) {
        console.error('Create Product Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// PUT /api/products/:id
const update = async (req, res) => {
    let { name, description, category, price, stock_qty, image_url, is_active } = req.body;
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }
    try {
        console.log('Update Product Payload:', req.body);
        if (req.file) console.log('File uploaded:', req.file);

        const numPrice = parseFloat(price) || 0;
        const numStock = parseInt(stock_qty) || 0;
        const numActive = is_active !== undefined ? parseInt(is_active) : 1;

        await pool.query(
            'UPDATE products SET name=?, description=?, category=?, price=?, stock_qty=?, image_url=?, is_active=? WHERE id=?',
            [
                name,
                description || null,
                category || 'other',
                numPrice,
                numStock,
                image_url || null,
                isNaN(numActive) ? 1 : numActive,
                req.params.id
            ]
        );
        res.json({ message: 'Cập nhật sản phẩm thành công', image_url });
    } catch (err) {
        console.error('Update Product Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// DELETE /api/products/:id (soft delete)
const remove = async (req, res) => {
    try {
        await pool.query('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
        res.json({ message: 'Đã ẩn sản phẩm' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/orders
const getOrders = async (req, res) => {
    try {
        let memberId = req.query.member_id;

        // Security: Members can only see their own orders
        if (req.user.role === 'member') {
            const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
            if (!mem.length) return res.status(404).json({ message: 'Member not found' });
            memberId = mem[0].id;
        }

        const where = memberId ? 'WHERE o.member_id = ?' : '';
        const params = memberId ? [memberId] : [];
        const [orders] = await pool.query(`
      SELECT o.*, u.name AS member_name, u.phone AS member_phone
      FROM orders o
      JOIN members m ON m.id = o.member_id
      JOIN users u ON u.id = m.user_id
      ${where}
      ORDER BY o.created_at DESC
    `, params);

        // Attach items for each order
        for (const order of orders) {
            const [items] = await pool.query(`
        SELECT oi.*, p.name AS product_name, p.image_url
        FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `, [order.id]);
            order.items = items;
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/orders
const createOrder = async (req, res) => {
    const { member_id, items, payment_method, shipping_fee, shipping_address, notes } = req.body;
    if (!member_id || !items?.length)
        return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let itemsTotal = 0;
        for (const item of items) {
            const [pRow] = await conn.query('SELECT price, stock_qty FROM products WHERE id=? AND is_active=1', [item.product_id]);
            if (!pRow.length) throw new Error(`Sản phẩm #${item.product_id} không tồn tại`);
            if (pRow[0].stock_qty < item.quantity) throw new Error(`Sản phẩm #${item.product_id} không đủ hàng`);
            item.unit_price = pRow[0].price;
            itemsTotal += pRow[0].price * item.quantity;
        }

        const fee = parseFloat(shipping_fee) || 0;
        const finalTotal = itemsTotal + fee;

        const [orderResult] = await conn.query(
            'INSERT INTO orders (member_id, total_amount, shipping_fee, payment_method, shipping_address, notes) VALUES (?,?,?,?,?,?)',
            [member_id, finalTotal, fee, payment_method || 'cash', shipping_address || null, notes || null]
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
                [orderId, item.product_id, item.quantity, item.unit_price]
            );
            await conn.query(
                'UPDATE products SET stock_qty = stock_qty - ? WHERE id=?',
                [item.quantity, item.product_id]
            );
        }

        await conn.commit();
        res.status(201).json({ id: orderId, total: finalTotal, message: 'Đặt hàng thành công' });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ message: err.message || 'Lỗi tạo đơn hàng' });
    } finally {
        conn.release();
    }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check current status to avoid double restoration
        const [order] = await conn.query('SELECT status FROM orders WHERE id=?', [req.params.id]);
        if (!order.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        const oldStatus = order[0].status;

        await conn.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);

        // If cancelling a non-cancelled order, restore stock
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id=?', [req.params.id]);
            for (const item of items) {
                await conn.query('UPDATE products SET stock_qty = stock_qty + ? WHERE id=?', [item.quantity, item.product_id]);
            }
        }

        await conn.commit();
        res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = { getAll, create, update, remove, getOrders, createOrder, updateOrderStatus };
