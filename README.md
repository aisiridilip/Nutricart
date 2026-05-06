# NutriCart

NutriCart is a full-stack healthy meal kit subscription and e-commerce platform. It combines routed frontend pages, meal plan browsing, dietary customization, database-backed cart persistence, checkout, subscriptions, delivery tracking, blog content, corporate lead capture and an admin dashboard.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Included modules

- Home page with NutriCart positioning and meal-kit visuals
- Routed pages for Home, Meal kits, Subscriptions, Cart, Checkout, Tracking, Blog, Corporate and Admin
- User registration/login simulation with email and mobile verification messaging
- Meal categories for weight loss, high protein, vegan, diabetic friendly, keto, breakfast, office lunch and family packs
- Meal cards with calories, ingredients, pricing, nutrition details, serving size, spice level and add-ons
- Weekly/monthly/premium subscription plans
- Backend-saved cart, address management, coupon handling and payment gateway selection
- JSON-backed order placement, cart clearing, subscription creation, quiz results and corporate leads
- Delivery tracking and notification-style order status
- Blog/health tips content
- Admin dashboard metrics, product creation and order status updates

## API routes

- `GET /api/bootstrap`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `PATCH /api/cart`
- `DELETE /api/cart`
- `POST /api/register`
- `POST /api/orders`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:id`
- `PATCH /api/orders/:id`
- `POST /api/quiz`
- `POST /api/corporate-leads`
- `POST /api/meals`
- `GET /api/admin/summary`
