const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "trialRequests.json");
const STATUSES = ["pending", "approved", "cancelled"];

const clean = (value) => String(value || "").trim();

const readStore = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const rows = JSON.parse(raw);
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }
    throw err;
  }
};

const writeStore = async (rows) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
};

const create = async (req, res) => {
  const name = clean(req.body.name);
  const phone = clean(req.body.phone);
  const goal = clean(req.body.goal);
  const desiredDate = clean(req.body.desired_date);

  if (!name || !phone || !goal || !desiredDate) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin tập thử" });
  }

  if (Number.isNaN(Date.parse(desiredDate))) {
    return res.status(400).json({ message: "Ngày muốn tập không hợp lệ" });
  }

  try {
    const rows = await readStore();
    const request = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      name,
      phone,
      goal,
      desired_date: desiredDate,
      status: "pending",
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    };

    rows.unshift(request);
    await writeStore(rows);

    if (req.io) {
      req.io.emit("new-trial-request", {
        id: request.id,
        name: request.name,
        phone: request.phone,
      });
    }

    res.status(201).json({ message: "Đã gửi yêu cầu tập thử", request });
  } catch (err) {
    console.error("Create trial request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const rows = await readStore();
    const status = clean(req.query.status);
    const filtered = STATUSES.includes(status)
      ? rows.filter((row) => row.status === status)
      : rows;

    res.json(filtered);
  } catch (err) {
    console.error("Get trial requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const hasPending = async (req, res) => {
  try {
    const rows = await readStore();
    const count = rows.filter((row) => row.status === "pending").length;
    res.json({ hasNew: count > 0, count });
  } catch (err) {
    console.error("Count trial requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateStatus = async (req, res) => {
  const status = clean(req.body.status);
  if (!["approved", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    const rows = await readStore();
    const index = rows.findIndex((row) => row.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu tập thử" });
    }

    rows[index] = {
      ...rows[index],
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user?.id || null,
    };

    await writeStore(rows);

    if (req.io) {
      req.io.emit("trial-request-updated", {
        id: rows[index].id,
        status,
      });
    }

    res.json({ message: "Đã cập nhật yêu cầu tập thử", request: rows[index] });
  } catch (err) {
    console.error("Update trial request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { create, getAll, hasPending, updateStatus };
