const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const initialData = {
  meals: [
    {
      id: "wl-green-bowl",
      name: "Lean Green Power Bowl",
      category: "Weight loss",
      price: 249,
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 12,
      cookTime: "20 min",
      badge: "Best seller",
      image: "linear-gradient(135deg, #0f8f65, #7ddf9a 52%, #fff4bf)",
      ingredients: ["Quinoa", "Grilled paneer", "Spinach", "Broccoli", "Mint dressing"],
      description: "A light, high-fiber kit with pre-portioned greens and a bright herb dressing."
    },
    {
      id: "hp-tandoori",
      name: "High Protein Tandoori Kit",
      category: "High protein",
      price: 329,
      calories: 560,
      protein: 46,
      carbs: 38,
      fat: 18,
      cookTime: "25 min",
      badge: "Fitness",
      image: "linear-gradient(135deg, #b33822, #f99d45 58%, #ffe6c7)",
      ingredients: ["Tandoori chicken", "Millet roti", "Kachumber", "Hung curd dip"],
      description: "A macro-balanced protein kit designed for post-workout dinners."
    },
    {
      id: "vg-thai-curry",
      name: "Vegan Thai Curry Box",
      category: "Vegan",
      price: 299,
      calories: 510,
      protein: 22,
      carbs: 62,
      fat: 19,
      cookTime: "30 min",
      badge: "Plant based",
      image: "linear-gradient(135deg, #315c48, #e9c46a 56%, #f8efe1)",
      ingredients: ["Tofu", "Coconut curry paste", "Brown rice", "Seasonal vegetables"],
      description: "Fragrant curry ingredients portioned for a satisfying vegan meal."
    },
    {
      id: "df-millet-khichdi",
      name: "Diabetic Friendly Millet Khichdi",
      category: "Diabetic friendly",
      price: 219,
      calories: 390,
      protein: 19,
      carbs: 44,
      fat: 11,
      cookTime: "22 min",
      badge: "Low GI",
      image: "linear-gradient(135deg, #25646c, #9cc66d 55%, #f6f0dc)",
      ingredients: ["Foxtail millet", "Moong dal", "Bottle gourd", "Roasted spice mix"],
      description: "Low-glycemic comfort food built with whole grains and measured portions."
    },
    {
      id: "kt-avocado-paneer",
      name: "Keto Avocado Paneer Plate",
      category: "Keto",
      price: 349,
      calories: 610,
      protein: 31,
      carbs: 16,
      fat: 44,
      cookTime: "15 min",
      badge: "Low carb",
      image: "linear-gradient(135deg, #264653, #5fad56 52%, #f2d492)",
      ingredients: ["Paneer", "Avocado", "Zucchini noodles", "Seed crumble"],
      description: "A low-carb meal kit with rich fats, crisp greens and fast prep."
    },
    {
      id: "fp-family-fiesta",
      name: "Family Fiesta Taco Kit",
      category: "Family packs",
      price: 799,
      calories: 680,
      protein: 34,
      carbs: 82,
      fat: 22,
      cookTime: "35 min",
      badge: "Serves 4",
      image: "linear-gradient(135deg, #7a3e2e, #e7b54f 52%, #ffe9a8)",
      ingredients: ["Whole wheat tacos", "Bean filling", "Salsa", "Corn salad", "Cheese"],
      description: "A family-sized kit with flexible toppings for different tastes."
    }
  ],
  plans: [
    {
      id: "weekly-starter",
      name: "Weekly Starter",
      cadence: "Weekly",
      price: 1499,
      meals: 6,
      perks: ["Three diet preferences", "Pause anytime", "Two delivery slots"]
    },
    {
      id: "monthly-balance",
      name: "Monthly Balance",
      cadence: "Monthly",
      price: 5499,
      meals: 24,
      perks: ["Nutritionist-reviewed rotation", "Auto-renew payments", "Free delivery"]
    },
    {
      id: "premium-coach",
      name: "Premium Nutrition",
      cadence: "Monthly",
      price: 8499,
      meals: 30,
      perks: ["Personal goal mapping", "Priority delivery", "Weekly nutrition check-in"]
    }
  ],
  blogs: [
    {
      id: "macro-friendly",
      title: "How to build a macro-friendly dinner plate",
      excerpt: "A practical split for protein, slow carbs, colorful vegetables and healthy fats.",
      minutes: 4
    },
    {
      id: "meal-prep",
      title: "Meal prep without eating the same thing daily",
      excerpt: "Use base ingredients, rotating sauces and smart portions to keep meals fresh.",
      minutes: 5
    },
    {
      id: "low-gi",
      title: "Low-GI swaps for Indian comfort meals",
      excerpt: "Millets, dal combinations and fiber-rich vegetables that support steady energy.",
      minutes: 3
    }
  ],
  testimonials: [
    {
      name: "Rhea S.",
      role: "Product manager",
      quote: "NutriCart made weekday dinners healthy without turning my evenings into a project."
    },
    {
      name: "Arjun M.",
      role: "Fitness enthusiast",
      quote: "The high-protein plans are easy to track and the portions are genuinely useful."
    },
    {
      name: "Nisha & family",
      role: "Family plan customers",
      quote: "The family boxes give us healthy food with enough choice for everyone."
    }
  ],
  users: [],
  orders: [
    {
      id: "NC-1024",
      customer: "Demo Customer",
      total: 1499,
      status: "Preparing",
      eta: "Today, 7:30 PM",
      items: [{ name: "Weekly Starter", quantity: 1 }],
      createdAt: new Date().toISOString()
    }
  ],
  subscriptions: []
};

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

function readDb() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function publicFilePath(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const requested = safePath === "/" ? "/index.html" : safePath;
  return path.join(PUBLIC_DIR, requested);
}

function serveStatic(req, res) {
  const filePath = publicFilePath(req.url);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fallback);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

async function handleApi(req, res) {
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    sendJson(res, 200, {
      meals: db.meals,
      plans: db.plans,
      blogs: db.blogs,
      testimonials: db.testimonials,
      orders: db.orders,
      subscriptions: db.subscriptions
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/register") {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!email || !name || !phone) {
      sendJson(res, 400, { message: "Name, email and mobile number are required." });
      return;
    }
    let user = db.users.find(item => item.email === email);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        verified: true,
        preferences: body.preferences || [],
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDb(db);
    }
    sendJson(res, 200, { user, token: Buffer.from(`${user.id}:${email}`).toString("base64") });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await parseBody(req);
    if (!Array.isArray(body.items) || body.items.length === 0) {
      sendJson(res, 400, { message: "Cart is empty." });
      return;
    }
    const subtotal = Number(body.subtotal || 0);
    const delivery = subtotal > 999 ? 0 : 79;
    const discount = body.coupon === "HEALTH10" ? Math.round(subtotal * 0.1) : 0;
    const order = {
      id: `NC-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: body.customer?.name || "Guest",
      address: body.address || {},
      payment: body.payment || "Razorpay / Stripe",
      total: Math.max(subtotal + delivery - discount, 0),
      status: "Confirmed",
      eta: "Tomorrow, 8:00 AM - 10:00 AM",
      items: body.items,
      createdAt: new Date().toISOString()
    };
    db.orders.unshift(order);
    writeDb(db);
    sendJson(res, 201, { order });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/subscriptions") {
    const body = await parseBody(req);
    const plan = db.plans.find(item => item.id === body.planId);
    if (!plan) {
      sendJson(res, 404, { message: "Subscription plan not found." });
      return;
    }
    const subscription = {
      id: crypto.randomUUID(),
      planId: plan.id,
      planName: plan.name,
      customer: body.customer || "Guest",
      status: "Active",
      nextDelivery: "Next Monday",
      preferences: body.preferences || [],
      createdAt: new Date().toISOString()
    };
    db.subscriptions.unshift(subscription);
    writeDb(db);
    sendJson(res, 201, { subscription });
    return;
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/subscriptions/")) {
    const id = url.pathname.split("/").pop();
    const body = await parseBody(req);
    const subscription = db.subscriptions.find(item => item.id === id);
    if (!subscription) {
      sendJson(res, 404, { message: "Subscription not found." });
      return;
    }
    subscription.status = body.status || subscription.status;
    subscription.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { subscription });
    return;
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/orders/")) {
    const id = url.pathname.split("/").pop();
    const body = await parseBody(req);
    const order = db.orders.find(item => item.id === id);
    if (!order) {
      sendJson(res, 404, { message: "Order not found." });
      return;
    }
    order.status = body.status || order.status;
    order.eta = body.eta || order.eta;
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { order });
    return;
  }

  sendJson(res, 404, { message: "API route not found." });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch(error => {
      sendJson(res, 500, { message: error.message || "Server error" });
    });
    return;
  }
  serveStatic(req, res);
});

ensureDataStore();
server.listen(PORT, () => {
  console.log(`NutriCart running at http://localhost:${PORT}`);
});
