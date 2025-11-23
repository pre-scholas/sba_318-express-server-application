import express from 'express';
import users from './data/users.js';
import posts from './data/posts.js';

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

// GET a single user by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET a single post by ID
app.get('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Post not found' });
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

// POST route to create a new post
app.post('/posts', (req, res) => {
  const { userId, bikeDescription, price, image } = req.body;
  
  if (!userId || !bikeDescription || !price) {
    return res.status(400).json({ error: 'Missing required fields: userId, bikeDescription, price' });
  }
  
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  const newPost = { id: newId, userId, bikeDescription, price, image };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

// PUT route to update a user completely
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { name, username, email } = req.body;
  if (!name || !username || !email) {
    return res.status(400).json({ error: 'Missing required fields: name, username, email' });
  }
  
  users[userIndex] = { id: userId, name, username, email };
  res.json(users[userIndex]);
});

// PATCH route to update a user partially
app.patch('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { name, username, email } = req.body;
  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;
  
  res.json(user);
});

// PUT route to update a post completely
app.put('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const { userId, bikeDescription, price, image } = req.body;
  if (!userId || !bikeDescription || !price) {
    return res.status(400).json({ error: 'Missing required fields: userId, bikeDescription, price' });
  }
  
  posts[postIndex] = { id: postId, userId, bikeDescription, price, image };
  res.json(posts[postIndex]);
});

// PATCH route to update a post partially
app.patch('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const { userId, bikeDescription, price, image } = req.body;
  if (userId) post.userId = userId;
  if (bikeDescription) post.bikeDescription = bikeDescription;
  if (price) post.price = price;
  if (image) post.image = image;
  
  res.json(post);
});

// DELETE route to delete a user
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.status(204).send();
});

// DELETE route to delete a post
app.delete('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  posts.splice(postIndex, 1);
  res.status(204).send();
});

// View routes (separate from API)
app.get('/view/users', (req, res) => {
  res.render('users', { users: users, title: 'All Users' });
});

app.get('/view/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const author = users.find(user => user.id === post.userId);
    res.render('post', { post: post, author: author, title: 'Post Details' });
  } else {
    res.status(404).send('Post not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});