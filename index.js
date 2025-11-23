// create restful api 
import express from 'express';
import userRoutes from './routes/users.js';
import postRoutes from './routes/post.js';

const app = express(); 
const port = 3000;

app.set('view engine', 'ejs');

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use((req, res, next) => {
  const time = new Date();
  console.log(`${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`);
  next();
});

// Use the routers for specific API paths
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Root route
app.get('/', (req, res) =>
  res.render('index')
);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Resource Not Found' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});