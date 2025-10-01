const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://aiset.juliuselgringo.fr';

export async function registerfct(e){    
    
    const pseudoInput = document.getElementById("pseudo");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordConfirmationInput = document.getElementById("password-confirmation");
    const security = document.getElementById("security");

    const regex = /^(?!.*[<>'"`\\])[A-Za-z0-9!@#$%&*;:,./?`]{4,}$/g;

    
    e.preventDefault();
    const pseudoDirt = pseudoInput.value.trim();
    const pseudo = DOMPurify.sanitize(pseudoDirt);

    const emailDirt = emailInput.value.trim();
    const email = DOMPurify.sanitize(emailDirt);

    const passwordConfirmationDirt = passwordConfirmationInput.value.trim();
    const passwordConfirmation = DOMPurify.sanitize(passwordConfirmationDirt);


    const passwordDirt = passwordInput.value.trim();
    const password = DOMPurify.sanitize(passwordDirt);

    if(pseudo === "" || email === "" || password === "" || passwordConfirmation === ""){
        alert("Saisie invalide!!!");
    }

    if(password === passwordConfirmation && regex.test(password)){
        security.style.color = "green";
        

        try{
            const response = await fetch (`${API_URL}/auth/register`, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({pseudo, email, password, passwordConfirmation})
            });

            console.log('Statut de la réponse:', response.status);
            
            if(response.ok){
                const data = await response.json();
                alert('Les données ont été transmise avec succès!');
                window.location.href = '/loginPage.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
                console.error('Erreur serveur:', response.status, errorData);
                alert(`Echec lors de la transmission des données. Code: ${response.status}`);
            }
        } catch (error){
            console.error('Erreur réseau ou serveur:', error);
            alert("Une erreur est survenue lors de l'enregistrement des données.");
        }
    }else {
        security.style.color = "red";
        alert("Mot de passe invalide!");
    }


}