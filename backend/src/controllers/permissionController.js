const pool = require('../config/db');
const { logAudit } = require('../utils/audit');

const actionToColumn = {
    view: 'can_view',
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
    assign: 'can_assign',
};

const rowToPermission = (row) => ({
    id: row.module_key,
    label: row.module_name,
    description: row.description,
    roles: {
        admin: {
            view: Boolean(row.admin_view),
            create: Boolean(row.admin_create),
            edit: Boolean(row.admin_edit),
            delete: Boolean(row.admin_delete),
            assign: Boolean(row.admin_assign),
        },
        staff: {
            view: Boolean(row.staff_view),
            create: Boolean(row.staff_create),
            edit: Boolean(row.staff_edit),
            delete: Boolean(row.staff_delete),
            assign: Boolean(row.staff_assign),
        },
    },
});

const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pm.id AS module_id, pm.module_key, pm.module_name, pm.description, pm.sort_order,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_view ELSE 0 END) AS admin_view,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_create ELSE 0 END) AS admin_create,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_edit ELSE 0 END) AS admin_edit,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_delete ELSE 0 END) AS admin_delete,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_assign ELSE 0 END) AS admin_assign,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_view ELSE 0 END) AS staff_view,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_create ELSE 0 END) AS staff_create,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_edit ELSE 0 END) AS staff_edit,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_delete ELSE 0 END) AS staff_delete,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_assign ELSE 0 END) AS staff_assign
            FROM permission_modules pm
            LEFT JOIN role_permissions rp ON rp.module_id = pm.id
            GROUP BY pm.id, pm.module_key, pm.module_name, pm.description, pm.sort_order
            ORDER BY pm.sort_order ASC, pm.id ASC
        `);

        res.json(rows.map(rowToPermission));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không tải được dữ liệu phân quyền' });
    }
};

const updateAll = async (req, res) => {
    const permissions = req.body.permissions;
    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Dữ liệu phân quyền không hợp lệ' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        for (const modulePermission of permissions) {
            const [moduleRows] = await conn.query(
                'SELECT id FROM permission_modules WHERE module_key = ? LIMIT 1',
                [modulePermission.id]
            );
            if (!moduleRows.length) continue;

            const moduleId = moduleRows[0].id;
            for (const role of ['admin', 'staff']) {
                const roleData = modulePermission.roles?.[role] || {};
                await conn.query(`
                    INSERT INTO role_permissions
                      (module_id, role_name, can_view, can_create, can_edit, can_delete, can_assign, updated_by)
                    VALUES (?,?,?,?,?,?,?,?)
                    ON DUPLICATE KEY UPDATE
                      can_view = VALUES(can_view),
                      can_create = VALUES(can_create),
                      can_edit = VALUES(can_edit),
                      can_delete = VALUES(can_delete),
                      can_assign = VALUES(can_assign),
                      updated_by = VALUES(updated_by)
                `, [
                    moduleId,
                    role,
                    roleData.view ? 1 : 0,
                    roleData.create ? 1 : 0,
                    roleData.edit ? 1 : 0,
                    roleData.delete ? 1 : 0,
                    roleData.assign ? 1 : 0,
                    req.user.id,
                ]);
            }
        }

        await logAudit(conn, req, {
            action: 'update_permissions',
            entity_type: 'role_permissions',
            entity_id: 'all',
            new_value: permissions,
        });

        await conn.commit();
        const [rows] = await pool.query(`
            SELECT pm.id AS module_id, pm.module_key, pm.module_name, pm.description, pm.sort_order,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_view ELSE 0 END) AS admin_view,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_create ELSE 0 END) AS admin_create,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_edit ELSE 0 END) AS admin_edit,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_delete ELSE 0 END) AS admin_delete,
                   MAX(CASE WHEN rp.role_name = 'admin' THEN rp.can_assign ELSE 0 END) AS admin_assign,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_view ELSE 0 END) AS staff_view,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_create ELSE 0 END) AS staff_create,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_edit ELSE 0 END) AS staff_edit,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_delete ELSE 0 END) AS staff_delete,
                   MAX(CASE WHEN rp.role_name = 'staff' THEN rp.can_assign ELSE 0 END) AS staff_assign
            FROM permission_modules pm
            LEFT JOIN role_permissions rp ON rp.module_id = pm.id
            GROUP BY pm.id, pm.module_key, pm.module_name, pm.description, pm.sort_order
            ORDER BY pm.sort_order ASC, pm.id ASC
        `);

        res.json({ message: 'Đã lưu phân quyền', permissions: rows.map(rowToPermission) });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Không lưu được dữ liệu phân quyền' });
    } finally {
        conn.release();
    }
};

module.exports = { getAll, updateAll };
