document.addEventListener("DOMContentLoaded", () => {

    // --- CONFIGURATION ---
    const API_BASE_URL = "https://project-3-api-2bgb.onrender.com";
    const CURRENT_USER = localStorage.getItem('username');

    // Initialisation des variables globales
    window.game_money = 0;
    window.game_success = {};

    // --- INTERFACE (Minuteur) ---
    const timerBox = document.createElement('div');
    timerBox.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        padding: 10px 20px;
        background: rgba(0, 0, 0, 0.85);
        color: #00FF00;
        font-family: 'Courier New', monospace;
        border: 2px solid #333;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(timerBox);

    let timeLeft = 15;

    // --- FONCTIONS DE COMMUNICATION ---

    async function fetchData() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_casino_data?username=${CURRENT_USER}`);
            const result = await response.json();

            if (result.status === "success") {
                window.casino_money = result.data.money;
                window.casino_success = result.data.success;
                console.log("Données récupérées :", result.data);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération :", err);
        }
    }

    async function saveData() {
        try {
            await fetch(`${API_BASE_URL}/update_casino_money`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: CURRENT_USER,
                    money: window.casino_money
                })
            });

            await fetch(`${API_BASE_URL}/update_casino_success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: CURRENT_USER,
                    success: window.casino_success
                })
            });

            console.log("Sauvegarde automatique effectuée.");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde :", err);
        }
    }

    fetchData();

    setInterval(() => {
        timerBox.innerText = `SYNC : ${timeLeft}s`;

        if (timeLeft <= 0) {
            saveData();
            timeLeft = 15;
        } else {
            timeLeft--;
        }
    }, 1000);

});
