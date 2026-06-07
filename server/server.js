import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import askRoutes from './routes/askRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware

// Strict Allowed Origins
const allowedOrigins = [
  'https://veag.tech',
  'https://www.veag.tech'
];

// Allow localhost and tools like Postman only in development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:3000');
}

// 1. Strict CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) ONLY in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    return callback(new Error('Blocked by CORS Policy'), false);
  },
  credentials: true
};

app.use(cors(corsOptions));

// 2. Strict Origin Checker Middleware (Blocks non-browser tools in production)
app.use((req, res, next) => {
  // Skip this strict check in development so Postman/Thunderclient works
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Health check should be globally accessible for uptime monitoring services
  if (req.path === '/api/health') {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    return res.status(403).json({ 
      error: 'Forbidden. Direct API access is not allowed. Requests must originate from veag.tech.' 
    });
  }

  try {
    const originUrl = new URL(origin);
    if (!allowedOrigins.includes(originUrl.origin)) {
      return res.status(403).json({ 
        error: 'Forbidden. Invalid origin. Requests must originate from veag.tech.' 
      });
    }
  } catch (error) {
    return res.status(403).json({ 
      error: 'Forbidden. Malformed origin header.' 
    });
  }

  next();
});

app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'VeAg Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Blocked by CORS Policy') {
    return res.status(403).json({ error: 'CORS policy violation. Origin not allowed.' });
  }

  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
