const state = {
  meals: [],
  plans: [],
  blogs: [],
  testimonials: [],
  orders: [],
  subscriptions: [],
  cart: JSON.parse(localStorage.getItem("nutricart-cart") || "[]"),
  user: JSON.parse(localStorage.getItem("nutricart-user") || "null"),
  activeCategory: "All"
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function money(value) {
  const amount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  return `Rs ${amount}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Something went wrong");
  return payload;
}

function saveCart() {
  localStorage.setItem("nutricart-cart", JSON.stringify(state.cart));
}

function cartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCategories() {
  const categories = ["All", ...new Set(state.meals.map(meal => meal.category))];
  $("#categoryTabs").innerHTML = categories.map(category => `
    <button class="tab ${category === state.activeCategory ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");

  $$("#categoryTabs .tab").forEach(button => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      renderCategories();
      renderMeals();
    });
  });
}

function renderMeals() {
  const meals = state.activeCategory === "All"
    ? state.meals
    : state.meals.filter(meal => meal.category === state.activeCategory);

  $("#mealGrid").innerHTML = meals.map(meal => `
    <article class="meal-card">
      <div class="meal-image" style="--image:${meal.image}">
        <span class="badge">${meal.badge}</span>
      </div>
      <div class="card-body">
        <div>
          <p class="eyebrow">${meal.category}</p>
          <h3>${meal.name}</h3>
          <p>${meal.description}</p>
        </div>
        <div class="nutrition" aria-label="Nutrition information">
          <div><strong>${meal.calories}</strong><span>Calories</span></div>
          <div><strong>${meal.protein}g</strong><span>Protein</span></div>
          <div><strong>${meal.carbs}g</strong><span>Carbs</span></div>
          <div><strong>${meal.fat}g</strong><span>Fat</span></div>
        </div>
        <ul class="ingredient-list">
          ${meal.ingredients.slice(0, 4).map(item => `<li>${item}</li>`).join("")}
        </ul>
        <div class="card-actions">
          <button class="button ghost" type="button" data-customize="${meal.id}">Customize</button>
          <button class="button primary" type="button" data-add="${meal.id}">${money(meal.price)}</button>
        </div>
      </div>
    </article>
  `).join("");

  $$("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
  $$("[data-customize]").forEach(button => {
    button.addEventListener("click", () => openCustomize(button.dataset.customize));
  });
}

function renderPlans() {
  $("#planGrid").innerHTML = state.plans.map(plan => `
    <article class="plan-card">
      <div>
        <p class="eyebrow">${plan.cadence}</p>
        <h3>${plan.name}</h3>
      </div>
      <div class="plan-price">${money(plan.price)} <small>/ ${plan.meals} meals</small></div>
      <ul class="perk-list">
        ${plan.perks.map(perk => `<li>${perk}</li>`).join("")}
      </ul>
      <div class="card-actions">
        <button class="button ghost" type="button" data-plan-cart="${plan.id}">Add to cart</button>
        <button class="button primary" type="button" data-subscribe="${plan.id}">Subscribe</button>
      </div>
    </article>
  `).join("");

  $$("[data-plan-cart]").forEach(button => {
    button.addEventListener("click", () => addPlanToCart(button.dataset.planCart));
  });
  $$("[data-subscribe]").forEach(button => {
    button.addEventListener("click", () => subscribe(button.dataset.subscribe));
  });
}

function renderBlogs() {
  $("#blogGrid").innerHTML = state.blogs.map(blog => `
    <article class="blog-card">
      <p class="eyebrow">${blog.minutes} min read</p>
      <h3>${blog.title}</h3>
      <p>${blog.excerpt}</p>
    </article>
  `).join("");
}

function renderTestimonials() {
  $("#testimonialGrid").innerHTML = state.testimonials.map(item => `
    <article class="testimonial-card">
      <p>"${item.quote}"</p>
      <h3>${item.name}</h3>
      <p class="eyebrow">${item.role}</p>
    </article>
  `).join("");
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#cartCount").textContent = count;

  $("#cartItems").innerHTML = state.cart.length
    ? state.cart.map(item => `
      <div class="cart-line">
        <div>
          <strong>${item.name}</strong>
          <div>${money(item.price)}</div>
        </div>
        <div class="quantity">
          <button type="button" data-dec="${item.id}" aria-label="Decrease ${item.name}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-inc="${item.id}" aria-label="Increase ${item.name}">+</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">Your cart is ready for healthy plans.</div>`;

  $$("#cartItems [data-dec]").forEach(button => {
    button.addEventListener("click", () => changeQuantity(button.dataset.dec, -1));
  });
  $$("#cartItems [data-inc]").forEach(button => {
    button.addEventListener("click", () => changeQuantity(button.dataset.inc, 1));
  });

  renderSummary();
  saveCart();
}

function renderSummary() {
  const subtotal = cartSubtotal();
  const delivery = subtotal === 0 || subtotal > 999 ? 0 : 79;
  $("#summaryItems").innerHTML = state.cart.length
    ? state.cart.map(item => `
      <div class="summary-item">
        <span>${item.name} x ${item.quantity}</span>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `).join("")
    : `<div class="empty-state">Add a meal kit or subscription plan.</div>`;
  $("#subtotal").textContent = money(subtotal);
  $("#delivery").textContent = money(delivery);
  $("#total").textContent = money(subtotal + delivery);
}

function addToCart(id, options = []) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;
  const optionText = options.length ? ` (${options.join(", ")})` : "";
  const cartId = `${meal.id}${optionText}`;
  const existing = state.cart.find(item => item.id === cartId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: cartId,
      name: `${meal.name}${optionText}`,
      price: meal.price,
      quantity: 1
    });
  }
  renderCart();
  openCart();
}

function addPlanToCart(id) {
  const plan = state.plans.find(item => item.id === id);
  if (!plan) return;
  const existing = state.cart.find(item => item.id === plan.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      quantity: 1
    });
  }
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  const item = state.cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(entry => entry.id !== id);
  }
  renderCart();
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  $("#scrim").classList.add("open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#scrim").classList.remove("open");
}

function openCustomize(id) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;
  $("#modalTitle").textContent = meal.name;
  $("#modalBody").innerHTML = `
    <p>${meal.description}</p>
    <div class="custom-options">
      <label><input type="checkbox" value="Extra protein"> Extra protein</label>
      <label><input type="checkbox" value="No onion/garlic"> No onion/garlic</label>
      <label><input type="checkbox" value="Low spice"> Low spice</label>
      <label><input type="checkbox" value="Gluten-free swap"> Gluten-free swap</label>
    </div>
    <button class="button primary full" type="button" id="addCustomized">Add customized meal</button>
  `;
  $("#customizeModal").classList.add("open");
  $("#customizeModal").setAttribute("aria-hidden", "false");
  $("#addCustomized").addEventListener("click", () => {
    const options = $$("#modalBody input:checked").map(input => input.value);
    closeCustomize();
    addToCart(id, options);
  });
}

function closeCustomize() {
  $("#customizeModal").classList.remove("open");
  $("#customizeModal").setAttribute("aria-hidden", "true");
}

async function subscribe(planId) {
  const customer = state.user?.name || "Guest";
  const preferences = state.user?.preferences || [];
  const { subscription } = await api("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({ planId, customer, preferences })
  });
  state.subscriptions.unshift(subscription);
  renderTracking();
  renderAdmin();
  alert(`${subscription.planName} subscription is active. You can pause or upgrade it from tracking.`);
}

function renderTracking() {
  const items = [
    ...state.orders.map(order => ({ type: "Order", title: order.id, status: order.status, eta: order.eta })),
    ...state.subscriptions.map(sub => ({ type: "Subscription", title: sub.planName, status: sub.status, eta: sub.nextDelivery }))
  ];
  $("#trackingList").innerHTML = items.length
    ? items.map(item => `
      <article class="tracking-card">
        <p class="eyebrow">${item.type}</p>
        <h3>${item.title}</h3>
        <p>${item.status} - ${item.eta}</p>
        <div class="status-rail" aria-hidden="true">
          <span class="active"></span><span class="active"></span><span class="${item.status !== "Confirmed" ? "active" : ""}"></span><span></span>
        </div>
      </article>
    `).join("")
    : `<div class="empty-state">Orders and delivery notifications will appear here.</div>`;
}

function renderAdmin() {
  const revenue = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const cards = [
    ["Products", state.meals.length, "Meal kits and categories"],
    ["Orders", state.orders.length, "Checkout and delivery queue"],
    ["Customers", state.user ? 1 : 0, "Registered demo users"],
    ["Subscriptions", state.subscriptions.length, "Active recurring plans"],
    ["Deliveries", state.orders.filter(order => order.status !== "Delivered").length, "Orders in progress"],
    ["Revenue", money(revenue), "Recorded order value"],
    ["Analytics", "Live", "Conversion-ready dashboard"],
    ["Partners", "Corporate", "Wellness partnership model"]
  ];

  $("#adminDashboard").innerHTML = cards.map(([title, value, text]) => `
    <article class="admin-card">
      <p class="eyebrow">${title}</p>
      <strong>${value}</strong>
      <span>${text}</span>
    </article>
  `).join("");
}

function bindForms() {
  $("#registerForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const preferences = $$("#registerForm fieldset input:checked").map(input => input.value);
    try {
      const { user } = await api("/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          preferences
        })
      });
      state.user = user;
      localStorage.setItem("nutricart-user", JSON.stringify(user));
      $("#authMessage").textContent = "Email and mobile verified. Dashboard created.";
      renderAdmin();
    } catch (error) {
      $("#authMessage").textContent = error.message;
    }
  });

  $("#checkoutForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!state.cart.length) {
      $("#checkoutMessage").textContent = "Add at least one meal kit before checkout.";
      return;
    }
    const form = new FormData(event.currentTarget);
    const subtotal = cartSubtotal();
    try {
      const { order } = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: state.user || { name: "Guest" },
          address: { line1: form.get("address") },
          payment: form.get("payment"),
          coupon: String(form.get("coupon") || "").trim().toUpperCase(),
          subtotal,
          items: state.cart
        })
      });
      state.orders.unshift(order);
      state.cart = [];
      renderCart();
      renderTracking();
      renderAdmin();
      event.currentTarget.reset();
      $("#checkoutMessage").textContent = `Order ${order.id} confirmed. ETA ${order.eta}.`;
    } catch (error) {
      $("#checkoutMessage").textContent = error.message;
    }
  });
}

async function init() {
  const data = await api("/api/bootstrap");
  Object.assign(state, data, {
    cart: state.cart,
    user: state.user,
    activeCategory: state.activeCategory
  });

  renderCategories();
  renderMeals();
  renderPlans();
  renderBlogs();
  renderTestimonials();
  renderCart();
  renderTracking();
  renderAdmin();
  bindForms();

  $(".cart-toggle").addEventListener("click", openCart);
  $(".close-cart").addEventListener("click", closeCart);
  $("#scrim").addEventListener("click", closeCart);
  $(".modal-close").addEventListener("click", closeCustomize);
  $("#customizeModal").addEventListener("click", event => {
    if (event.target.id === "customizeModal") closeCustomize();
  });
}

init().catch(error => {
  document.body.innerHTML = `<main class="band"><h1>NutriCart</h1><p>${error.message}</p></main>`;
});
