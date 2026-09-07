import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "finances.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial data starts clean from zero as requested by the user
function getInitialData() {
  return {
    monthlyIncome: 0,
    cards: [],
    expenses: [],
    lastUpdated: new Date().toISOString(),
  };
}

// Load data or initialize
function readFinances() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading data file, using default:", err);
  }
  const initial = getInitialData();
  saveFinances(initial);
  return initial;
}

function saveFinances(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving data file:", err);
    return false;
  }
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const validUser = "adm";
  const validPass = "isisadm";

  if (
    username &&
    password &&
    username.trim().toLowerCase() === validUser.toLowerCase() &&
    password === validPass
  ) {
    const token = "token_" + Buffer.from(`adm:${Date.now()}`).toString("base64");
    res.json({
      success: true,
      user: { username: "adm", name: "Administrador" },
      token,
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: "Usuário ou senha incorretos.",
  });
});

// GET all finances
app.get("/api/finances", (_req, res) => {
  const data = readFinances();
  res.json(data);
});

// POST save finances
app.post("/api/finances", (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== "object") {
    res.status(400).json({ error: "Invalid data payload" });
    return;
  }
  newData.lastUpdated = new Date().toISOString();
  saveFinances(newData);
  res.json({ success: true, lastUpdated: newData.lastUpdated });
});

// POST reset to initial sample
app.post("/api/finances/reset", (_req, res) => {
  const initial = getInitialData();
  saveFinances(initial);
  res.json({ success: true, data: initial });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GASTOS.CASA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
