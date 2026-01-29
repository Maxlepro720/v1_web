const API_URL_2 = "https://project-3-api-2bgb.onrender.com";
const PLAYER_ID = localStorage.getItem("username"); // ou remplace par ton système
console.log("start_ban_verification")

if (!PLAYER_ID) {
    console.error("Aucun player_id trouvé");
} else {
    async function checkBan() {
        try {
            const response = await fetch(`${API_URL_2}/get_ban?id=${PLAYER_ID}`);
            const data = await response.json();
            console.log(data)
            if (data.status === "success" && data.is_banned === true) {

                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        inset: 0;
                        background: black;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 120px;
                        font-weight: 900;
                        font-family: Arial Black, Impact, sans-serif;
                        color: white;
                        letter-spacing: 8px;
                    ">
                        BANNIS
                    </div>
                `;
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du ban :", error);
        }
    }

    // Vérification immédiate au chargement
    checkBan();

    // Vérification toutes les 30 secondes
    setInterval(checkBan, 30000);
}
