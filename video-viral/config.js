const api_domain = "https://api-video-viral-mocha.vercel.app/";

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getPoints() {
    const user_id = getCookieValue("user-id");

    const postData = {
        "user_id": user_id
    };

    try {
        // Realiza la solicitud POST a tu API
        const response = await fetch(`${api_domain}/api/get_points`, {
            method: 'POST',  // Método POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)  // Convierte el objeto postData a JSON
        });

        if (response.ok) {
            const data = await response.json(); // Espera a que se convierta la respuesta a JSON
            const userPoints = data.data.points; // Accede a los puntos del usuario
            const pointsText = document.querySelector('.points-text');
            pointsText.textContent = `Points: ${userPoints}`;
            console.log(`User Points: ${userPoints}`);
        } else {
            console.error("Error updating data");
        }
    } catch (error) {
        console.error("Error during the request", error);
    }
}