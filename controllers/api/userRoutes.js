router.post('/login', async (req, res) => {
    try {
    const { email, password } = req.body;
      const dbUserData = await User.findOne({ where: { email } }); // Corrected from 'name' to 'email'
    if (!dbUserData || !(await dbUserData.checkPassword(password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.name = dbUserData.name;
        req.session.logged_in = true;
        res.status(200).json({ message: 'Login successful' });
    });
    } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
    }
});



router.post('/signup', async (req, res) => {
    try {
        const dbUserData = await User.create(req.body);
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.name = dbUserData.name;
            req.session.logged_in = true;
            res.status(200).json({ message: 'Account created successfully', redirectTo: '/profile' }); // JSON response with redirection info
        });
    } catch (err) {
        res.status(400).json(err);
    }
});


router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
    req.session.destroy(() => {
        res.status(204).end();
    });
    } else {
    res.status(404).end();
    }
});