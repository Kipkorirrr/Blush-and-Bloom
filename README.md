# E-Commerce Platform

A full-stack e-commerce platform with a pink, orange, and baby blue UI theme.

## Architecture

- Frontend: Next.js App Router
- Backend: NestJS REST API
- Database: MongoDB with Mongoose

## Workspace Structure

- `frontend/` — customer storefront and admin dashboard UX
- `backend/` — NestJS modules for auth, products, orders, and Mpesa integration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run frontend and backend:
   ```bash
   npm run dev
   ```

## Notes

- Use `frontend/` for UI pages and shared components.
- Use `backend/` for API controllers, services, and schema definitions.
- The platform is designed for RBAC with separate customer and admin experiences.
