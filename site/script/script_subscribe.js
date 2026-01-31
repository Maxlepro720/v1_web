username = localStorage.getItem('username');

async function getSub(username) {
    try {
        const response = await fetch("https://project-3-api-2bgb.onrender.com/get_sub", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();

        if (data.status === "success") {
            console.log(data.Abonnement);
            window.subscribe = data.Abonnement; // null, basique, medium ou premium
        } else {
            window.subscribe = null;
        }
    } catch (error) {
        console.error("[GET_SUB ERROR]", error);
        window.subscribe = null;
    }
}
getSub(username)

setInterval(() => {   
        getSub(username)
    }, 10000);