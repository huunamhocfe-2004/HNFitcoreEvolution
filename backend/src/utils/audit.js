const logAudit = async (db, req, payload) => {
    try {
        const executor = db.query ? db : null;
        if (!executor) return;

        await executor.query(
            `INSERT INTO audit_logs
             (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
             VALUES (?,?,?,?,?,?,?,?)`,
            [
                req.user?.id || null,
                payload.action,
                payload.entity_type,
                payload.entity_id != null ? String(payload.entity_id) : null,
                payload.old_value == null ? null : JSON.stringify(payload.old_value),
                payload.new_value == null ? null : JSON.stringify(payload.new_value),
                req.ip || null,
                req.get?.('user-agent') || null,
            ]
        );
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

module.exports = { logAudit };
