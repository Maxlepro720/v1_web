// --- SCRIPT SECRET AVEC DÉLAI DE 1.5s ET PERSISTANCE ---

const keysPressed = {};
const DELAY = 1500; // Délai de 1.5 seconde

function applySecretMode() {
    document.title = "Lycée Fabert";
    
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyG0nYjsBnwHhYCFo1xd88b_qOxaKEHZZabw&s";
}

// Vérification au chargement de la page
if (sessionStorage.getItem('secretModeActive') === 'true') {
    applySecretMode();
}

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;

    // Vérification de la combinaison
    if (keysPressed['m'] && keysPressed['b'] && keysPressed['n']) {
        sessionStorage.setItem('secretModeActive', 'true');
        applySecretMode();
        console.log("Combinaison réussie !");
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    
    // Au lieu de supprimer tout de suite, on attend 1.5s
    setTimeout(() => {
        delete keysPressed[key];
    }, DELAY);
});