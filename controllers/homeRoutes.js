//controller/homeRoutes.js

const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth')

// Retrieve all posts for the homepage *
//http://localhost:3001/api/posts
router.get('/', async (req, res) => {
    try {
        // Get all projects and JOIN with user data
        const postData = await Post.findAll({
            include: [{ model: User, attributes: ['username'] }] 
        });

        // Serialize data so the template can read it
        const posts = postData.map((post) => post.get({ plain: true }));

        res.render('homepage', { posts,  
        logged_in: req.session.logged_in  });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

//Render single post view
router.get('/post/:id/comments', withAuth, async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User, // Include User model
                    attributes: ['username'], // Only include the username attribute
                },
                {
                    model: Comment, include: [User],
                }
            ],
        });

        if (!postData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }

        const post = postData.get({ plain: true });
        const isAuthor = post.user_id === req.session.user_id;

        res.render('singlepost', {
            post, isAuthor, logged_in: req.session.logged_in
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});


router.get('/post/:postId/comments', async (req, res) => {
    const postId = req.params.postId;
    try {
        const postData = await Post.findByPk(postId, {
            include: [
                {
                    model: Comment,
                    include: [User] // Including User to get username
                }
            ]
        });

        if (!postData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }

        const post = postData.get({ plain: true });

        res.render('singlepost', { 
            post, 
            comments: post.Comments, 
            logged_in: req.session.logged_in 
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Render edit post form
router.get('/posts/edit/:id', withAuth, async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id);

        if (!postData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }

        const post = postData.get({ plain: true });

        // Check if the authenticated user is the owner of the post
        if (post.user_id !== req.session.user_id) {
            res.status(403).json({ message: 'You do not have permission to edit this post' });
            return;
        }

        // Render the edit post form with the post data
        res.render('editPost', {
            post,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch post data' });
    }
});

// profile route *
router.get('/profile', withAuth, async (req, res) => {
    try {
        // Find the logged-in user based on the session ID
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [
                { 
                    model: Post, 
                    include: [{ model: Comment, attributes: ['id', 'comment_text'] }] 
                }
            ],
        });

        const user = userData.get({ plain: true });

        res.render('profile', {
            ...user,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});


//Login *
router.get("/login", (req, res) => {
    if (req.session.logged_in){
        res.redirect('/profile');
        return;
    }
    res.render('login');
})

// route for the newpost form *
router.get('/newpost', (req, res) => {
    if (req.session.logged_in) {
        res.render('newpost', {
            logged_in: true,
        });
        return;
    }
})

// route for my contact information *
router.get('/contact', (req, res) => {
    res.render('contact');
});

module.exports = router;
