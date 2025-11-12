import express from 'express'

const router = express.Router()

import posts from '../data/posts.js'

// Creating a GET route for the entire posts database.
// This would be impractical in larger data sets.
router.get("/salesPosts", (req, res) => {
    res.json(posts);
});

// Creating a simple GET route for individual posts,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
    const post = posts.find((p) => p.id == req.params.id);
    if (post) {
        res.json(post);
    } else {
        next()
    }
});

export default router