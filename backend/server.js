const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const MONGODB_URI = 'mongodb+srv://admin:admin123@cluster0.xobl9pr.mongodb.net/?appName=Cluster0';
const DB_NAME = 'tournament_db';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, wechatId, phone } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
      wechatId: wechatId || null,
      phone: phone || null,
      subscriptionType: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('users').insertOne(user);
    const userId = result.insertedId.toString();

    // Create default subscription
    await db.collection('subscriptions').insertOne({
      userId,
      type: 'free',
      status: 'active',
      aiUsageCount: 0,
      aiUsageLimit: 5,
      freeDownloadTokens: 0,
      hasUploadAccess: false,
      createdAt: new Date().toISOString()
    });

    // Generate JWT token
    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName,
        subscriptionType: user.subscriptionType
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '注册失败' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        subscriptionType: user.subscriptionType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      subscriptionType: user.subscriptionType
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    delete updates.email; // Don't allow email updates

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    );

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    res.json({
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      subscriptionType: user.subscriptionType
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ==================== TOURNAMENT ROUTES ====================

// Get all tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await db.collection('tournaments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(tournaments.map(t => ({ ...t, id: t._id.toString() })));
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

// Get tournament by ID
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(req.params.id) });
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json({ ...tournament, id: tournament._id.toString() });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ message: 'Failed to fetch tournament' });
  }
});

// Create tournament
app.post('/api/tournaments', authenticateToken, async (req, res) => {
  try {
    const tournament = {
      ...req.body,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('tournaments').insertOne(tournament);
    res.status(201).json({ ...tournament, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Failed to create tournament' });
  }
});

// Update tournament
app.put('/api/tournaments/:id', authenticateToken, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates.id;

    await db.collection('tournaments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    res.json({ message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ message: 'Failed to update tournament' });
  }
});

// Delete tournament
app.delete('/api/tournaments/:id', authenticateToken, async (req, res) => {
  try {
    await db.collection('tournaments').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Failed to delete tournament' });
  }
});

// ==================== TOPIC ROUTES ====================

// Get all topics
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await db.collection('topics')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(topics.map(t => ({ ...t, id: t._id.toString() })));
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Failed to fetch topics' });
  }
});

// Get topic by ID
app.get('/api/topics/:id', async (req, res) => {
  try {
    const topic = await db.collection('topics').findOne({ _id: new ObjectId(req.params.id) });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json({ ...topic, id: topic._id.toString() });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Failed to fetch topic' });
  }
});

// Create topic
app.post('/api/topics', authenticateToken, async (req, res) => {
  try {
    const topic = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('topics').insertOne(topic);
    res.status(201).json({ ...topic, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Failed to create topic' });
  }
});

// Update topic
app.put('/api/topics/:id', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;

    await db.collection('topics').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    res.json({ message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Failed to update topic' });
  }
});

// Delete topic
app.delete('/api/topics/:id', authenticateToken, async (req, res) => {
  try {
    await db.collection('topics').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Failed to delete topic' });
  }
});

// ==================== SUBSCRIPTION ROUTES ====================

// Get user subscription
app.get('/api/subscriptions/me', authenticateToken, async (req, res) => {
  try {
    const subscription = await db.collection('subscriptions').findOne({ userId: req.user.id });
    
    if (!subscription) {
      // Return default free subscription
      return res.json({
        type: 'free',
        status: 'active',
        aiUsageCount: 0,
        aiUsageLimit: 5,
        hasUploadAccess: false,
        freeDownloadTokens: 0
      });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// Use free download token
app.post('/api/subscriptions/use-token', authenticateToken, async (req, res) => {
  try {
    await db.collection('subscriptions').updateOne(
      { userId: req.user.id },
      { $inc: { freeDownloadTokens: -1 } }
    );

    res.json({ message: 'Token used successfully' });
  } catch (error) {
    console.error('Use token error:', error);
    res.status(500).json({ message: 'Failed to use token' });
  }
});

// Increment AI usage
app.post('/api/subscriptions/increment-ai-usage', authenticateToken, async (req, res) => {
  try {
    await db.collection('subscriptions').updateOne(
      { userId: req.user.id },
      { $inc: { aiUsageCount: 1 } }
    );

    res.json({ message: 'AI usage incremented' });
  } catch (error) {
    console.error('Increment AI usage error:', error);
    res.status(500).json({ message: 'Failed to increment AI usage' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



