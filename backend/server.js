const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dojos', require('./routes/dojos'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kyokushin-karate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🥋 MongoDB Connected'))
.catch(err => console.log('Database connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: '🎌 Kyokushin Karate Platform API' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
