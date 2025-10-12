/*const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://aiset.juliuselgringo.fr';*/

async function loginfct(e){

    const emailLoginInput = document.getElementById("email-login");
    const passwordLoginInput = document.getElementById("password-login");
    const regex = /^(?!.*[<>'"`\\])[A-Za-z0-9!@#$%&*;:,./?`]{4,}$/g;

    e.preventDefault();

    const emailDirt = emailLoginInput.value.trim();
    const email = DOMPurify.sanitize(emailDirt);
    const passwordDirt = passwordLoginInput.value.trim();
    const password = DOMPurify.sanitize(passwordDirt);

    if (email === "" || password === "") {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    if(regex.test(password)){
        security.style.color = "green";
    }

    try {
        const response = await fetch(`/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important pour envoyer les cookies
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.redirectUrl;
            alert("Connexion réussie !");
        } else {
            alert("Échec de la connexion. Vérifiez vos identifiants.");
        }
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
    
}
