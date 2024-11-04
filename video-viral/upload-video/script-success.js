const api_domain = "https://api-video-viral-mocha.vercel.app";

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

// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const title = params.get('title');
const image_url = params.get('image_url');

// Establecer el título del video y la imagen del thumbnail
document.getElementById('videoTitle').innerText = title;
document.getElementById('thumbnailImage').src = image_url;

const newVideo = {
    id: decodeURIComponent(id),
    title: decodeURIComponent(title), // Decodifica para espacios y caracteres especiales
    image_url: decodeURIComponent(image_url) // Decodifica la URL del thumbnail
};

// Obtener el array actual de videos desde el localStorage
let videos = JSON.parse(localStorage.getItem('my-videos')) || { videos: [] };

// Verificar si el video ya existe en el array
const videoExists = videos.videos.some(video => video.id === newVideo.id);

if (!videoExists) {
    // Si el video no existe, agregarlo al array
    videos.videos.push(newVideo);

    // Guardar el array actualizado en el localStorage
    localStorage.setItem('my-videos', JSON.stringify(videos));

    console.log('Video guardado exitosamente en localStorage', videos);
} else {
    console.log('El video ya existe en localStorage y no fue agregado.');
}


getPoints();