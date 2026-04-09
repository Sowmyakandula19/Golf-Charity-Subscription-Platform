# Golf Charity Subscription Platform

A modern, subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. This project was built to fulfill the Digital Heroes Full-Stack Development Trainee selection process PRD.

## 🚀 Live Demo
(https://golf-charity-subscription-platform-a76skkf34.vercel.app/)

## 💡 Key Features
- **Subscription Engine:** Fully integrated Stripe billing portal and checkout flow.
- **Score Management:** Enforces a rolling 5-score limit dynamically (Stableford format, 1-45 range).
- **Automated Draw Engine:** Executes monthly prize drawings, allocates prize pools based on active subscriber count, and matches user scores against winning numbers (3, 4, or 5 matches).
- **Charity System:** Public charity directory with user-configurable contribution minimums tied directly to their subscription.
- **Winner Verification:** Secure screenshot upload functionality for pending winners to upload proof of their scores.
- **Admin & User Dashboards:** Comprehensive control panels for tracking participation, verifying winners manually, and viewing subscription status.

## 🛠️ Technology Stack
- **Frontend Framework:** Next.js (App Router)
- **Styling:** Vanilla CSS structure with robust token system for modern, emotion-driven aesthetics.
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth, File Storage).
- **Payments:** Stripe (Checkout, Webhooks).

## 🗄️ Database Architecture
This project utilizes a robust Supabase PostgreSQL schema with advanced database-level constraints:
- `profiles`: Stores role-based access limits, Stripe IDs, and charity minimum percentages.
- `scores`: Utilizes a custom `PL/pgSQL` trigger bounding entries to exactly 5 per user per the PRD requirements.
- `draws` & `winnings`: Handles pending, verified, and paid states.

## 💻 Local Development Setup
To run this project locally, you will need Node.js, a Supabase Project, and a Stripe Account.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sowmyakandula19/Golf-Charity-Subscription-Platform.git
   cd Golf-Charity-Subscription-Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
   ```

4. **Run the Database Migrations:**
   Execute the `supabase/migrations/20260325161600_init.sql` script in your Supabase SQL Editor to provision the tables, Row Level Security policies, and triggers.

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment Instructions
This application is designed to be easily deployed on **Vercel**. 

1. Import the repository in your Vercel Dashboard.
2. Add the 4 environment variables listed above to the Vercel project settings prior to hitting "Deploy". *Note: Your Stripe Webhook Secret will require you to register your Vercel URL in the Stripe developer dashboard first.*
3. Ensure your Stripe Webhook endpoint is configured to listen for `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_succeeded`.
