const pool = require('../config/db');

// GET /api/metrics?member_id=
const getMetrics = async (req, res) => {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ message: 'member_id required' });
    try {
        const [rows] = await pool.query(
            'SELECT * FROM body_metrics WHERE member_id=? ORDER BY recorded_at ASC',
            [member_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/metrics
const addMetric = async (req, res) => {
    const { member_id, weight, height, body_fat, muscle_mass, notes } = req.body;
    if (!member_id || (!weight && !height))
        return res.status(400).json({ message: 'Thiếu thông tin chỉ số' });

    let bmi = null;
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);

    if (!isNaN(numWeight) && !isNaN(numHeight) && numHeight > 0) {
        const h = numHeight / 100;
        bmi = parseFloat((numWeight / (h * h)).toFixed(2));
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO body_metrics (member_id, weight, height, bmi, body_fat, muscle_mass, recorded_at, notes) VALUES (?,?,?,?,?,?,CURDATE(),?)',
            [
                member_id,
                isNaN(numWeight) ? null : numWeight,
                isNaN(numHeight) ? null : numHeight,
                bmi,
                parseFloat(body_fat) || null,
                parseFloat(muscle_mass) || null,
                notes || null
            ]
        );
        res.status(201).json({ id: result.insertId, bmi, message: 'Lưu chỉ số thành công' });
    } catch (err) {
        console.error('Add Metric Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// GET /api/metrics/logs?member_id=  (workout logs)
const getLogs = async (req, res) => {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ message: 'member_id required' });
    try {
        const [rows] = await pool.query(
            'SELECT * FROM workout_logs WHERE member_id=? ORDER BY logged_at DESC LIMIT 50',
            [member_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/metrics/logs
const addLog = async (req, res) => {
    const { member_id, exercise_name, sets, reps, weight_kg, notes } = req.body;
    if (!member_id || !exercise_name)
        return res.status(400).json({ message: 'Thiếu thông tin nhật ký' });

    const safeInt = v => {
        const n = parseInt(v);
        return isNaN(n) ? null : n;
    };
    const safeFloat = v => {
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };

    try {
        const [result] = await pool.query(
            'INSERT INTO workout_logs (member_id, exercise_name, `sets`, reps, weight_kg, notes) VALUES (?,?,?,?,?,?)',
            [
                member_id,
                exercise_name,
                safeInt(sets),
                safeInt(reps),
                safeFloat(weight_kg),
                notes || null
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Lưu nhật ký thành công' });
    } catch (err) {
        console.error('Add Workout Log Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { getMetrics, addMetric, getLogs, addLog };
