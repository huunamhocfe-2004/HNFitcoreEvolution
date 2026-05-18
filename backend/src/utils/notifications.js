const createNotification = async (db, data) => {
    try {
        const executor = db.query ? db : null;
        if (!executor || !data.user_id || !data.title) return;

        await executor.query(
            `INSERT INTO notifications
             (user_id, title, message, type, entity_type, entity_id)
             VALUES (?,?,?,?,?,?)`,
            [
                data.user_id,
                data.title,
                data.message || null,
                data.type || 'system',
                data.entity_type || null,
                data.entity_id || null,
            ]
        );
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};

module.exports = { createNotification };
