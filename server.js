const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = process.env.NUTRICART_DB_PATH || path.join(DATA_DIR, "db.json");

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
      goal: "Fat loss",
      price: 249,
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 12,
      cookTime: "20 min",
      serves: 1,
      badge: "Best seller",
      accent: "#12805f",
      image: "linear-gradient(135deg, #0f8f65, #7ddf9a 52%, #fff4bf)",
      ingredients: ["Quinoa", "Grilled paneer", "Spinach", "Broccoli", "Mint dressing"],
      allergens: ["Dairy"],
      description: "A light, high-fiber kit with pre-portioned greens and a bright herb dressing.",
      stock: 34
    },
    {
      id: "hp-tandoori",
      name: "High Protein Tandoori Kit",
      category: "High protein",
      goal: "Muscle gain",
      price: 329,
      calories: 560,
      protein: 46,
      carbs: 38,
      fat: 18,
      cookTime: "25 min",
      serves: 1,
      badge: "Fitness",
      accent: "#c44b2d",
      image: "linear-gradient(135deg, #b33822, #f99d45 58%, #ffe6c7)",
      ingredients: ["Tandoori chicken", "Millet roti", "Kachumber", "Hung curd dip"],
      allergens: ["Dairy"],
      description: "A macro-balanced protein kit designed for post-workout dinners.",
      stock: 27
    },
    {
      id: "vg-thai-curry",
      name: "Vegan Thai Curry Box",
      category: "Vegan",
      goal: "Plant based",
      price: 299,
      calories: 510,
      protein: 22,
      carbs: 62,
      fat: 19,
      cookTime: "30 min",
      serves: 1,
      badge: "Plant based",
      accent: "#315c48",
      image: "linear-gradient(135deg, #315c48, #e9c46a 56%, #f8efe1)",
      ingredients: ["Tofu", "Coconut curry paste", "Brown rice", "Seasonal vegetables"],
      allergens: ["Soy"],
      description: "Fragrant curry ingredients portioned for a satisfying vegan meal.",
      stock: 22
    },
    {
      id: "df-millet-khichdi",
      name: "Diabetic Friendly Millet Khichdi",
      category: "Diabetic friendly",
      goal: "Low GI",
      price: 219,
      calories: 390,
      protein: 19,
      carbs: 44,
      fat: 11,
      cookTime: "22 min",
      serves: 1,
      badge: "Low GI",
      accent: "#25646c",
      image: "linear-gradient(135deg, #25646c, #9cc66d 55%, #f6f0dc)",
      ingredients: ["Foxtail millet", "Moong dal", "Bottle gourd", "Roasted spice mix"],
      allergens: [],
      description: "Low-glycemic comfort food built with whole grains and measured portions.",
      stock: 38
    },
    {
      id: "kt-avocado-paneer",
      name: "Keto Avocado Paneer Plate",
      category: "Keto",
      goal: "Low carb",
      price: 349,
      calories: 610,
      protein: 31,
      carbs: 16,
      fat: 44,
      cookTime: "15 min",
      serves: 1,
      badge: "Low carb",
      accent: "#5fad56",
      image: "linear-gradient(135deg, #264653, #5fad56 52%, #f2d492)",
      ingredients: ["Paneer", "Avocado", "Zucchini noodles", "Seed crumble"],
      allergens: ["Dairy", "Seeds"],
      description: "A low-carb meal kit with rich fats, crisp greens and fast prep.",
      stock: 18
    },
    {
      id: "fp-family-fiesta",
      name: "Family Fiesta Taco Kit",
      category: "Family packs",
      goal: "Family dinner",
      price: 799,
      calories: 680,
      protein: 34,
      carbs: 82,
      fat: 22,
      cookTime: "35 min",
      serves: 4,
      badge: "Serves 4",
      accent: "#be7b22",
      image: "linear-gradient(135deg, #7a3e2e, #e7b54f 52%, #ffe9a8)",
      ingredients: ["Whole wheat tacos", "Bean filling", "Salsa", "Corn salad", "Cheese"],
      allergens: ["Gluten", "Dairy"],
      description: "A family-sized kit with flexible toppings for different tastes.",
      stock: 16
    },
    {
      id: "bf-oats-chia",
      name: "Overnight Oats Breakfast Pack",
      category: "Breakfast",
      goal: "Energy",
      price: 189,
      calories: 360,
      protein: 18,
      carbs: 52,
      fat: 10,
      cookTime: "5 min",
      serves: 1,
      badge: "No cook",
      accent: "#7b5f2a",
      image: "linear-gradient(135deg, #6b5b3e, #f0c96b 56%, #fff8e6)",
      ingredients: ["Rolled oats", "Chia", "Greek yogurt", "Fruit compote", "Almonds"],
      allergens: ["Dairy", "Nuts"],
      description: "A quick breakfast kit with steady carbs and a protein-rich base.",
      stock: 42
    },
    {
      id: "ln-mediterranean",
      name: "Mediterranean Chickpea Lunch",
      category: "Office lunch",
      goal: "Balanced",
      price: 279,
      calories: 470,
      protein: 24,
      carbs: 58,
      fat: 15,
      cookTime: "18 min",
      serves: 1,
      badge: "Lunch box",
      accent: "#237d84",
      image: "linear-gradient(135deg, #237d84, #f0b861 55%, #f7f3e7)",
      ingredients: ["Chickpeas", "Couscous", "Cucumber", "Olives", "Lemon tahini"],
      allergens: ["Sesame", "Gluten"],
      description: "A bright office lunch kit that travels well and keeps prep simple.",
      stock: 31
    }
  ],
  plans: [
    {
      id: "weekly-starter",
      name: "Weekly Starter",
      cadence: "Weekly",
      price: 1499,
      meals: 6,
      target: "Busy professionals",
      delivery: "2 deliveries/week",
      perks: ["Three diet preferences", "Pause anytime", "Two delivery slots"]
    },
    {
      id: "monthly-balance",
      name: "Monthly Balance",
      cadence: "Monthly",
      price: 5499,
      meals: 24,
      target: "Healthy routines",
      delivery: "Flexible weekly delivery",
      perks: ["Nutritionist-reviewed rotation", "Auto-renew payments", "Free delivery"]
    },
    {
      id: "premium-coach",
      name: "Premium Nutrition",
      cadence: "Monthly",
      price: 8499,
      meals: 30,
      target: "Goal-based nutrition",
      delivery: "Priority delivery",
      perks: ["Personal goal mapping", "Priority support", "Weekly nutrition check-in"]
    },
    {
      id: "family-monthly",
      name: "Family Monthly",
      cadence: "Monthly",
      price: 9999,
      meals: 36,
      target: "Families",
      delivery: "Three family drops/week",
      perks: ["Serves 3-4", "Kid-friendly swaps", "Weekend batch kits"]
    }
  ],
  coupons: [
    { code: "HEALTH10", type: "percent", value: 10, minimum: 300, label: "10% off healthy orders" },
    { code: "FIRST150", type: "flat", value: 150, minimum: 700, label: "Rs 150 off first checkout" },
    { code: "CORP20", type: "percent", value: 20, minimum: 3000, label: "Corporate wellness discount" }
  ],
  blogs: [
    {
      id: "macro-friendly",
      title: "How to build a macro-friendly dinner plate",
      excerpt: "A practical split for protein, slow carbs, colorful vegetables and healthy fats.",
      minutes: 4,
      category: "Nutrition"
    },
    {
      id: "meal-prep",
      title: "Meal prep without eating the same thing daily",
      excerpt: "Use base ingredients, rotating sauces and smart portions to keep meals fresh.",
      minutes: 5,
      category: "Planning"
    },
    {
      id: "low-gi",
      title: "Low-GI swaps for Indian comfort meals",
      excerpt: "Millets, dal combinations and fiber-rich vegetables that support steady energy.",
      minutes: 3,
      category: "Health"
    },
    {
      id: "protein-timing",
      title: "Simple protein timing for busy training weeks",
      excerpt: "A practical way to spread protein across breakfast, lunch, dinner and snacks.",
      minutes: 6,
      category: "Fitness"
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
  deliveryZones: [
    { area: "North Bengaluru", fee: 49, eta: "7:00 AM - 10:00 AM" },
    { area: "South Bengaluru", fee: 59, eta: "8:00 AM - 11:00 AM" },
    { area: "Central Bengaluru", fee: 39, eta: "6:30 PM - 9:30 PM" }
  ],
  users: [],
  carts: {},
  orders: [
    {
      id: "NC-1024",
      customer: "Demo Customer",
      total: 1499,
      status: "Preparing",
      eta: "Today, 7:30 PM",
      payment: "Razorpay",
      address: { line1: "Demo address" },
      items: [{ name: "Weekly Starter", quantity: 1, price: 1499 }],
      timeline: [
        { label: "Confirmed", done: true },
        { label: "Preparing", done: true },
        { label: "Out for delivery", done: false },
        { label: "Delivered", done: false }
      ],
      createdAt: "2026-05-06T12:48:00.000Z"
    }
  ],
  subscriptions: [],
  quizResults: [],
  corporateLeads: []
};

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return;
  }

  const current = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const normalized = { ...initialData, ...current };
  for (const [key, value] of Object.entries(initialData)) {
    if (Array.isArray(value) && !Array.isArray(normalized[key])) normalized[key] = value;
    if (!Array.isArray(value) && typeof normalized[key] !== typeof value) normalized[key] = value;
  }
  if (!normalized.carts || Array.isArray(normalized.carts)) normalized.carts = {};
  fs.writeFileSync(DB_PATH, JSON.stringify(normalized, null, 2));
}

function readDb() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
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
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function getSessionId(req, body = {}) {
  const raw = req.headers["x-session-id"] || body.sessionId || "guest";
  return String(raw).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "guest";
}

function getCart(db, sessionId) {
  if (!db.carts) db.carts = {};
  if (!db.carts[sessionId]) {
    db.carts[sessionId] = {
      sessionId,
      items: [],
      coupon: "",
      updatedAt: new Date().toISOString()
    };
  }
  return db.carts[sessionId];
}

function calculateDiscount(coupons, code, subtotal) {
  if (!code) return { code: "", label: "", amount: 0 };
  const coupon = coupons.find(item => item.code === String(code).trim().toUpperCase());
  if (!coupon || subtotal < coupon.minimum) return { code: String(code).trim().toUpperCase(), label: "Not applied", amount: 0 };
  const amount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { code: coupon.code, label: coupon.label, amount };
}

function calculateTotals(db, cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 79;
  const discount = calculateDiscount(db.coupons, cart.coupon, subtotal);
  const total = Math.max(subtotal + delivery - discount.amount, 0);
  return { subtotal, delivery, discount, total };
}

function cartPayload(db, cart) {
  return { ...cart, totals: calculateTotals(db, cart) };
}

function addonPrice(customizations = {}) {
  const addOns = Array.isArray(customizations.addOns) ? customizations.addOns : [];
  let total = 0;
  if (addOns.includes("Extra protein")) total += 70;
  if (addOns.includes("Double vegetables")) total += 45;
  if (customizations.serving === "Two servings") total += 120;
  if (customizations.serving === "Family portion") total += 280;
  return total;
}

function makeCartLine(db, body) {
  const type = body.type === "plan" ? "plan" : "meal";
  const productId = body.productId || body.mealId || body.planId;
  const source = type === "plan"
    ? db.plans.find(item => item.id === productId)
    : db.meals.find(item => item.id === productId);
  if (!source) return null;

  const customizations = body.customizations || {};
  const price = Number(source.price) + (type === "meal" ? addonPrice(customizations) : 0);
  return {
    id: crypto.randomUUID(),
    type,
    productId: source.id,
    name: source.name,
    category: source.category || source.cadence,
    price,
    basePrice: source.price,
    quantity: Math.max(1, Number(body.quantity || 1)),
    image: source.image || "",
    calories: source.calories || null,
    customizations,
    addedAt: new Date().toISOString()
  };
}

function nextOrderId(db) {
  let id;
  do {
    id = `NC-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (db.orders.some(order => order.id === id));
  return id;
}

function buildTimeline(status = "Confirmed") {
  const steps = ["Confirmed", "Preparing", "Out for delivery", "Delivered"];
  const activeIndex = Math.max(0, steps.indexOf(status));
  return steps.map((label, index) => ({ label, done: index <= activeIndex }));
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

function adminSummary(db) {
  const revenue = db.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return {
    products: db.meals.length,
    orders: db.orders.length,
    customers: db.users.length,
    subscriptions: db.subscriptions.filter(item => item.status === "Active").length,
    deliveries: db.orders.filter(order => order.status !== "Delivered").length,
    revenue,
    carts: Object.values(db.carts || {}).reduce((sum, cart) => sum + cart.items.length, 0),
    leads: db.corporateLeads.length
  };
}

async function handleApi(req, res) {
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    const sessionId = getSessionId(req);
    sendJson(res, 200, {
      meals: db.meals,
      plans: db.plans,
      blogs: db.blogs,
      testimonials: db.testimonials,
      coupons: db.coupons,
      deliveryZones: db.deliveryZones,
      orders: db.orders,
      subscriptions: db.subscriptions,
      cart: cartPayload(db, getCart(db, sessionId)),
      admin: adminSummary(db)
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/cart") {
    const sessionId = getSessionId(req);
    sendJson(res, 200, { cart: cartPayload(db, getCart(db, sessionId)) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/cart/items") {
    const body = await parseBody(req);
    const sessionId = getSessionId(req, body);
    const line = makeCartLine(db, body);
    if (!line) {
      sendJson(res, 404, { message: "Meal kit or plan not found." });
      return;
    }
    const cart = getCart(db, sessionId);
    const fingerprint = JSON.stringify({ type: line.type, productId: line.productId, customizations: line.customizations });
    const existing = cart.items.find(item => JSON.stringify({ type: item.type, productId: item.productId, customizations: item.customizations }) === fingerprint);
    if (existing) {
      existing.quantity += line.quantity;
      existing.updatedAt = new Date().toISOString();
    } else {
      cart.items.push(line);
    }
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 201, { cart: cartPayload(db, cart) });
    return;
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/cart/items/")) {
    const body = await parseBody(req);
    const sessionId = getSessionId(req, body);
    const itemId = url.pathname.split("/").pop();
    const cart = getCart(db, sessionId);
    const item = cart.items.find(entry => entry.id === itemId);
    if (!item) {
      sendJson(res, 404, { message: "Cart item not found." });
      return;
    }
    if (body.quantity !== undefined) item.quantity = Math.max(0, Number(body.quantity));
    if (body.customizations) item.customizations = body.customizations;
    cart.items = cart.items.filter(entry => entry.quantity > 0);
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { cart: cartPayload(db, cart) });
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/cart/items/")) {
    const sessionId = getSessionId(req);
    const itemId = url.pathname.split("/").pop();
    const cart = getCart(db, sessionId);
    cart.items = cart.items.filter(entry => entry.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { cart: cartPayload(db, cart) });
    return;
  }

  if (req.method === "PATCH" && url.pathname === "/api/cart") {
    const body = await parseBody(req);
    const sessionId = getSessionId(req, body);
    const cart = getCart(db, sessionId);
    cart.coupon = String(body.coupon || "").trim().toUpperCase();
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { cart: cartPayload(db, cart) });
    return;
  }

  if (req.method === "DELETE" && url.pathname === "/api/cart") {
    const sessionId = getSessionId(req);
    const cart = getCart(db, sessionId);
    cart.items = [];
    cart.coupon = "";
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { cart: cartPayload(db, cart) });
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
        addressBook: body.address ? [body.address] : [],
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
    const sessionId = getSessionId(req, body);
    const cart = getCart(db, sessionId);
    if (!cart.items.length) {
      sendJson(res, 400, { message: "Cart is empty." });
      return;
    }
    if (body.coupon !== undefined) cart.coupon = String(body.coupon || "").trim().toUpperCase();
    const totals = calculateTotals(db, cart);
    const order = {
      id: nextOrderId(db),
      customer: body.customer?.name || body.customerName || "Guest",
      email: body.customer?.email || body.email || "",
      phone: body.customer?.phone || body.phone || "",
      address: body.address || {},
      deliverySlot: body.deliverySlot || "Tomorrow, 8:00 AM - 10:00 AM",
      payment: body.payment || "Razorpay",
      coupon: cart.coupon,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      discount: totals.discount.amount,
      total: totals.total,
      status: "Confirmed",
      eta: body.deliverySlot || "Tomorrow, 8:00 AM - 10:00 AM",
      items: cart.items,
      timeline: buildTimeline("Confirmed"),
      createdAt: new Date().toISOString()
    };
    db.orders.unshift(order);
    cart.items = [];
    cart.coupon = "";
    cart.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 201, { order, cart: cartPayload(db, cart), admin: adminSummary(db) });
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
      email: body.email || "",
      status: "Active",
      nextDelivery: body.nextDelivery || "Next Monday",
      cadence: plan.cadence,
      preferences: body.preferences || [],
      createdAt: new Date().toISOString()
    };
    db.subscriptions.unshift(subscription);
    writeDb(db);
    sendJson(res, 201, { subscription, admin: adminSummary(db) });
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
    subscription.nextDelivery = body.nextDelivery || subscription.nextDelivery;
    subscription.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { subscription, admin: adminSummary(db) });
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
    order.timeline = buildTimeline(order.status);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { order, admin: adminSummary(db) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/quiz") {
    const body = await parseBody(req);
    const goal = String(body.goal || "Balanced");
    const recommendations = db.meals
      .filter(meal => meal.goal.toLowerCase().includes(goal.toLowerCase()) || meal.category.toLowerCase().includes(goal.toLowerCase()))
      .slice(0, 3);
    const result = {
      id: crypto.randomUUID(),
      name: body.name || "Guest",
      goal,
      mealsPerWeek: body.mealsPerWeek || 6,
      recommendations: recommendations.length ? recommendations.map(item => item.id) : db.meals.slice(0, 3).map(item => item.id),
      createdAt: new Date().toISOString()
    };
    db.quizResults.unshift(result);
    writeDb(db);
    sendJson(res, 201, { result, meals: recommendations.length ? recommendations : db.meals.slice(0, 3) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/corporate-leads") {
    const body = await parseBody(req);
    if (!body.company || !body.email) {
      sendJson(res, 400, { message: "Company name and email are required." });
      return;
    }
    const lead = {
      id: crypto.randomUUID(),
      company: body.company,
      email: body.email,
      employees: body.employees || "",
      requirement: body.requirement || "",
      status: "New",
      createdAt: new Date().toISOString()
    };
    db.corporateLeads.unshift(lead);
    writeDb(db);
    sendJson(res, 201, { lead, admin: adminSummary(db) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/meals") {
    const body = await parseBody(req);
    if (!body.name || !body.category || !body.price) {
      sendJson(res, 400, { message: "Name, category and price are required." });
      return;
    }
    const meal = {
      id: body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: body.name,
      category: body.category,
      goal: body.goal || "Balanced",
      price: Number(body.price),
      calories: Number(body.calories || 450),
      protein: Number(body.protein || 25),
      carbs: Number(body.carbs || 45),
      fat: Number(body.fat || 15),
      cookTime: body.cookTime || "25 min",
      serves: Number(body.serves || 1),
      badge: body.badge || "New",
      accent: body.accent || "#1f9d72",
      image: body.image || "linear-gradient(135deg, #1f9d72, #f0b861 58%, #fff8e6)",
      ingredients: Array.isArray(body.ingredients) ? body.ingredients : String(body.ingredients || "Fresh vegetables, Protein, Sauce").split(",").map(item => item.trim()),
      allergens: Array.isArray(body.allergens) ? body.allergens : [],
      description: body.description || "A fresh NutriCart meal kit prepared for convenient healthy cooking.",
      stock: Number(body.stock || 20),
      createdAt: new Date().toISOString()
    };
    db.meals.unshift(meal);
    writeDb(db);
    sendJson(res, 201, { meal, admin: adminSummary(db) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/summary") {
    sendJson(res, 200, { admin: adminSummary(db), orders: db.orders, leads: db.corporateLeads });
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
