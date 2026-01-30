(() => {
    const SERVER_URL = "https://project-3-api-2bgb.onrender.com"; // <-- change avec ton endpoint Flask
    const USERNAME = localStorage.getItem('username'); // <-- change dynamiquement si besoin

    let hudVisible = false;
    let startTime = Date.now();
    let elapsedTime = 0; // en secondes
    let fdPiece = 0;
    let intervalID;

    // Création HUD
    const hud = document.createElement("div");
    hud.style.position = "fixed";
    hud.style.top = "50px";
    hud.style.left = "50px";
    hud.style.width = "200px";
    hud.style.padding = "10px";
    hud.style.background = "rgba(255,255,255,0.1)";
    hud.style.backdropFilter = "blur(10px)";
    hud.style.border = "1px solid rgba(255,255,255,0.3)";
    hud.style.borderRadius = "10px";
    hud.style.color = "#fff";
    hud.style.fontFamily = "sans-serif";
    hud.style.zIndex = "99999";
    hud.style.cursor = "move";
    hud.style.display = "none";

    hud.innerHTML = `
        <div style="text-align:right; cursor:pointer;" id="hudClose">✖</div>
        <div>Temps joué: <span id="hudTime">0s</span></div>
        <div>Argent: <span id="hudFD">0</span></div>
    `;

    document.body.appendChild(hud);

    const hudTime = hud.querySelector("#hudTime");
    const hudFD = hud.querySelector("#hudFD");
    const closeBtn = hud.querySelector("#hudClose");

    closeBtn.addEventListener("click", () => toggleHUD());

    // Déplacement HUD
    let isDragging = false, offsetX = 0, offsetY = 0;
    hud.addEventListener("mousedown", e => {
        if(e.target === closeBtn) return;
        isDragging = true;
        offsetX = e.clientX - hud.getBoundingClientRect().left;
        offsetY = e.clientY - hud.getBoundingClientRect().top;
    });
    document.addEventListener("mouseup", () => isDragging = false);
    document.addEventListener("mousemove", e => {
        if(isDragging){
            hud.style.left = (e.clientX - offsetX) + "px";
            hud.style.top = (e.clientY - offsetY) + "px";
        }
    });

    // Toggle HUD avec Alt + T
    document.addEventListener("keydown", e => {
        if(e.altKey && e.key.toLowerCase() === "t") toggleHUD();
    });

    function toggleHUD() {
        hudVisible = !hudVisible;
        hud.style.display = hudVisible ? "block" : "none";
    }

    // Récupération initiale depuis le serveur
    async function fetchData() {
        try {
            const res = await fetch(`${SERVER_URL}/get_time_FDPrice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: USERNAME })
            });
            const data = await res.json();
            elapsedTime = data.Time || 0;
            fdPiece = data.FDPiece || 0;
            updateHUD();
        } catch (e) {
            console.error("Erreur récupération FDPiece:", e);
        }
    }

    function updateHUD() {
        hudTime.textContent = formatTime(elapsedTime);
        hudFD.textContent = fdPiece;
    }

    function formatTime(sec){
        const h = Math.floor(sec/3600);
        const m = Math.floor((sec%3600)/60);
        const s = sec % 60;
        return `${h}h ${m}m ${s}s`;
    }

    // Envoi au serveur toutes les 30s
    async function sendData() {
        try {
            elapsedTime += 30; // incrément temps écoulé
            updateHUD();
            await fetch(`${SERVER_URL}/send_time`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: USERNAME, Time: elapsedTime })
            });
            await fetch(`${SERVER_URL}/send_FDPrice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: USERNAME, FDPiece: fdPiece })
            });
        } catch(e){
            console.error("Erreur envoi FDPiece:", e);
        }
    }

    // Lancement
    fetchData();
    intervalID = setInterval(sendData, 30000);

})();

