# NutriCart

NutriCart is a full-stack healthy meal kit subscription and e-commerce platform. It combines meal plan browsing, dietary customization, user registration, subscription management, cart checkout, delivery tracking, blog content and an admin dashboard.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Included modules

- Home page with NutriCart positioning and meal-kit visuals
- User registration/login simulation with email and mobile verification messaging
- Meal categories for weight loss, high protein, vegan, diabetic friendly, keto and family packs
- Meal cards with calories, ingredients, pricing, nutrition details and customization
- Weekly/monthly/premium subscription plans
- Cart, address management, coupon handling and payment gateway selection
- JSON-backed order placement and subscription creation APIs
- Delivery tracking and notification-style order status
- Blog/health tips content
- Admin dashboard metrics for products, orders, customers, deliveries, subscriptions and revenue

## API routes

- `GET /api/bootstrap`
- `POST /api/register`
- `POST /api/orders`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:id`
- `PATCH /api/orders/:id`
