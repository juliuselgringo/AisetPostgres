import pool from './db.js';

// Fonctions utilitaires pour la table users (à créer dans PostgreSQL)
// Les champs doivent correspondre à la structure initiale du schéma Mongoose

export const createUser = async ({ pseudo, email, password, authToken, tokenExpiry, isVerified = false, verificationToken, isPremium = false, stripeCustomerId, scores = {}, createdAt = new Date() }) => {
    const {
        restaurant = 0,
        wordGuessing = 0,
        totalExercises = 0
    } = scores;
    // Forcer l'enregistrement de la date d'expiration en UTC (format ISO)
    const tokenExpiryUTC = tokenExpiry ? new Date(tokenExpiry).toISOString() : null;
    const createdAtUTC = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
    const result = await pool.query(
        `INSERT INTO users (pseudo, email, password, auth_token, token_expiry, is_verified, verification_token, is_premium, stripe_customer_id, score_restaurant, score_wordguessing, score_totalexercises, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [pseudo, email, password, authToken, tokenExpiryUTC, isVerified, verificationToken, isPremium, stripeCustomerId, restaurant, wordGuessing, totalExercises, createdAtUTC]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

export const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const updateUserToken = async (email, authToken, tokenExpiry) => {
    // Forcer l'enregistrement de la date d'expiration en UTC (format ISO)
    const tokenExpiryUTC = tokenExpiry ? new Date(tokenExpiry).toISOString() : null;
    const result = await pool.query(
        'UPDATE users SET auth_token = $1, token_expiry = $2 WHERE email = $3 RETURNING *',
        [authToken, tokenExpiryUTC, email]
    );
    return result.rows[0];
};

// Ajoute d'autres fonctions selon les besoins (update password, scores, etc.)