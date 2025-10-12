const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/User.js');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies['auth-token'];
    
        if (!token) {
            console.log('❌ [AUTH] Aucun token fourni');
            return res.status(401).json({ message: 'Token d\'authentification requis' });
        }

        const verified = jwt.verify(token, process.env.TOKEN);
        req.user = verified;
    
        // Log seulement en mode debug ou lors de nouveaux logins
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH] Token valide pour utilisateur:', verified.id);
        }
        next();
    
    } catch (error) {
        console.error('❌ [AUTH] Token invalide:', error.message);
        res.status(401).json({ message: 'Token invalide' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies['auth-token'];
        if (token) {
            const verified = jwt.verify(token, process.env.TOKEN);
            if (verified.exp) {
                const expUTC = new Date(verified.exp * 1000);
            }
            const user = await findUserById(verified._id);
            if (
                user &&
                user.auth_token === token &&
                (!user.token_expiry || new Date(user.token_expiry).getTime() > Date.now())
            ) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        next();
    }
};

module.exports = verifyToken;
module.exports.optionalAuth = optionalAuth;