const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db.js');
const verifyToken = require('../middlewares/verifyToken.js');
const sanitizeInputs = require('../middlewares/sanitizeInputs.js');
const sanitizeLogin = require('../middlewares/sanitizeLogin.js');

const router = Router();

router.post('/register', sanitizeInputs, async (req, res) => {
  try {
    // Utiliser les données sanitisées
    const { pseudo, email, password, passwordConfirmation } = req.body.sanitizedInputs;

    if (!pseudo || !email || !password || !passwordConfirmation) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    if (password !== passwordConfirmation) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      'INSERT INTO users (pseudo, email, password, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id,pseudo,email',
      [pseudo, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Utilisateur créé',
      user: insertResult.rows[0]
    });
  } catch (error) {
    console.error('[REGISTER][ERROR]', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

router.post('/login', sanitizeLogin, async (req, res) => {
  try {
    // Utiliser les données sanitisées
    const { email, password } = req.body.sanitizedLogin;
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const userResult = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Mot de passe incorrect' });

    if (!process.env.TOKEN) {
      console.error('[LOGIN][ERROR] TOKEN manquant');
      return res.status(500).json({ message: 'Config invalide' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN, { expiresIn: '1h' });

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 3600 * 1000
    }).json({ message: 'Connexion réussie', redirectUrl: '/exerciseSelection.html' });
  } catch (error) {
    console.error('[LOGIN][ERROR]', error.message);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

router.post('/logout', verifyToken, (req, res) => {
  try {
    res.clearCookie('auth-token').json({ message: 'Déconnexion réussie', redirectUrl: '/index.html' });
  } catch (error) {
    console.error('[LOGOUT][ERROR]', error.message);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;

