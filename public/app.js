const sessionId = localStorage.getItem("nutricart-session") || crypto.randomUUID();
localStorage.setItem("nutricart-session", sessionId);

const state = {
  meals: [],
  plans: [],
  blogs: [],
  testimonials: [],
  coupons: [],
  deliveryZones: [],
  orders: [],
  subscriptions: [],
  cart: { items: [], totals: { subtotal: 0, delivery: 0, discount: { amount: 0 }, total: 0 } },
  admin: {},
  user: JSON.parse(localStorage.getItem("nutricart-user") || "null"),
  filters: { category: "All", goal: "All", search: "" },
  quizMeals: []
};

const routes = {
  "/": renderHome,
  "/meals": renderMeals,
  "/subscriptions": renderSubscriptions,
  "/cart": renderCartPage,
  "/checkout": renderCheckout,
  "/tracking": renderTracking,
  "/blog": renderBlog,
  "/admin": renderAdmin,
  "/corporate": renderCorporate
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const money = value => `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0))}`;
const compactDate = value => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Something went wrong");
  return payload;
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 2600);
}

function navigate(path) {
  if (location.pathname !== path) history.pushState({}, "", path);
  renderRoute();
}

function setPage(html, title) {
  document.title = `${title} | NutriCart`;
  app.innerHTML = html;
  app.focus({ preventScroll: true });
  updateNav();
}

function updateNav() {
  document.querySelectorAll("[data-link]").forEach(link => {
    const url = new URL(link.href, location.origin);
    link.classList.toggle("active", url.pathname === location.pathname);
  });
  document.querySelector("#cartCount").textContent = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

async function loadBootstrap() {
  const data = await api("/api/bootstrap");
  Object.assign(state, data);
  updateNav();
}

async function refreshCart() {
  const { cart } = await api("/api/cart");
  state.cart = cart;
  updateNav();
}

function pageHeader(eyebrow, title, text = "") {
  return `
    <section class="page-hero compact">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        ${text ? `<p class="lead">${text}</p>` : ""}
      </div>
    </section>
  `;
}

function renderHome() {
  const featured = state.meals.slice(0, 3).map(mealCard).join("");
  const testimonials = state.testimonials.map(item => `
    <article class="quote-card">
      <p>"${item.quote}"</p>
      <strong>${item.name}</strong>
      <span>${item.role}</span>
    </article>
  `).join("");

  setPage(`
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">Healthy meal kits, subscription delivery and nutrition personalization</p>
        <h1>Fresh plans for real life.</h1>
        <p class="lead">NutriCart combines meal-kit e-commerce, weekly subscriptions, dietary customization, checkout, order tracking and admin operations in one full-stack platform.</p>
        <div class="hero-actions">
          <a class="button primary" href="/meals" data-link>Shop meal kits</a>
          <a class="button secondary" href="/subscriptions" data-link>View subscriptions</a>
        </div>
      </div>
      <div class="hero-board" aria-label="NutriCart meal kit preview">
        <div class="kit-card main-kit">
          <span class="kit-badge">Today</span>
          <div class="food-plate">
            <span></span><span></span><span></span><span></span>
          </div>
          <strong>High Protein Tandoori Kit</strong>
          <p>46g protein - 25 min prep</p>
        </div>
        <div class="mini-stat top"><strong>8</strong><span>diet categories</span></div>
        <div class="mini-stat bottom"><strong>Live</strong><span>cart + order DB</span></div>
      </div>
    </section>

    <section class="metric-row">
      <div><strong>${state.meals.length}</strong><span>Meal kits</span></div>
      <div><strong>${state.plans.length}</strong><span>Subscription plans</span></div>
      <div><strong>${state.orders.length}</strong><span>Saved orders</span></div>
      <div><strong>${state.coupons.length}</strong><span>Active coupons</span></div>
    </section>

    <section class="band account-band">
      <div>
        <p class="eyebrow">Account</p>
        <h2>Register, save preferences and personalize meals.</h2>
        <p>Use this as the customer login/registration surface. It saves the user profile in the backend database and keeps the current user in the browser session.</p>
      </div>
      <form id="signupForm" class="checkout-form">
        <div class="form-grid">
          <label>Full name<input name="name" value="${state.user?.name || ""}" required></label>
          <label>Email<input type="email" name="email" value="${state.user?.email || ""}" required></label>
          <label>Mobile<input name="phone" value="${state.user?.phone || ""}" required></label>
        </div>
        <div class="check-row boxed">
          <label><input type="checkbox" name="preferences" value="Weight loss"> Weight loss</label>
          <label><input type="checkbox" name="preferences" value="High protein"> High protein</label>
          <label><input type="checkbox" name="preferences" value="Vegan"> Vegan</label>
          <label><input type="checkbox" name="preferences" value="Keto"> Keto</label>
        </div>
        <button class="button primary" type="submit">Verify and save account</button>
      </form>
    </section>

    <section class="band split">
      <div>
        <p class="eyebrow">How it works</p>
        <h2>Choose, customize, subscribe or checkout.</h2>
      </div>
      <div class="step-grid">
        <article><span>1</span><h3>Pick a goal</h3><p>Weight loss, high protein, vegan, keto, low-GI, family packs and more.</p></article>
        <article><span>2</span><h3>Customize</h3><p>Adjust serving size, spice level, add-ons, exclusions and delivery window.</p></article>
        <article><span>3</span><h3>Checkout</h3><p>Cart, coupons, address, payment choice and persisted order records.</p></article>
        <article><span>4</span><h3>Track</h3><p>Follow status from confirmed to delivered, with admin updates.</p></article>
      </div>
    </section>

    <section class="band light">
      <div class="section-heading">
        <div><p class="eyebrow">Featured kits</p><h2>Fresh options for different goals</h2></div>
        <a class="button secondary" href="/meals" data-link>View all</a>
      </div>
      <div class="meal-grid">${featured}</div>
    </section>

    <section class="band quiz-panel">
      <div>
        <p class="eyebrow">Nutrition match</p>
        <h2>Find a plan from your goal.</h2>
        <p>Save a quiz result to the backend and get recommended kits instantly.</p>
      </div>
      <form id="quizForm" class="inline-form">
        <input name="name" placeholder="Your name" required>
        <select name="goal">
          <option>Fat loss</option>
          <option>Muscle gain</option>
          <option>Plant based</option>
          <option>Low GI</option>
          <option>Balanced</option>
        </select>
        <input name="mealsPerWeek" type="number" min="3" max="30" value="6" aria-label="Meals per week">
        <button class="button primary" type="submit">Get match</button>
      </form>
      <div id="quizResults" class="mini-results"></div>
    </section>

    <section class="band">
      <div class="section-heading">
        <div><p class="eyebrow">Customer proof</p><h2>Built for busy healthy routines</h2></div>
      </div>
      <div class="quote-grid">${testimonials}</div>
    </section>
  `, "Healthy Meal Kit Subscription Platform");
}

function mealCard(meal) {
  const allergens = meal.allergens.length ? meal.allergens.join(", ") : "No major allergens";
  return `
    <article class="meal-card" data-meal-card="${meal.id}">
      <div class="meal-image" style="--image:${meal.image}; --accent:${meal.accent}">
        <span class="badge">${meal.badge}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <div>
            <p class="eyebrow">${meal.category}</p>
            <h3>${meal.name}</h3>
          </div>
          <strong>${money(meal.price)}</strong>
        </div>
        <p>${meal.description}</p>
        <div class="nutrition">
          <span><strong>${meal.calories}</strong> kcal</span>
          <span><strong>${meal.protein}g</strong> protein</span>
          <span><strong>${meal.cookTime}</strong> prep</span>
        </div>
        <p class="micro">${meal.ingredients.slice(0, 4).join(" - ")}</p>
        <p class="micro">Allergens: ${allergens}</p>
        <div class="custom-row">
          <select data-serving aria-label="Serving size">
            <option>Single serving</option>
            <option>Two servings</option>
            <option>Family portion</option>
          </select>
          <select data-spice aria-label="Spice level">
            <option>Medium spice</option>
            <option>Low spice</option>
            <option>High spice</option>
          </select>
        </div>
        <div class="check-row">
          <label><input type="checkbox" value="Extra protein" data-addon> Extra protein</label>
          <label><input type="checkbox" value="Double vegetables" data-addon> Double veg</label>
          <label><input type="checkbox" value="No onion/garlic" data-addon> No onion/garlic</label>
        </div>
        <button class="button primary full" type="button" data-add-meal="${meal.id}">Add to cart</button>
      </div>
    </article>
  `;
}

function renderMeals() {
  const categories = ["All", ...new Set(state.meals.map(meal => meal.category))];
  const goals = ["All", ...new Set(state.meals.map(meal => meal.goal))];
  const filtered = state.meals.filter(meal => {
    const categoryOk = state.filters.category === "All" || meal.category === state.filters.category;
    const goalOk = state.filters.goal === "All" || meal.goal === state.filters.goal;
    const query = state.filters.search.toLowerCase();
    const searchOk = !query || `${meal.name} ${meal.category} ${meal.ingredients.join(" ")}`.toLowerCase().includes(query);
    return categoryOk && goalOk && searchOk;
  });

  setPage(`
    ${pageHeader("Meal kit shop", "Browse, customize and add to cart", "Every Add to cart action is saved in the backend JSON database for your session.")}
    <section class="band filter-band">
      <input id="mealSearch" value="${state.filters.search}" placeholder="Search ingredients, kits or goals">
      <select id="categoryFilter">${categories.map(item => `<option ${item === state.filters.category ? "selected" : ""}>${item}</option>`).join("")}</select>
      <select id="goalFilter">${goals.map(item => `<option ${item === state.filters.goal ? "selected" : ""}>${item}</option>`).join("")}</select>
      <a class="button secondary" href="/cart" data-link>Review cart</a>
    </section>
    <section class="band light no-top">
      <div class="meal-grid">${filtered.map(mealCard).join("") || `<div class="empty-state">No meal kits match these filters.</div>`}</div>
    </section>
  `, "Meal Kits");
}

function renderSubscriptions() {
  const plans = state.plans.map(plan => `
    <article class="plan-card">
      <p class="eyebrow">${plan.cadence}</p>
      <h3>${plan.name}</h3>
      <p>${plan.target} - ${plan.delivery}</p>
      <div class="plan-price">${money(plan.price)} <span>/ ${plan.meals} meals</span></div>
      <ul>${plan.perks.map(perk => `<li>${perk}</li>`).join("")}</ul>
      <div class="card-actions">
        <button class="button secondary" type="button" data-add-plan="${plan.id}">Add to cart</button>
        <button class="button primary" type="button" data-subscribe="${plan.id}">Subscribe now</button>
      </div>
    </article>
  `).join("");

  const active = state.subscriptions.length ? state.subscriptions.map(sub => `
    <article class="tracking-card">
      <p class="eyebrow">${sub.status}</p>
      <h3>${sub.planName}</h3>
      <p>${sub.customer} - next delivery ${sub.nextDelivery}</p>
      <div class="card-actions">
        <button class="button secondary" type="button" data-sub-status="${sub.id}" data-status="Paused">Pause</button>
        <button class="button secondary" type="button" data-sub-status="${sub.id}" data-status="Active">Resume</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No subscriptions yet. Start one from a plan above.</div>`;

  setPage(`
    ${pageHeader("Subscription management", "Recurring healthy delivery plans", "Weekly, monthly, premium nutrition and family plans with pause/resume backend state.")}
    <section class="band light"><div class="plan-grid">${plans}</div></section>
    <section class="band">
      <div class="section-heading"><div><p class="eyebrow">Manage</p><h2>Active subscriptions</h2></div></div>
      <div class="tracking-list">${active}</div>
    </section>
  `, "Subscriptions");
}

function renderCartPage() {
  const items = state.cart.items.length ? state.cart.items.map(item => `
    <article class="cart-item">
      <div>
        <p class="eyebrow">${item.type}</p>
        <h3>${item.name}</h3>
        <p>${customText(item.customizations)}</p>
      </div>
      <strong>${money(item.price)}</strong>
      <div class="quantity">
        <button type="button" data-cart-qty="${item.id}" data-qty="${item.quantity - 1}">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-cart-qty="${item.id}" data-qty="${item.quantity + 1}">+</button>
      </div>
      <button class="button text" type="button" data-remove-item="${item.id}">Remove</button>
    </article>
  `).join("") : `<div class="empty-state">Your cart is empty. Add meal kits or subscription plans first.</div>`;

  setPage(`
    ${pageHeader("Cart", "Review backend-saved cart", "Cart items, quantities and coupon state are persisted in data/db.json.")}
    <section class="band cart-layout">
      <div class="cart-list">${items}</div>
      ${summaryPanel("cart")}
    </section>
  `, "Cart");
}

function summaryPanel(context = "cart") {
  const totals = state.cart.totals;
  return `
    <aside class="summary-panel">
      <h2>Order summary</h2>
      <form id="couponForm" class="coupon-form">
        <input name="coupon" value="${state.cart.coupon || ""}" placeholder="HEALTH10 / FIRST150">
        <button class="button secondary" type="submit">Apply</button>
      </form>
      <div class="summary-row"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
      <div class="summary-row"><span>Delivery</span><strong>${money(totals.delivery)}</strong></div>
      <div class="summary-row"><span>Discount</span><strong>-${money(totals.discount?.amount || 0)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${money(totals.total)}</strong></div>
      <div class="coupon-list">${state.coupons.map(coupon => `<span>${coupon.code}</span>`).join("")}</div>
      ${context === "cart" ? `<a class="button primary full" href="/checkout" data-link>Continue to checkout</a>` : ""}
    </aside>
  `;
}

function renderCheckout() {
  setPage(`
    ${pageHeader("Checkout", "Address, delivery and payment", "Submitting this form creates a saved order and clears the backend cart.")}
    <section class="band checkout-layout">
      <form id="checkoutForm" class="checkout-form">
        <div class="form-grid">
          <label>Full name<input name="name" value="${state.user?.name || ""}" required></label>
          <label>Email<input type="email" name="email" value="${state.user?.email || ""}" required></label>
          <label>Mobile<input name="phone" value="${state.user?.phone || ""}" required></label>
          <label>Delivery area<select name="area">${state.deliveryZones.map(zone => `<option>${zone.area}</option>`).join("")}</select></label>
        </div>
        <label>Address<textarea name="address" rows="4" placeholder="House, street, city, pincode" required></textarea></label>
        <div class="form-grid">
          <label>Delivery slot<select name="deliverySlot"><option>Tomorrow, 8:00 AM - 10:00 AM</option><option>Tomorrow, 6:30 PM - 9:30 PM</option><option>Next Monday morning</option></select></label>
          <label>Payment<select name="payment"><option>Razorpay</option><option>Stripe</option><option>Cash on delivery</option></select></label>
          <label>Coupon<input name="coupon" value="${state.cart.coupon || ""}" placeholder="HEALTH10"></label>
        </div>
        <button class="button primary" type="submit">Place order and save</button>
        <p id="checkoutMessage" class="form-message"></p>
      </form>
      ${summaryPanel("checkout")}
    </section>
  `, "Checkout");
}

function renderTracking() {
  const cards = state.orders.map(order => `
    <article class="tracking-card">
      <div class="card-title-row">
        <div><p class="eyebrow">${order.status}</p><h3>${order.id}</h3></div>
        <strong>${money(order.total)}</strong>
      </div>
      <p>${order.customer} - ${order.eta || "ETA pending"}</p>
      <div class="timeline">${(order.timeline || []).map(step => `<span class="${step.done ? "done" : ""}">${step.label}</span>`).join("")}</div>
    </article>
  `).join("");

  setPage(`
    ${pageHeader("Delivery tracking", "Orders and delivery notifications", "Admin status updates are saved to the backend and reflected here.")}
    <section class="band tracking-list">${cards || `<div class="empty-state">No orders yet.</div>`}</section>
  `, "Tracking");
}

function renderBlog() {
  const guides = state.blogs.map(blog => `
    <article class="blog-card">
      <p class="eyebrow">${blog.category} - ${blog.minutes} min read</p>
      <h3>${blog.title}</h3>
      <p>${blog.excerpt}</p>
      <button class="button text" type="button">Read guide</button>
    </article>
  `).join("");

  setPage(`
    ${pageHeader("Health tips", "Nutrition blogs, recipes and SEO content", "A content section for acquisition, education and customer retention.")}
    <section class="band light"><div class="blog-grid">${guides}</div></section>
    <section class="band split">
      <div><p class="eyebrow">Content ideas</p><h2>More sections ready for expansion.</h2></div>
      <div class="feature-grid">
        <article><h3>Recipe library</h3><p>Turn meal-kit recipes into searchable SEO pages.</p></article>
        <article><h3>Nutrition glossary</h3><p>Explain calories, protein, low-GI, keto and macro tracking.</p></article>
        <article><h3>Fitness bundles</h3><p>Pair meal plans with workout goals and weekly schedules.</p></article>
      </div>
    </section>
  `, "Health Tips");
}

function renderCorporate() {
  setPage(`
    ${pageHeader("Corporate wellness", "Healthy meals for teams", "Capture corporate leads in the backend for employer wellness partnerships.")}
    <section class="band corporate-layout">
      <div class="feature-grid">
        <article><h3>Employee meal credits</h3><p>Monthly allowances for healthy kits and office lunch packs.</p></article>
        <article><h3>Team nutrition plans</h3><p>Goal-based plans for fitness challenges and wellness months.</p></article>
        <article><h3>Admin reporting</h3><p>Lead and revenue visibility for partnerships.</p></article>
      </div>
      <form id="corporateForm" class="checkout-form">
        <label>Company<input name="company" required></label>
        <label>Work email<input type="email" name="email" required></label>
        <label>Employees<input name="employees" placeholder="50-100"></label>
        <label>Requirement<textarea name="requirement" rows="4"></textarea></label>
        <button class="button primary" type="submit">Save lead</button>
      </form>
    </section>
  `, "Corporate Wellness");
}

function renderAdmin() {
  const metrics = [
    ["Products", state.admin.products],
    ["Orders", state.admin.orders],
    ["Customers", state.admin.customers],
    ["Subscriptions", state.admin.subscriptions],
    ["Deliveries", state.admin.deliveries],
    ["Revenue", money(state.admin.revenue)],
    ["Cart lines", state.admin.carts],
    ["Leads", state.admin.leads]
  ].map(([label, value]) => `<article class="metric-card"><p>${label}</p><strong>${value || 0}</strong></article>`).join("");

  const orders = state.orders.slice(0, 8).map(order => `
    <article class="admin-order">
      <div><strong>${order.id}</strong><span>${order.customer} - ${money(order.total)}</span></div>
      <select data-order-status="${order.id}">
        ${["Confirmed", "Preparing", "Out for delivery", "Delivered"].map(status => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
      </select>
    </article>
  `).join("");

  setPage(`
    ${pageHeader("Admin dashboard", "Manage products, orders and analytics", "Create products and update delivery status directly against the JSON backend.")}
    <section class="band"><div class="admin-grid">${metrics}</div></section>
    <section class="band light admin-layout">
      <form id="mealAdminForm" class="checkout-form">
        <h2>Add meal kit</h2>
        <div class="form-grid">
          <label>Name<input name="name" required></label>
          <label>Category<input name="category" required></label>
          <label>Goal<input name="goal" value="Balanced"></label>
          <label>Price<input name="price" type="number" required></label>
          <label>Calories<input name="calories" type="number" value="450"></label>
          <label>Protein<input name="protein" type="number" value="25"></label>
        </div>
        <label>Description<textarea name="description" rows="3"></textarea></label>
        <label>Ingredients<input name="ingredients" placeholder="Quinoa, paneer, spinach"></label>
        <button class="button primary" type="submit">Save product</button>
      </form>
      <div class="admin-orders">
        <div class="section-heading"><div><p class="eyebrow">Orders</p><h2>Recent order status</h2></div></div>
        ${orders || `<div class="empty-state">No orders yet.</div>`}
      </div>
    </section>
  `, "Admin");
}

function customText(customizations = {}) {
  const bits = [customizations.serving, customizations.spiceLevel, ...(customizations.addOns || [])].filter(Boolean);
  return bits.length ? bits.join(" - ") : "Standard kit";
}

async function addMealToCart(button) {
  const card = button.closest("[data-meal-card]");
  const customizations = {
    serving: card.querySelector("[data-serving]").value,
    spiceLevel: card.querySelector("[data-spice]").value,
    addOns: [...card.querySelectorAll("[data-addon]:checked")].map(input => input.value)
  };
  const { cart } = await api("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ type: "meal", productId: button.dataset.addMeal, customizations })
  });
  state.cart = cart;
  updateNav();
  notify("Added to cart and saved in database.");
}

async function addPlanToCart(planId) {
  const { cart } = await api("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ type: "plan", productId: planId })
  });
  state.cart = cart;
  updateNav();
  notify("Subscription plan added to cart.");
}

async function subscribe(planId) {
  const plan = state.plans.find(item => item.id === planId);
  const { subscription, admin } = await api("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      planId,
      customer: state.user?.name || "Guest",
      email: state.user?.email || "",
      preferences: state.user?.preferences || [plan.target]
    })
  });
  state.subscriptions.unshift(subscription);
  state.admin = admin;
  notify(`${subscription.planName} subscription saved.`);
  renderSubscriptions();
}

async function updateSubscription(id, status) {
  const { subscription, admin } = await api(`/api/subscriptions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  state.subscriptions = state.subscriptions.map(item => item.id === id ? subscription : item);
  state.admin = admin;
  renderSubscriptions();
}

async function updateCartItem(id, quantity) {
  const { cart } = await api(`/api/cart/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity })
  });
  state.cart = cart;
  renderCartPage();
}

async function removeCartItem(id) {
  const { cart } = await api(`/api/cart/items/${id}`, { method: "DELETE" });
  state.cart = cart;
  renderCartPage();
}

async function applyCoupon(form) {
  const data = new FormData(form);
  const { cart } = await api("/api/cart", {
    method: "PATCH",
    body: JSON.stringify({ coupon: data.get("coupon") })
  });
  state.cart = cart;
  notify("Coupon updated.");
  renderRoute();
}

async function submitCheckout(form) {
  const data = new FormData(form);
  const { order, cart, admin } = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customer: {
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone")
      },
      address: {
        area: data.get("area"),
        line1: data.get("address")
      },
      deliverySlot: data.get("deliverySlot"),
      payment: data.get("payment"),
      coupon: data.get("coupon")
    })
  });
  state.orders.unshift(order);
  state.cart = cart;
  state.admin = admin;
  notify(`Order ${order.id} saved.`);
  navigate("/tracking");
}

async function registerUser(form) {
  const data = new FormData(form);
  const preferences = [...form.querySelectorAll("[name='preferences']:checked")].map(input => input.value);
  const { user } = await api("/api/register", {
    method: "POST",
    body: JSON.stringify({
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      preferences
    })
  });
  state.user = user;
  localStorage.setItem("nutricart-user", JSON.stringify(user));
  notify("Account verified and saved.");
}

async function submitQuiz(form) {
  const data = new FormData(form);
  const { meals } = await api("/api/quiz", {
    method: "POST",
    body: JSON.stringify({
      name: data.get("name"),
      goal: data.get("goal"),
      mealsPerWeek: data.get("mealsPerWeek")
    })
  });
  state.quizMeals = meals;
  document.querySelector("#quizResults").innerHTML = meals.map(meal => `<span>${meal.name}</span>`).join("");
}

async function submitCorporateLead(form) {
  const data = new FormData(form);
  const { admin } = await api("/api/corporate-leads", {
    method: "POST",
    body: JSON.stringify({
      company: data.get("company"),
      email: data.get("email"),
      employees: data.get("employees"),
      requirement: data.get("requirement")
    })
  });
  state.admin = admin;
  form.reset();
  notify("Corporate lead saved.");
}

async function addAdminMeal(form) {
  const data = Object.fromEntries(new FormData(form));
  const { meal, admin } = await api("/api/meals", {
    method: "POST",
    body: JSON.stringify(data)
  });
  state.meals.unshift(meal);
  state.admin = admin;
  notify("Meal kit saved.");
  renderAdmin();
}

async function updateOrderStatus(id, status) {
  const { order, admin } = await api(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  state.orders = state.orders.map(item => item.id === id ? order : item);
  state.admin = admin;
  notify("Order status updated.");
}

function renderRoute() {
  const renderer = routes[location.pathname] || renderHome;
  renderer();
}

document.addEventListener("click", async event => {
  const link = event.target.closest("[data-link]");
  if (link) {
    event.preventDefault();
    navigate(new URL(link.href).pathname);
    return;
  }
  if (event.target.matches("[data-menu-toggle]")) {
    document.querySelector("[data-nav]").classList.toggle("open");
    return;
  }
  const addMeal = event.target.closest("[data-add-meal]");
  if (addMeal) await addMealToCart(addMeal);
  const addPlan = event.target.closest("[data-add-plan]");
  if (addPlan) await addPlanToCart(addPlan.dataset.addPlan);
  const sub = event.target.closest("[data-subscribe]");
  if (sub) await subscribe(sub.dataset.subscribe);
  const statusButton = event.target.closest("[data-sub-status]");
  if (statusButton) await updateSubscription(statusButton.dataset.subStatus, statusButton.dataset.status);
  const qty = event.target.closest("[data-cart-qty]");
  if (qty) await updateCartItem(qty.dataset.cartQty, Number(qty.dataset.qty));
  const remove = event.target.closest("[data-remove-item]");
  if (remove) await removeCartItem(remove.dataset.removeItem);
});

document.addEventListener("input", event => {
  if (event.target.id === "mealSearch") {
    state.filters.search = event.target.value;
    renderMeals();
  }
});

document.addEventListener("change", async event => {
  if (event.target.id === "categoryFilter") {
    state.filters.category = event.target.value;
    renderMeals();
  }
  if (event.target.id === "goalFilter") {
    state.filters.goal = event.target.value;
    renderMeals();
  }
  if (event.target.matches("[data-order-status]")) {
    await updateOrderStatus(event.target.dataset.orderStatus, event.target.value);
  }
});

document.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    if (event.target.id === "couponForm") await applyCoupon(event.target);
    if (event.target.id === "checkoutForm") await submitCheckout(event.target);
    if (event.target.id === "signupForm") await registerUser(event.target);
    if (event.target.id === "quizForm") await submitQuiz(event.target);
    if (event.target.id === "corporateForm") await submitCorporateLead(event.target);
    if (event.target.id === "mealAdminForm") await addAdminMeal(event.target);
  } catch (error) {
    notify(error.message);
  }
});

window.addEventListener("popstate", renderRoute);

loadBootstrap()
  .then(renderRoute)
  .catch(error => {
    app.innerHTML = `<section class="band"><h1>NutriCart</h1><p>${error.message}</p></section>`;
  });
