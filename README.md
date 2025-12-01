# THE SERVANTS - Community NGO Platform

## 🌟 Overview

Complete full-stack NGO platform with public website, admin panel, payment integration, member management, and email automation.

**Tech Stack:**
- **Frontend:** Next.js 14 + React + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Payments:** Razorpay
- **Image Hosting:** Cloudinary
- **Email:** Gmail SMTP (or Brevo/AWS SES)

---

## 📋 Table of Contents

1. [Local Setup](#local-setup)
2. [Environment Variables](#environment-variables)
3. [Razorpay Setup](#razorpay-setup)
4. [Cloudinary Setup](#cloudinary-setup)
5. [Gmail SMTP Setup](#gmail-smtp-setup)
6. [Deployment on Render](#deployment-on-render)
7. [API Documentation](#api-documentation)
8. [Features](#features)
9. [Admin Panel Usage](#admin-panel-usage)

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Yarn package manager

### Installation Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd theservants

# 2. Install dependencies
yarn install

# 3. Set up environment variables (see below)
cp .env.example .env
# Edit .env with your credentials

# 4. Start MongoDB (if running locally)
mongod --dbpath /data/db

# 5. Run the development server
yarn dev

# 6. Open in browser
# Public Website: http://localhost:3000
# Admin Panel: http://localhost:3000#admin
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# ============================================
# MONGODB (Pre-configured for local)
# ============================================
MONGO_URL=mongodb://localhost:27017/theservants

# ============================================
# NEXT.JS (Pre-configured)
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ============================================
# JWT SECRET (Change in production!)
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# ============================================
# ADMIN CREDENTIALS (Default)
# ============================================
DEFAULT_ADMIN_EMAIL=theservants@admin.com
DEFAULT_ADMIN_PASSWORD=servants786110

# ============================================
# RAZORPAY (Get from dashboard.razorpay.com)
# ============================================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# ============================================
# CLOUDINARY (Get from cloudinary.com/console)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ============================================
# GMAIL SMTP (Get app password)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=The Servants NGO
```

---

## 💳 Razorpay Setup

### Step 1: Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **Sign Up** and create an account
3. Complete KYC verification (required for live mode)

### Step 2: Get API Keys
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** > **API Keys**
3. For **Testing**: Generate Test Keys
4. For **Production**: Generate Live Keys (after KYC)
5. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**

### Step 3: Add to .env
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

### Step 4: Set up Webhooks (Optional for Payment Verification)
1. Go to **Settings** > **Webhooks**
2. Click **Add New Webhook**
3. Enter Webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select Events: `payment.captured`, `payment.failed`, `subscription.charged`
5. Copy **Webhook Secret** (optional, for signature verification)

### Step 5: Create Payment Plans (For Memberships)
1. Go to **Products** > **Subscriptions** > **Plans**
2. Create 3 plans:
   - **Basic**: ₹199/month, ID: `plan_basic`
   - **Core**: ₹499/month, ID: `plan_core`
   - **Premium**: ₹999/month, ID: `plan_premium`

**Note:** Until you configure Razorpay, payments will be mocked for testing.

---

## 🖼️ Cloudinary Setup

### Step 1: Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a **free account**
3. Verify your email

### Step 2: Get Credentials
1. Login and go to [Dashboard](https://cloudinary.com/console)
2. Find your credentials:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (numeric)
   - **API Secret** (alphanumeric)

### Step 3: Add to .env
```env
CLOUDINARY_CLOUD_NAME=dxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 4: Configure Upload Settings (Optional)
1. Go to **Settings** > **Upload**
2. Set **Upload Preset** (if needed)
3. Configure **Folder Structure**: `/theservants/`

**Note:** Until you configure Cloudinary, placeholder images will be used.

---

## 📧 Gmail SMTP Setup

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **App**: Mail
3. Select **Device**: Other (Custom name) → Enter "The Servants NGO"
4. Click **Generate**
5. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Add to .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=The Servants NGO
```

### Alternative: Using Brevo (Sendinblue)
1. Sign up at [Brevo.com](https://www.brevo.com)
2. Get API Key from Settings
3. Update code to use Brevo's API instead of SMTP

**Note:** Until you configure email, emails will be logged but not sent.

---

## 🚀 Deployment on Render

### Prerequisites
- GitHub/GitLab account with your code pushed
- Render account ([render.com](https://render.com))

### Step 1: Create MongoDB Database
**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Render
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/theservants`

**Option B: Render MongoDB**
1. In Render Dashboard, click **New +** > **PostgreSQL** (they don't have MongoDB, use Atlas)

### Step 2: Deploy to Render

1. **Push Code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** > **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `theservants-ngo`
     - **Environment**: `Node`
     - **Build Command**: `yarn install && yarn build`
     - **Start Command**: `yarn start`
     - **Plan**: Free (or paid for custom domain)

3. **Add Environment Variables**
   In Render dashboard, go to **Environment** tab and add:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/theservants
   NEXT_PUBLIC_BASE_URL=https://theservants-ngo.onrender.com
   JWT_SECRET=your-production-secret-key
   DEFAULT_ADMIN_EMAIL=theservants@admin.com
   DEFAULT_ADMIN_PASSWORD=servants786110
   RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=The Servants NGO
   ```

4. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment (5-10 minutes)
   - Access at: `https://theservants-ngo.onrender.com`

5. **Custom Domain (Optional)**
   - Go to **Settings** > **Custom Domain**
   - Add your domain and configure DNS

---

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | Admin login | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/register` | POST | Create admin user | Yes (Super Admin) |

**Login Request:**
```json
{
  "email": "theservants@admin.com",
  "password": "servants786110"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "theservants@admin.com",
    "role": "super_admin"
  }
}
```

### Content Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/content` | GET | Get all content | No |
| `/api/content/:key` | GET | Get specific content | No |
| `/api/content/:key` | PUT | Update content | Yes |

### Members

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/members` | GET | List all members | Yes |
| `/api/members` | POST | Create member | No |
| `/api/members/:id` | GET | Get member | No |
| `/api/members/:id` | PUT | Update member | Yes |
| `/api/members/:id` | DELETE | Delete member | Yes |

### Payments

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/payments` | GET | List all payments | Yes |
| `/api/payments/order` | POST | Create donation order | No |
| `/api/payments/subscription` | POST | Create subscription | No |
| `/api/payments/verify` | POST | Verify payment | No |
| `/api/payments/webhook` | POST | Razorpay webhook | No |
| `/api/payments/plans` | GET | Get membership plans | No |

### Gallery

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/gallery` | GET | List images | No |
| `/api/gallery` | POST | Upload image | Yes |
| `/api/gallery/:id` | DELETE | Delete image | Yes |

### Initiatives & Goals

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/initiatives` | GET | List initiatives | No |
| `/api/initiatives` | POST | Create initiative | Yes |
| `/api/initiatives/:id` | PUT | Update initiative | Yes |
| `/api/initiatives/:id` | DELETE | Delete initiative | Yes |
| `/api/goals` | GET | List goals | No |
| `/api/goals` | POST | Create goal | Yes |
| `/api/goals/:id` | PUT | Update goal | Yes |
| `/api/goals/:id` | DELETE | Delete goal | Yes |

### Email

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/email/newsletter` | POST | Send newsletter | Yes |
| `/api/email/custom` | POST | Send custom email | Yes |
| `/api/email/logs` | GET | Get email logs | Yes |

### Upload

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/upload` | POST | Upload to Cloudinary | Yes |

---

## ✨ Features

### Public Website
- ✅ Hero section with video background
- ✅ About Us section (dynamic content)
- ✅ Goals section (admin managed)
- ✅ Initiatives gallery (admin managed)
- ✅ CSR activities section
- ✅ One-time donation system (Razorpay)
- ✅ 3-tier membership plans (₹199, ₹499, ₹999/month)
- ✅ Contact form
- ✅ Responsive design
- ✅ Islamic geometric aesthetic (Deep Blue #001F3F + Gold #D4AF37)

### Admin Panel
- ✅ Secure login system (JWT authentication)
- ✅ Dashboard with statistics
- ✅ Content management (Hero, About Us)
- ✅ Member management (Approve/Reject/Delete)
- ✅ Payment dashboard (View all transactions)
- ✅ Goals management (Add/Edit/Delete)
- ✅ Initiatives management (Add/Edit/Delete)
- ✅ Email system (Send newsletters)
- ✅ Email logs viewer
- ✅ CSV export for members
- ✅ Role-based access (Super Admin, Staff Admin)

### Backend Features
- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ MongoDB with proper schemas
- ✅ Razorpay integration (Orders & Subscriptions)
- ✅ Cloudinary image uploads
- ✅ Gmail SMTP email system
- ✅ Webhook support
- ✅ Comprehensive error handling

---

## 👨‍💼 Admin Panel Usage

### Accessing Admin Panel
1. Go to: `http://localhost:3000#admin` (or `https://your-domain.com#admin`)
2. Login with default credentials:
   - **Email:** `theservants@admin.com`
   - **Password:** `servants786110`

### Dashboard
- View total members, pending approvals, payments, and email logs
- Quick overview of platform activity

### Content Management
1. Click **Content** tab
2. Edit Hero Title, Hero Subtitle, and About Us text
3. Changes save automatically on blur (when you click away)

### Member Management
1. Click **Members** tab
2. View all members with status (pending/approved/rejected)
3. Actions:
   - ✅ **Approve** pending members
   - ❌ **Reject** pending members
   - 🗑️ **Delete** members
   - 📥 **Export** to CSV

### Payment Dashboard
1. Click **Payments** tab
2. View all transactions (donations + subscriptions)
3. Filter by type and status
4. See Razorpay order IDs

### Goals Management
1. Click **Goals** tab
2. **Add Goal:** Fill title and description, click "Add Goal"
3. **Delete Goal:** Click trash icon

### Initiatives Management
1. Click **Initiatives** tab
2. **Add Initiative:** Fill form (title, description, date, location)
3. **Delete Initiative:** Click trash icon

### Email Management
1. Click **Email** tab
2. **Send Newsletter:**
   - Enter subject and HTML content
   - Sends to all approved members
3. **View Email Logs:** See delivery status

---

## 🎨 Design System

### Colors
- **Primary (Deep Blue):** `#001F3F` - Headers, text
- **Secondary (Gold):** `#D4AF37` - Accents, buttons, highlights
- **Background:** `#FAFAFA` - Main background
- **White:** `#FFFFFF` - Cards, sections

### Typography
- **Font:** Inter (Google Fonts)
- **Headings:** Bold, Deep Blue
- **Body:** Regular, Gray

### Components
- Uses **shadcn/ui** component library
- Tailwind CSS for styling
- Responsive design for mobile/tablet/desktop

---

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js   # All API endpoints
│   ├── page.js                     # Main page (router)
│   ├── layout.js                   # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── PublicWebsite.jsx           # Public website component
│   ├── AdminPanel.jsx              # Admin panel component
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── db.js                       # MongoDB connection
│   ├── models.js                   # Database models
│   ├── auth.js                     # JWT authentication
│   └── services/
│       ├── razorpay.js             # Razorpay integration
│       ├── cloudinary.js           # Cloudinary uploads
│       └── email.js                # Email service
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── package.json                    # Dependencies
├── tailwind.config.js              # Tailwind configuration
└── README.md                       # This file
```

---

## 🔧 Development Tips

### Testing Payments (Razorpay Test Mode)
- Use test cards: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV
- [More test cards](https://razorpay.com/docs/payments/payments/test-card-details/)

### Testing Emails (Without SMTP)
- Emails will be logged to console
- Check `/api/email/logs` for delivery status

### Database Management
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/theservants

# List collections
show collections

# View users
db.users.find().pretty()

# View members
db.members.find().pretty()

# Clear all data (CAUTION!)
db.dropDatabase()
```

### Common Commands
```bash
# Install new package
yarn add package-name

# Run production build
yarn build
yarn start

# Check for errors
yarn lint

# Clear Next.js cache
rm -rf .next
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `yarn install` again

### Issue: MongoDB connection failed
**Solution:** 
- Ensure MongoDB is running: `mongod`
- Check MONGO_URL in `.env`

### Issue: Payments not working
**Solution:**
- Verify Razorpay keys in `.env`
- Check Razorpay dashboard for errors
- Payments are mocked if keys not configured

### Issue: Emails not sending
**Solution:**
- Verify Gmail app password (16 characters, no spaces)
- Check SMTP settings
- Enable "Less secure app access" (not needed with app password)
- Emails are logged but not sent if SMTP not configured

### Issue: Images not uploading
**Solution:**
- Verify Cloudinary credentials
- Check image size (max 10MB)
- Placeholder images used if Cloudinary not configured

---

## 📝 License

MIT License - feel free to use for your NGO!

---

## 🤝 Support

For issues or questions:
- Email: support@theservants.org
- GitHub Issues: [Create an issue](https://github.com/yourrepo/issues)

---

## 🙏 Acknowledgments

Built with ❤️ for The Servants NGO
- Next.js Team
- shadcn/ui
- Tailwind CSS
- MongoDB
- Razorpay
- Cloudinary

---

**Made with compassion for serving humanity**
