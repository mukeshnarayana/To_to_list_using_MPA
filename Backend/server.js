require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./Server/config/db');
const authRoutes = require('./Server/routes/authRoutes');
const todoRoutes = require('./Server/routes/todoRoutes');
const { setupSwagger } = require('./Server/config/swagger');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());

// Setup Swagger Docs
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('API is running... Visit /api-docs for API documentation.');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

