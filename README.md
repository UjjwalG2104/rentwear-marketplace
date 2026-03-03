# RentWear - Premium Clothing Rental Marketplace

A professional full-stack web application for renting high-quality clothing items. Built with modern technologies to provide a seamless experience for both renters and clothing owners.

## 🌟 Features

### For Renters
- **Browse & Search**: Find clothing items by category, size, color, brand, and location
- **Advanced Filtering**: Filter by price range, condition, availability dates
- **Detailed Listings**: High-quality images, detailed descriptions, and owner information
- **Secure Booking**: Easy rental process with flexible duration options
- **Reviews & Ratings**: Make informed decisions with community feedback
- **User Profiles**: Manage personal information and rental history

### For Owners
- **Easy Listing**: Simple process to add clothing items with photos
- **Inventory Management**: Track availability, pricing, and rental history
- **Booking Management**: Accept, reject, or manage rental requests
- **Earnings Dashboard**: Monitor income and rental statistics
- **Communication**: Direct messaging with renters
- **Protection**: Insurance coverage for all rentals

### Platform Features
- **User Authentication**: Secure registration and login system
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Availability**: Live calendar showing item availability
- **Geolocation**: Find items near you or arrange delivery
- **Payment Integration**: Secure payment processing (Stripe ready)
- **Review System**: Two-way reviews and ratings
- **Search & Discovery**: Advanced search with filters and sorting
- **Admin Dashboard**: Manage users, listings, and platform operations

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage and processing
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **React Hot Toast** - Notification system
- **Axios** - HTTP client
- **Date-fns** - Date manipulation

### Development Tools
- **Concurrently** - Run multiple scripts
- **Nodemon** - Auto-restart server during development

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image storage)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Rental marketplace for clothes"
```

### 2. Install Dependencies
```bash
npm run install-deps
```

### 3. Environment Configuration

#### Backend Environment
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clothes-rental
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend Environment
The frontend is configured to proxy requests to the backend server running on port 5000.

### 4. Start the Application

#### Development Mode
```bash
npm run dev
```
This will start both the backend server (port 5000) and frontend development server (port 3000) concurrently.

#### Individual Services
```bash
# Start backend only
npm run server

# Start frontend only
npm run client
```

#### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🗂 Project Structure

```
Rental marketplace for clothes/
├── server/                     # Backend application
│   ├── models/                # Database models
│   │   ├── User.js
│   │   ├── Clothing.js
│   │   ├── Rental.js
│   │   └── Review.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── clothing.js
│   │   ├── rentals.js
│   │   └── reviews.js
│   ├── middleware/            # Custom middleware
│   │   └── auth.js
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── index.js               # Server entry point
├── client/                    # Frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   └── UI/
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json               # Root package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Clothing
- `GET /api/clothing` - Get all clothing items (with filters)
- `GET /api/clothing/:id` - Get single clothing item
- `POST /api/clothing` - Create new listing (protected)
- `PUT /api/clothing/:id` - Update listing (protected)
- `DELETE /api/clothing/:id` - Delete listing (protected)
- `GET /api/clothing/user/listings` - Get user's listings (protected)

### Rentals
- `POST /api/rentals` - Create rental request (protected)
- `GET /api/rentals/my-rentals` - Get user's rentals (protected)
- `GET /api/rentals/my-items-rentals` - Get rentals for user's items (protected)
- `GET /api/rentals/:id` - Get single rental (protected)
- `PUT /api/rentals/:id/status` - Update rental status (protected)
- `GET /api/rentals/check-availability/:clothingId` - Check availability

### Reviews
- `POST /api/reviews` - Create review (protected)
- `GET /api/reviews/clothing/:clothingId` - Get clothing reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/:id` - Get single review
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)
- `POST /api/reviews/:id/response` - Add response to review (protected)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/search/:query` - Search users

## 🎯 Key Features Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (user/admin)
- Protected routes and middleware
- Password hashing with bcrypt

### Image Management
- Cloudinary integration for image storage
- Automatic image optimization and resizing
- Multiple image uploads per listing
- Image deletion when listing is removed

### Search & Filtering
- Full-text search with MongoDB text indexes
- Advanced filtering by multiple criteria
- Geospatial search for location-based queries
- Sorting options (price, date, popularity)

### Rental System
- Availability checking with date overlap detection
- Flexible rental periods (daily, weekly, monthly pricing)
- Automatic price calculation
- Status tracking (pending, confirmed, active, completed)

### Review System
- Two-way reviews (renter ↔ owner)
- Rating system with multiple criteria
- Review responses from owners
- Automatic rating updates

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the build folder to your hosting service
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact:
- Email: support@rentwear.com
- Phone: 1-800-RENT-WEAR
- Website: https://rentwear.com

## 🌟 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] AI-powered recommendations
- [ ] Social media integration
- [ ] Loyalty program
- [ ] Subscription model
- [ ] Virtual try-on feature
- [ ] Sustainability impact tracker
