// --- FONCTION DE MISE À JOUR DU TOTAL ---
function updateCasinoMoney() {
    let plinko = parseFloat(sessionStorage.getItem('plinko_money')) || 0;
    let blackjack = parseFloat(sessionStorage.getItem('blackjack_chips')) || 0;
    let roulette = parseFloat(sessionStorage.getItem('roulette_gold')) || 0;
    let mines = parseFloat(sessionStorage.getItem('mines_coins')) || 0;
    let cups = parseFloat(sessionStorage.getItem('magic_orbs')) || 0;
    let savings = parseFloat(localStorage.getItem('money_save')) || 0;

    let total = plinko + blackjack + roulette + mines + cups + savings;
    
    window.casino_money = total;
    // On stocke le total calculé pour référence
    sessionStorage.setItem('casino_money_total_calculated', total);
}

// --- FONCTION DE DISTRIBUTION INITIALE ---
function distributeMoney() {
    const keys = ['plinko_money', 'blackjack_chips', 'roulette_gold', 'mines_coins', 'magic_orbs'];
    
    // VERIFICATION : Si une clé existe déjà, on ne distribue pas (on ne partage pas)
    if (sessionStorage.getItem('plinko_money') !== null) {
        console.log("[Banque] Session active détectée, conservation des soldes.");
        return; 
    }

    console.log("[Banque] Nouvelle session, distribution de l'argent serveur...");
    let totalADistribuer = window.casino_money || 0;
    
    if (totalADistribuer > 0) {
        const partEgale = totalADistribuer / 5;
        keys.forEach(key => sessionStorage.setItem(key, partEgale));
    } else {
        keys.forEach(key => sessionStorage.setItem(key, 0));
    }
    updateCasinoMoney();
}

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://project-3-api-2bgb.onrender.com";
    const CURRENT_USER = localStorage.getItem('username');

    window.game_money = 0;
    window.game_success = [];

    // --- INTERFACE (Minuteur) ---
    const timerBox = document.createElement('div');
    timerBox.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        padding: 10px 20px;
        background:transparent;
        color: transparent;
        font-family: 'Courier New', monospace;
        border: 2px solid transparent;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 0 10px transparent;);
    `;
    document.body.appendChild(timerBox);

    let timeLeft = 5;

    // --- FONCTION DE CHARGEMENT ---
    async function fetchData() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_casino_data?username=${CURRENT_USER}`);
            const result = await response.json();

            if (result.status === "success") {
                window.casino_success = result.data.success || [];
                let serverMoney = Math.round(result.data.money);
                
                // On vérifie si on a déjà de l'argent en session
                let plinko = parseFloat(sessionStorage.getItem('plinko_money')) || 0;
                let hasSessionMoney = sessionStorage.getItem('plinko_money') !== null;

                if (hasSessionMoney) {
                    console.log("[TEST] Session existante, chargement local.");
                    updateCasinoMoney(); 
                } else {
                    console.log("[TEST] Pas de session, récupération serveur.");
                    window.casino_money = serverMoney;
                    distributeMoney(); // On distribue seulement ici
                }
                
                if (typeof refresh === "function") refresh();
            }
        } catch (err) {
            console.error("Erreur lors de la récupération :", err);
        }
    } // Fin fetchData

    // --- FONCTION DE SAUVEGARDE ---
    async function saveData() {
        try {
            // Avant de sauvegarder, on recalcule le total exact
            updateCasinoMoney();

            await fetch(`${API_BASE_URL}/update_casino_money`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: CURRENT_USER,
                    money: window.casino_money
                })
            });

            if (Array.isArray(window.casino_success) && window.casino_success.length > 0) {
                await fetch(`${API_BASE_URL}/update_casino_success`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: CURRENT_USER,
                        success: window.casino_success
                    })
                });
            }
            console.log("Sauvegarde auto : OK (" + window.casino_money + ")");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde :", err);
        }
    } // Fin saveData

    // Lancement
    fetchData();

    // Boucle du timer
    setInterval(() => {
        timerBox.innerText = `SYNC : ${timeLeft}s`;
        if (timeLeft <= 0) {
            saveData();
            timeLeft = 5;
        } else {
            timeLeft--;
        }
    }, 1000);
});