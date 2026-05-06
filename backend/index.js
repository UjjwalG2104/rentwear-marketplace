const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/database');

// Connect to database
connectDB();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clothingRoutes = require('./routes/clothing');
const rentalRoutes = require('./routes/rentals');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting — trust proxy on Render/Heroku
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { trustProxy: false } // suppress trustProxy warning
});
app.use('/api/', limiter);

// Trust reverse proxy (needed on Render)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS — supports comma-separated list of allowed origins
// Set CLIENT_URL on Render to your Vercel URL(s), e.g.
// CLIENT_URL=https://rentwear.vercel.app,https://rentwear-git-main.vercel.app
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin) and all listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow all localhost ports
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Allow health checks even if DB is down
app.get('/api/health', (req, res) => {
  const connectionStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: connectionStates[mongoose.connection.readyState] || 'unknown'
  });
});

// Return a clear error when DB is unavailable (env-aware message)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(503).json({
      message: isProd
        ? 'Service temporarily unavailable. Please try again shortly.'
        : 'Database unavailable. Please start MongoDB and try again.'
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
