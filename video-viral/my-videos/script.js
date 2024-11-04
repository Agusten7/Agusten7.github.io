const api_domain = 'https://api-video-viral-mocha.vercel.app'
// Función para cargar los videos desde localStorage y mostrarlos en la página

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

function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('my-videos')) || { videos: [] };
    const gallery = document.getElementById('gallery');

    const url = `${api_domain}/api/get_videos`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json(); // Convierte la respuesta a JSON
        })
        .then(data => {
            videos.videos.forEach(video => {
                const item = document.createElement('div');
                item.classList.add('item');
                
                const image_container = document.createElement('div')
                image_container.classList.add('image-container');
                // Crea el elemento de la imagen
                const img = document.createElement('img');
                img.src = video.thumbnail;
                img.alt = video.title;
                
                // Crea el título
                const title = document.createElement('p');
                title.classList.add('title-text')
                title.textContent = video.title;
        

                image_container.appendChild(img);
                item.appendChild(image_container)
                item.appendChild(title);

                const video_id = video.id;
                
                data.data.videos.forEach(video_api => {
                    if (video_api.id === video_id) {
                        const times_shown = video_api.shown;
                        const times_clicked = video_api.views;
                        
                        const information = document.createElement('p');
                        information.classList.add("information")
                        information.textContent = `Times shown: ${times_shown} Times clicked: ${times_clicked}`;
                        item.appendChild(information);    
                    } else {
                        console.log(`${video_id} != ${video_api.id}`);
                    }
                });
                // Añade el contenedor del video a la galería
                gallery.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });

}

// Cargar los videos al cargar la página
window.onload = loadVideos;


