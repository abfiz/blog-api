const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await User.deleteMany();
  await Blog.deleteMany();

  await request(app).post('/api/auth/register').send({
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    password: 'password123'
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'jane@example.com',
    password: 'password123'
  });

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Blog Endpoints', () => {
  let createdBlogId;

  it('should fail to create blog without token', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .send({
        title: 'No Auth Blog',
        body: 'Blog content'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message || res.body.error).toMatch(/unauthorized/i);
  });

  it('should fail to create blog with missing fields', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        body: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should create a blog', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'First Blog',
        description: 'Blog description',
        tags: ['test', 'blog'],
        body: 'This is the body of the blog.'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('First Blog');
    expect(res.body.reading_time).toBeDefined();

    createdBlogId = res.body._id;
  });

  it('should get all published blogs', async () => {
    const res = await request(app).get('/api/blogs');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get my blogs', async () => {
    const res = await request(app)
      .get('/api/blogs/me/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a blog', async () => {
    const res = await request(app)
      .put(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Blog Title' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toBe('Updated Blog Title');
  });

  it('should fail to update another user\'s blog', async () => {
    const anotherUser = await request(app).post('/api/auth/register').send({
      first_name: 'Another',
      last_name: 'User',
      email: 'another@example.com',
      password: 'password123'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'another@example.com',
      password: 'password123'
    });

    const newToken = loginRes.body.token;

    const res = await request(app)
      .put(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${newToken}`)
      .send({ title: 'Should Not Update' });

    expect(res.statusCode).toBe(404);
  });

  it('should delete the blog', async () => {
    const res = await request(app)
      .delete(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Blog deleted successfully');
  });
});
