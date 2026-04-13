const pool = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Update payment_method ENUM
        console.log('Updating payment_method ENUM...');
        await pool.query("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash', 'transfer', 'cod') NOT NULL DEFAULT 'cash'");
        
        // 2. Add shipping_fee column
        console.log('Adding shipping_fee column...');
        // Check if column exists first to avoid errors if re-run
        const [columns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'shipping_fee'");
        if (columns.length === 0) {
            await pool.query("ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total_amount");
        } else {
            console.log('shipping_fee column already exists.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
