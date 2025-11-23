import express from 'express';
import users from './data/users.js';
import posts from './data/posts.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// This middleware is required to parse JSON from the request body
app.use(express.json());

// This middleware is used to serve static files from the 'public' directory
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// A route to render the EJS template with posts data
app.get('/', (req, res) => {
  // 1. Map over the posts to create a new array of posts with author information
  const postsWithAuthors = posts.map(post => {
    // 2. For each post, find the author in the 'users' array
    const author = users.find(user => user.id === post.userId);
    // 3. Return a new object that combines post data with the author's name (or 'Unknown' if not found)
    return { ...post, authorName: author ? author.name : 'Unknown Author' };
  });

  // 'index' refers to 'views/index.ejs'. The second argument passes data to the template.
  res.render('index', { salesPosts: postsWithAuthors, title: 'Bike Sales' });
});

// A simple GET route to see all users
app.get('/users', (req, res) => {
  res.json(users);
});

// A route to render a page with all users
app.get('/users/list', (req, res) => {
  res.render('users', { users: users, title: 'All Users' });
});

// A simple GET route to see all posts, with optional filtering by userId
app.get('/posts', (req, res) => {
  const { userId } = req.query;

  if (userId) {
    // Filter posts by the provided userId
    const filteredPosts = posts.filter(
      (post) => post.userId === parseInt(userId)
    );
    res.json(filteredPosts);
  } else {
    // If no userId is provided, return all posts
    res.json(posts);
  }
});

// GET a single post by ID
app.get('/posts/:id', (req, res) => {
  // 1. Get the id from the URL params. It's a string, so we need to parse it to an integer.
  const postId = parseInt(req.params.id);

  // 2. Find the post in the 'posts' array
  const post = posts.find((p) => p.id === postId);

  // 3. If the post is found, send it. Otherwise, send a 404 error.
  if (post) {
    // 4. Find the author of the post using the userId from the post
    const author = users.find(user => user.id === post.userId);

    // 5. Render the template, passing both the post and the author
    res.render('post', { post: post, author: author, title: 'Post Details' });
  } else {
    res.status(404).send('Post not found'); // Or render a 404 page
  }
});

// The route to add a new user
app.post('/users', (req, res) => {
  // 1. Get user data from the request body
  const { name, username, email } = req.body;

  // 2. Basic validation
  if (!name || !username || !email) {
    return res.status(400).json({ error: 'Missing required fields: name, username, email' });
  }

  // 3. Generate a new unique ID
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  // 4. Create the new user object
  const newUser = {
    id: newId,
    name,
    username,
    email
  };

  // 5. Add the new user to the in-memory array
  users.push(newUser);

  // 6. Respond with the newly created user
  res.status(201).json(newUser);
});

// PATCH route to update a user's details
app.patch('/users/:id', (req, res) => {
  // 1. Get the user ID from params and find the user
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: `User with ID ${userId} not found.` });
  }

  // 2. Get the potential updates from the request body
  const { name, username, email } = req.body;

  // 3. Update user fields if they are provided in the request
  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;

  // 4. Respond with the updated user
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});