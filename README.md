# Movie Ticket Booking System

A comprehensive full-stack cinema management and ticket booking system built with modern web technologies. This system provides a complete solution for cinema operations including online ticket booking, concession sales, staff management, and administrative controls.

## 🎯 Project Overview

This project is a cinema management system that supports:
- **Customer-facing**: Online movie ticket booking, concession ordering, and payment processing
- **Staff operations**: Point of Sale (POS) system, ticket/food order verification
- **Administration**: Complete cinema management including movies, showtimes, rooms, pricing, staff schedules, and analytics

## 🏗️ Architecture

```
movie-ticket-booking/
├── backend/          # Express.js REST API
├── frontend/         # React + TypeScript SPA
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows/cicd.yml
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 17 with Prisma ORM 7.x
- **Caching & Queue**: Redis 7 + BullMQ 5.x
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: AWS S3
- **Payment Gateway**: VNPay
- **Email**: Nodemailer
- **AI Integration**: Google Generative AI (Gemini)
- **PDF Generation**: Puppeteer
- **Additional**: bcrypt, qrcode, validator, slugify

### Frontend
- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 7.x
- **State Management**: Zustand 5.x
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 4.x
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns 4.x
- **Charts**: Chart.js with react-chartjs-2
- **QR Scanner**: @yudiel/react-qr-scanner
- **Rich Text**: TinyMCE, Tiptap
- **Notifications**: Sonner
- **Additional**: Axios, Lucide icons, React Slick carousel

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: AWS EC2
- **Web Server**: Nginx (production)
- **SSL/TLS**: Let's Encrypt

## 📋 Features

### Customer Portal
- **Movie Browsing**
  - View showing and upcoming movies
  - Search movies by title
  - Filter by genre, age rating
  - Movie details with trailer, cast, director info
  
- **Ticket Booking**
  - Interactive seat selection
  - Real-time seat availability
  - Multiple showtime options
  - Dynamic pricing based on seat type and room type
  
- **Concessions**
  - Browse products and combo deals
  - Add to cart during booking
  
- **Payment**
  - VNPay integration
  - Discount code application
  - Loyalty points system (VIP membership at 10,000 points)
  
- **User Account**
  - Profile management
  - Booking history
  - QR code tickets
  - Points tracking

- **Additional**
  - News and promotions
  - AI-powered chatbot support
  - Email notifications

### Staff Portal
- **Dashboard**: Overview of daily operations
- **POS System**: 
  - In-person ticket sales
  - Food and beverage sales
  - Cash and VNPay payment methods
  
- **Order Verification**:
  - Ticket check-in with QR scanner
  - Food order pickup verification
  
- **Work Schedules**: View assigned shifts

### Admin Panel
- **Dashboard**: Analytics and reporting with Chart.js visualizations
- **Movie Management**:
  - Add/edit/delete movies
  - Manage genres and age ratings
  - Upload movie posters and trailers
  
- **Cinema Configuration**:
  - Room management
  - Room types configuration
  - Seat layout and pricing
  - Seat types management
  
- **Showtime Scheduling**:
  - Create and manage showtimes
  - Automatic seat generation for each showtime
  
- **Products & Combos**:
  - Product categories
  - Individual products
  - Combo packages with discounted pricing
  
- **User Management**:
  - Customer accounts
  - Staff accounts (different roles: Admin, Staff, Customer, VIP)
  
- **Staff Operations**:
  - Shift management (ca làm)
  - Work schedule assignments
  - Three work positions: Ticket Seller, Ticket Verifier, Concession Verifier
  
- **Promotions**:
  - Discount codes (percentage or fixed amount)
  - User role-based discounts
  - Minimum order requirements
  - Usage limits and validity periods
  
- **Content Management**:
  - News articles with email distribution
  - Banner advertisements
  - Content scheduling

- **Ticket Management**: View and manage all bookings

## 🗄️ Database Schema

The system uses **PostgreSQL** with **Prisma ORM**. Key entities include:

- **User System**: `NGUOIDUNG`, `LOAINGUOIDUNG` (Customer, Staff, VIP, Admin)
- **Cinema**: `RAP` (Theater), `PHONGCHIEU` (Rooms), `LOAIPHONGCHIEU` (Room Types)
- **Seating**: `GHE` (Seats), `LOAIGHE` (Seat Types), `GIAGHEPHONG` (Pricing)
- **Movies**: `PHIM`, `THELOAI` (Genres), `PHANLOAIDOTUOI` (Age Ratings)
- **Showtimes**: `SUATCHIEU`, `GHE_SUATCHIEU` (Seat Availability)
- **Products**: `SANPHAM`, `DANHMUCSANPHAM`, `COMBO`, `CHITIETCOMBO`
- **Orders**: `HOADON` (Invoices), `VE` (Tickets), `HOADON_COMBO`, `HOADON_SANPHAM`
- **Promotions**: `KHUYENMAI` (Discounts)
- **Staff**: `CALAM` (Shifts), `LICHLAMVIEC` (Work Schedules)
- **Content**: `TINTUC` (News), `BANNERQUANGCAO` (Banners)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Docker & Docker Compose (recommended)
- PostgreSQL 17 (if not using Docker)
- Redis 7 (if not using Docker)

### Environment Variables

#### Backend (.env.development or .env.production)
```env
DATABASE_URL=postgresql://postgres:prisma@postgres:5432/ledocinema
PORT=3000
CLIENT_URL=http://localhost:8080

DEFAULT_RAP=RAP001
DEFAULT_USER_ROLE_KH=KH
DEFAULT_USER_ROLE_NV=NV
DEFAULT_USER_ROLE_VIP=VIP
VIP_THRESHOLD_POINTS=10000

JWT_SECRET=your-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

REDIS_URL=redis://redis:6379

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_RETURN_URL=http://localhost:3000/api/payments/vnpay-return
VNPAY_REDIRECT_NOTIFICATION_URL=http://localhost:5173/checkout-result
VNPAY_STAFF_RETURN_URL=http://localhost:3000/api/staff/payments/vnpay-return
VNPAY_STAFF_REDIRECT_NOTIFICATION_URL=http://localhost:5173/staff/pos

AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

GOOGLE_API_KEY=your-google-api-key
GOOGLE_AI_MODEL=gemini-3-flash-preview
```

### Installation & Running

#### Option 1: Docker Compose (Recommended)

**Development:**
```bash
# Start all services (backend, frontend, postgres, redis)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5434
- Redis: localhost:6379

**Production:**
```bash
# Using production configuration
docker compose -f docker-compose.prod.yml up -d
```

#### Option 2: Local Development

**Backend:**
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

### Database Setup

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed database (if seed script exists)
npx prisma db seed

# Open Prisma Studio to view/edit data
npx prisma studio
```

## 📦 Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Format code

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Format code

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment:

1. **Trigger**: Push to `main` branch or manual workflow dispatch
2. **Build**: 
   - Build Docker images for backend and frontend
   - Push to Docker Hub with tags (latest, git SHA)
   - Use layer caching for faster builds
3. **Deploy**:
   - Copy docker-compose.prod.yml and .env.production to EC2
   - SSH into EC2 instance
   - Pull latest images
   - Restart containers with zero downtime

Docker Images:
- Backend: `ngoohuuphat/mtb-backend:latest`
- Frontend: `ngoohuuphat/mtb-frontend:latest`

## 🌐 API Routes

### Public Routes
- `/api/auth` - Authentication (login, register, forgot password, OTP)
- `/api/movies` - Movies listing and details
- `/api/news` - News articles
- `/api/banners` - Banner advertisements
- `/api/cinema` - Cinema information
- `/api/chatbot` - AI chatbot

### Authenticated Routes
- `/api/profile` - User profile management
- `/api/showtimes` - Showtime information
- `/api/seats` - Seat selection
- `/api/products` - Products and combos
- `/api/discounts` - Discount codes
- `/api/payments` - Payment processing

### Admin Routes (`/api/admin`)
- Movies, genres, age ratings management
- Cinema, rooms, room types, seat types, seat pricing
- Showtimes and ticket management
- Products, product categories, combos
- Users and staff management
- Shifts and work schedules
- Discounts and promotions
- News and banners
- Dashboard analytics

### Staff Routes (`/api/staff`)
- POS for ticket and food sales
- Ticket verification
- Food order verification
- Dashboard and reports

## 🎨 Frontend Routes

### Public Pages
- `/` - Home page
- `/movies/showing` - Currently showing movies
- `/movies/upcoming` - Upcoming movies
- `/movies/:slug` - Movie details
- `/movies` - Search movies
- `/news` - News listing
- `/news/:slug` - News article
- `/about` - About cinema

### Authentication
- `/login` - Login (public only)
- `/register` - Register (public only)
- `/forgot-password` - Password recovery
- `/verify-otp` - OTP verification
- `/reset-password` - Password reset

### Protected (Authenticated)
- `/checkout` - Ticket booking checkout
- `/checkout-result` - Payment result
- `/profile` - User profile

### Admin Portal (`/admin`)
- `/admin/dashboard` - Analytics dashboard
- `/admin/movies` - Movie management
- `/admin/movies/genres` - Genre management
- `/admin/movies/age-ratings` - Age rating management
- `/admin/cinema` - Cinema information
- `/admin/cinema/rooms` - Room management
- `/admin/cinema/room-types` - Room type management
- `/admin/cinema/seat-types` - Seat type management
- `/admin/cinema/seat-prices` - Seat pricing
- `/admin/showtimes` - Showtime scheduling
- `/admin/tickets` - Ticket management
- `/admin/products/categories` - Product categories
- `/admin/products` - Product management
- `/admin/combos` - Combo packages
- `/admin/users` - User management
- `/admin/staff/shifts` - Shift management
- `/admin/staff/schedules` - Work schedules
- `/admin/discounts` - Discount management
- `/admin/news` - News management
- `/admin/banners` - Banner management

### Staff Portal (`/staff`)
- `/staff/dashboard` - Staff dashboard
- `/staff/pos` - Point of Sale system
- `/staff/tickets` - Ticket verification
- `/staff/food-orders` - Food order verification

## 🔐 User Roles & Permissions

The system supports 4 user roles (defined in `LOAINGUOIDUNG`):

1. **Customer (KH)**: Standard users who can book tickets
2. **VIP**: Premium customers (earned at 10,000 points) with exclusive discounts
3. **Staff (NV)**: Cinema employees with access to POS and verification features
4. **Admin**: Full system access for management

Work positions for staff:
- **NhanVienBanVe**: Ticket Seller (POS operations)
- **NhanVienSoatVe**: Ticket Verifier (check-in)
- **NhanVienSoatBapNuoc**: Concession Verifier (food pickup)

## 🎟️ Booking Flow

1. Customer selects movie and showtime
2. Interactive seat selection (real-time availability via Redis)
3. Optional: Add products/combos
4. Apply discount code (if available)
5. Payment via VNPay or cash (staff POS)
6. Generate QR code ticket
7. Email confirmation with PDF ticket
8. Check-in at cinema with QR scan
9. Points awarded after successful visit

## 📊 Key Business Logic

- **Dynamic Pricing**: Seat price = Base price (by seat type) + Room type premium
- **Loyalty System**: Points accumulated per purchase, VIP status at 10,000 points
- **Discount Rules**: Can be percentage or fixed amount, with min order and usage limits
- **Work Scheduling**: Staff assigned to specific shifts (morning/afternoon/evening) with position roles
- **Payment Methods**: VNPay (online), MoMo (planned), Cash (staff only)
- **Ticket States**: DaThanhToan (Paid), DaCheckIn (Checked In)
- **Email Queue**: BullMQ for sending booking confirmations and news newsletters

## 🤖 AI Features

- **Chatbot**: Powered by Google Generative AI (Gemini) for customer support
- Integration through `/api/chatbot` endpoint

## 📱 QR Code System

- Each booking generates a unique QR code (`maQR` in HOADON)
- Used for ticket check-in and food pickup verification
- Scanner integration in staff portal using @yudiel/react-qr-scanner

## 📧 Email Notifications

Automated emails via Nodemailer + BullMQ workers:
- Booking confirmations with PDF tickets
- News article broadcasts to customers
- Password reset links

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- HTTP-only cookies for token storage
- CORS configuration
- Input validation with Zod and validator.js
- Role-based access control (RBAC)
- SQL injection protection via Prisma

## 🌍 Deployment

The application is deployed on **AWS EC2** with:
- Docker containers managed by Docker Compose
- Nginx as reverse proxy and static file server
- SSL/TLS certificates from Let's Encrypt
- PostgreSQL and Redis running in containers
- Automated deployments via GitHub Actions

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ngo Huu Phat**
- Email: ngoohuuphat@gmail.com
- GitHub: [@NgoHuuPhat](https://github.com/NgoHuuPhat)

## 🙏 Acknowledgments

Built with modern web technologies and best practices for scalability, maintainability, and user experience.
