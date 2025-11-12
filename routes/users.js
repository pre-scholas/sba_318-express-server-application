import express from 'express'

const router = express.Router()

import users from '../data/users.js'

// Creating a GET route for the entire users database.
// This would be impractical in larger data sets.
router.get("/", (req, res) => {
  console.log(req.query)
  console.log(req.params)
  res.json(users);
});


// Creating a simple POST route for individual users,
router.post("/", (req, res) => {
    if (req.body.name && req.body.username && req.body.email) {
        // Check if username is already taken
        if (users.find((u) => u.username == req.body.username)) {
            return res.status(409).json({ error: "Username Already Taken." });
        }

        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
        };

        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).json({ error: "Insufficient data. Name, username, and email are required." });
    }
})

// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user) 
  } else {
    next()
  }
});


export default router