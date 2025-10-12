// Startup universel pour local et o2switch
console.log('[STARTUP] Démarrage de l\'application...');

// Timeout global pour éviter les blocages
const startupTimeout = setTimeout(() => {
    console.error('[STARTUP] TIMEOUT - Arrêt forcé après 10 secondes');
    process.exit(1);
}, 10000);

try {
    const app = require('./server.js');
    
    // Nettoyage du timeout si succès
    clearTimeout(startupTimeout);
    
    // En mode Passenger (o2switch), exporter l'app
    if (typeof PhusionPassenger !== 'undefined') {
        console.log('[STARTUP] Mode Passenger - Export de l\'application');
        module.exports = app;
    } else {
        // En mode local, l'app écoute déjà dans server.js
        console.log('[STARTUP] Mode local - Application démarrée via server.js');
    }
    
} catch (error) {
    console.error('[STARTUP] Erreur fatale:', error.message);
    clearTimeout(startupTimeout);
    process.exit(1);
}