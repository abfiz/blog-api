const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes'); // ✅ Make sure this file is named exactly blogRoutes.js

router.use('/auth', authRoutes);   // /api/auth/...
router.use('/blogs', blogRoutes);  // /api/blogs/...

module.exports = router;
