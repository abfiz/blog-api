const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// ✅ Import full controller object
const blogController = require('../controllers/blogController');

const {
  createBlogValidation,
  updateBlogValidation,
  handleValidationErrors
} = require('../middlewares/validators');

// ✅ Confirm file and middleware/controller functions are loaded
console.log('✅ blogRoutes.js is loaded');
console.log('💡 createBlog loaded as:', typeof blogController.createBlog);
console.log('💡 auth loaded as:', typeof auth);
console.log('💡 createBlogValidation loaded as:', typeof createBlogValidation);
console.log('💡 updateBlogValidation loaded as:', typeof updateBlogValidation);
console.log('💡 handleValidationErrors loaded as:', typeof handleValidationErrors);

// 🔓 Public routes
router.get('/', blogController.getPublishedBlogs);        // GET /api/blogs
router.get('/:id', blogController.getBlogById);           // GET /api/blogs/:id

// 🔒 Protected routes
router.post('/', auth, createBlogValidation, handleValidationErrors, blogController.createBlog);   // POST /api/blogs
router.get('/me/all', auth, blogController.getMyBlogs);                                            // GET /api/blogs/me/all
router.put('/:id', auth, updateBlogValidation, handleValidationErrors, blogController.updateBlog); // PUT /api/blogs/:id
router.delete('/:id', auth, blogController.deleteBlog);                                            // DELETE /api/blogs/:id

module.exports = router;
