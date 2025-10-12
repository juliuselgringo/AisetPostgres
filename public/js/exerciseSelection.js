/*const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://aiset.juliuselgringo.fr';*/



document.addEventListener('DOMContentLoaded', () => {
    const restaurantButton = document.getElementById("restaurant-button");
    const guessButton = document.getElementById("guess-button")
    const logoutButton = document.getElementById("logout-button");
    
    restaurantButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`/restaurant.html`, {
                method: 'GET',
                credentials: 'include' // Inclure les cookies
            });

            if (response.ok) {
                window.location.href = '/restaurant.html';
            } else {
                // Non autorisé : rediriger vers la page de connexion
                window.location.href = '/index.html';
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Veuillez vous connecter.');
            window.location.href = '/index.html';
        }
    });

    guessButton.addEventListener('click', async (e) => {
        e.preventDefault();

        try{
            const response = await fetch(`/guess.html`, {
                method: 'GET',
                credentials: 'include'
            });

            if(response.ok){
                window.location.href = '/guess.html';
            } else {
                window.location.href = '/index.html';
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Veuillez vous connecter.');
            window.location.href = '/index.html';
        }
        
    });

    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await logoutfct();
    });
});