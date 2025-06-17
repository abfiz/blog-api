const Blog = require('../models/Blog');
const calculateReadingTime = require('../utils/calculateReadingTime');

// Create a blog
const createBlog = async (req, res) => {
  try {
    const reading_time = calculateReadingTime(req.body.body);
    const blog = new Blog({
      ...req.body,
      author: req.user.id,
      reading_time
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all published blogs (with filters, search, pagination)
const getPublishedBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      title,
      tags,
      author,
      orderBy = 'timestamp',
      order = 'desc'
    } = req.query;

    const filter = { state: 'published' };
    if (title) filter.title = new RegExp(title, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    if (author) filter.author = author;

    const blogs = await Blog.find(filter)
      .sort({ [orderBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'first_name last_name email');

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single blog by ID and increment read count
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, state: 'published' }).populate(
      'author',
      'first_name last_name email'
    );
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    blog.read_count += 1;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs by the logged-in user
const getMyBlogs = async (req, res) => {
  try {
    const filter = { author: req.user.id };
    if (req.query.state) filter.state = req.query.state;

    const blogs = await Blog.find(filter);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a blog (only by the owner)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const updatableFields = ['title', 'description', 'tags', 'body', 'state'];
    updatableFields.forEach(field => {
      if (req.body[field]) blog[field] = req.body[field];
    });

    if (req.body.body) {
      blog.reading_time = calculateReadingTime(req.body.body);
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a blog (only by the owner)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBlog,
  getPublishedBlogs,
  getBlogById,
  getMyBlogs,
  updateBlog,
  deleteBlog
};
