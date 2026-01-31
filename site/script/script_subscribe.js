async function getSub(username) {
    try {
        const response = await fetch("https://TON_URL_RENDER/get_sub", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();

        if (data.status === "success") {
            window.subscribe = data.Abonnement; // null, basique, medium ou premium
        } else {
            window.subscribe = null;
        }
    } catch (error) {
        console.error("[GET_SUB ERROR]", error);
        window.subscribe = null;
    }
}
