const pool = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
    try {
        const [[{ total_members }]] = await pool.query('SELECT COUNT(*) AS total_members FROM members');
        const [[{ active_members }]] = await pool.query('SELECT COUNT(*) AS active_members FROM members WHERE status="active"');
        const [[{ expired_members }]] = await pool.query('SELECT COUNT(*) AS expired_members FROM members WHERE status="expired"');
        const [[{ revenue_month }]] = await pool.query(
            'SELECT COALESCE(SUM(amount_paid),0) AS revenue_month FROM subscriptions WHERE MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE()) AND is_paid=1'
        );
        const [[{ new_members_month }]] = await pool.query(
            'SELECT COUNT(*) AS new_members_month FROM members WHERE MONTH(joined_date)=MONTH(CURDATE()) AND YEAR(joined_date)=YEAR(CURDATE())'
        );
        const [[{ checkins_today }]] = await pool.query(
            'SELECT COUNT(*) AS checkins_today FROM checkins WHERE DATE(checked_in_at)=CURDATE()'
        );
        const [[{ orders_pending }]] = await pool.query(
            'SELECT COUNT(*) AS orders_pending FROM orders WHERE status="pending"'
        );
        const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products WHERE is_active=1');

        // Monthly revenue for last 6 months
        const [monthlyRevenue] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, 
             SUM(amount_paid) AS revenue,
             COUNT(*) AS count
      FROM subscriptions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND is_paid=1
      GROUP BY month ORDER BY month ASC
    `);

        // Membership package distribution
        const [packageDist] = await pool.query(`
      SELECT p.title, COUNT(*) AS count
      FROM subscriptions s JOIN packages p ON p.id=s.package_id
      WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.id, p.title
    `);

        // Expiring soon (next 7 days)
        const [expiringSoon] = await pool.query(`
      SELECT u.name, u.phone, s.end_date, DATEDIFF(s.end_date, CURDATE()) AS days_left
      FROM subscriptions s
      JOIN members m ON m.id = s.member_id
      JOIN users u ON u.id = m.user_id
      WHERE s.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND s.is_paid = 1
      ORDER BY s.end_date ASC
      LIMIT 10
    `);

        res.json({
            total_members, active_members, expired_members,
            revenue_month, new_members_month, checkins_today,
            orders_pending, total_products,
            monthlyRevenue, packageDist, expiringSoon
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getStats };
