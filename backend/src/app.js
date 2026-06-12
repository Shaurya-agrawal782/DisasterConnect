const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Standard middlewares
app.use(express.json());
app.use(cookieParser());

// Morgan logger for development environment
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Route mounts
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);

// 404 Route Not Found interceptor
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
