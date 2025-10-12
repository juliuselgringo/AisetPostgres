// Point d'entrée pour o2switch avec Passenger
try {
    const app = require('./server.js');
    console.log('[APP] Application chargée avec succès');
    module.exports = app;
} catch (error) {
    console.error('[APP] Erreur lors du chargement:', error);
    throw error;
}