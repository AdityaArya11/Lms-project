# 🎓 LMS Platform - Full-Stack Learning Management System

An end-to-end, feature-rich **Learning Management System (LMS)** built with the **MERN** stack (MongoDB, Express, React, Node.js), **Vite**, **Tailwind CSS**, **Clerk Authentication**, **Stripe Payments**, and **Cloudinary** media management. 

This platform offers a seamless learning experience for students and an intuitive administration workflow for educators.

---

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg?logo=clerk)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-008CDD.svg?logo=stripe)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5.svg?logo=cloudinary)](https://cloudinary.com/)

---

## 🚀 Key Features

### 👨‍🎓 Student Experience
- **Course Discovery & Search**: Browse, filter, and search through available published courses with star ratings, pricing, and detailed curriculums.
- **Interactive Course Player**: Custom video player supporting YouTube embeds, lesson navigation, chapter breakdowns, and active lecture tracking.
- **Real-Time Progress Tracking**: Progress bar indicating completed lectures and overall course completion percentage using `rc-progress`.
- **Seamless Checkout**: Secure course purchase integration using **Stripe Checkout**.
- **Student Dashboard**: View all enrolled courses, access completed lectures, and submit course reviews/ratings.

### 👨‍🏫 Educator Dashboard
- **Educator Onboarding & Management**: Switch roles to become an educator and manage courses.
- **Rich Course Creator**: Add new courses with rich-text descriptions using **Quill Editor**, custom categories, pricing, and discount structures.
- **Dynamic Curriculum Builder**: Add chapters, video links, lecture durations, free previews, and reorder content effortlessly.
- **Cloudinary Image Uploads**: Fast image hosting for course thumbnails.
- **Course Status Management**: Toggle courses between published and unpublished states.
- **Analytics & Enrollment Tracking**: View total earnings, enrolled student metrics, and course purchase history.

### 🔒 Security & Backend Integration
- **Clerk Authentication**: Passwordless & social authentication for users and educators.
- **Svix Webhook Syncing**: Synchronize Clerk user events (creation, updates, deletion) with MongoDB in real-time.
- **Stripe Webhooks**: Instant payment verification and course enrollment fulfillment.
- **RESTful API**: Clean controller-route separation with authentication middlewares.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Routing**: React Router DOM v7
- **Authentication**: `@clerk/clerk-react`
- **Rich Text Editing**: Quill Editor (`quill`)
- **Components & UI**: `react-youtube`, `rc-progress`, `react-simple-star-rating`, `humanize-duration`

### Backend (`/server`)
- **Runtime**: Node.js + Express 5 (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Media Hosting**: Cloudinary Node SDK
- **Payment Processing**: Stripe Node SDK
- **Auth & Webhooks**: `@clerk/express`, `svix`, `jsonwebtoken`, `bcryptjs`
- **File Parsing**: Multer

---

## 📁 Repository Structure

```
Lms-project/
├── client/                     # Frontend Vite + React Application
│   ├── src/
│   │   ├── assets/             # Logos, icons, and static images
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Rating, etc.)
│   │   ├── context/            # React Context Providers (AppContext, EducatorContext)
│   │   ├── pages/              # Application views
│   │   │   ├── educator/       # AddCourse, Dashboard, MyCourses, StudentsEnrolled
│   │   │   └── student/        # Home, CoursesList, CourseDetails, Player, MyEnrollments
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # Entry point with Providers
│   └── package.json
│
├── server/                     # Backend Node.js + Express Server
│   ├── configs/                # MongoDB, Cloudinary, and Instrument configurations
│   ├── controllers/            # User, Course, Educator, and Webhook logic
│   ├── middlewares/            # Auth and Educator protection middlewares
│   ├── models/                 # Mongoose schemas (User, Course, Purchase, Progress)
│   ├── routes/                 # Express API routes
│   ├── server.js               # Express app entry point
│   ├── vercel.json             # Deployment config for Vercel
│   └── package.json
│
├── package.json                # Root package for running client & server concurrently
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Setup

### 1. Server Environment Variables (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lms

# Clerk Auth Keys & Webhook Secret
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Stripe Payment Gateway
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CURRENCY=usd
```

### 2. Client Environment Variables (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
# Clerk Auth Key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# App Settings
VITE_CURRENCY=$
```

---

## 📥 Installation & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) or local MongoDB instance
- [Clerk Account](https://clerk.com/)
- [Cloudinary Account](https://cloudinary.com/)
- [Stripe Account](https://stripe.com/)

---

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Lms-project.git
   cd Lms-project
   ```

2. **Install Root & Sub-directory Dependencies**:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   cd ..
   ```

3. **Run the Server & Client Concurrently**:

   - **Option A: Run from Root**
     ```bash
     # Start Backend (Terminal 1)
     npm run server

     # Start Frontend (Terminal 2)
     npm run client
     ```

   - **Option B: Run independently**
     ```bash
     # Start backend server
     cd server
     npm run server

     # Start Vite dev client
     cd client
     npm run dev
     ```

4. **Access the application**:
   - **Frontend**: Open `http://localhost:5173` in your browser.
   - **Backend API**: Running at `http://localhost:5000` (or configured port).

---

## 🔌 Main API Routes Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/webhooks/clerk` | Clerk User Sync Webhook | ❌ |
| **POST** | `/api/webhooks/stripe` | Stripe Payment Confirmation Webhook | ❌ |
| **GET** | `/api/course/all` | Fetch all published courses | ❌ |
| **GET** | `/api/course/:id` | Fetch specific course details | ❌ |
| **POST** | `/api/user/purchase` | Initiate course purchase via Stripe | ✅ |
| **GET** | `/api/user/enrolled-courses` | Get user's enrolled courses | ✅ |
| **POST** | `/api/user/update-course-progress` | Update video lecture progress | ✅ |
| **POST** | `/api/educator/add-course` | Create a new course with thumbnail upload | ✅ (Educator) |
| **GET** | `/api/educator/courses` | Get educator created courses | ✅ (Educator) |
| **GET** | `/api/educator/dashboard` | Get educator statistics & earnings | ✅ (Educator) |

---

## 🌐 Deployment Guide

### Deploy Backend to Vercel / Render
- Connect the `server` directory to Vercel/Render.
- Ensure all environment variables from `server/.env` are populated in the deployment platform settings.
- `server/vercel.json` is pre-configured for Vercel Serverless Function deployments.

### Deploy Frontend to Vercel / Netlify
- Connect the `client` directory to Vercel/Netlify.
- Set build command: `npm run build`
- Set output directory: `dist`
- Add `VITE_CLERK_PUBLISHABLE_KEY` in environment variables.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).