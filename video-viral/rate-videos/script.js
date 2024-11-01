const api_domain = 'https://api-video-viral-mocha.vercel.app';
// Función para obtener 4 elementos aleatorios de un arreglo
function getRandomVideos(videos, count) {
    const shuffled = videos.sort(() => 0.5 - Math.random()); // Mezcla los videos
    return shuffled.slice(0, count); // Devuelve los primeros 'count' videos
}

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setTimer(){
    const counterElement = document.querySelector('.counter-text');

    let timeLeft = 5;  // 5 segundos de espera
        // Función que actualiza el contador cada segundo
    const countdown = setInterval(() => {
        counterElement.textContent = `${timeLeft}`;

        timeLeft--;
        // Si el tiempo llega a 0, habilita el botón para votar
        if (timeLeft < 0) {
            clearInterval(countdown);  // Detenemos el contador
            counterElement.textContent = "👇";
            // Selecciona todos los elementos con la clase "gallery"
            // Selecciona todos los elementos con la clase "gallery"
            const galleries = document.querySelectorAll('.gallery');
                    
            // Itera sobre cada elemento con la clase "gallery"
            galleries.forEach(gallery => {
                // Selecciona todos los hijos dentro de cada "gallery"
                const children = gallery.children;
                
                // Itera sobre cada hijo y cambia el cursor a "pointer"
                for (let child of children) {
                    child.style.cursor = 'pointer';
                }
            });


            updateData();
        }
    }, 1000);
}

// Función para cargar los datos del API
async function loadVideos() {
    try {
        // Realiza una solicitud GET al API para obtener los datos
        const response = await fetch(`${api_domain}/api/get_videos`); // Cambia la URL según tu API
        const data = await response.json();
        
        // Selecciona 4 videos aleatorios del JSON
        const randomVideos = getRandomVideos(data.data.videos, 4);

        // Selecciona el contenedor de la galería
        const gallery = document.querySelector('.gallery');
        
        // Itera sobre los videos aleatorios y crea elementos HTML para cada uno
        randomVideos.forEach(async video => {
            // Crea un contenedor para cada video
            const item = document.createElement('div');
            item.classList.add('item');
            item.classList.add(video.id);
            
            const image_container = document.createElement('div');
            image_container.classList.add('image-container');
            
            // Crea el elemento de la imagen
            const img = document.createElement('img');
            img.src = video.thumbnail;
            img.alt = video.title;
            
            // Crea el título
            const title = document.createElement('p');
            title.classList.add('title-text')
            title.textContent = video.title;
            
            // Añade la imagen y el título al contenedor
            image_container.appendChild(img);
            item.appendChild(image_container);
            item.appendChild(title);
            
            // Añade el contenedor del video a la galería
            gallery.appendChild(item);
        });
        setTimer();
    } catch (error) {
        const counterElement = document.querySelector('.counter-container');
        counterElement.style.width = '500px';
        const counterText = document.querySelector('.counter-text');
        counterText.textContent = 'Error loading videos. Try Again Later';
    }
    
}

async function updateData() {
    try {
            const gallery = document.querySelector('.gallery');
            const directChildren = gallery.querySelectorAll(':scope > div');

            const shown_video_ids = [];

            directChildren.forEach(div => {
                shown_video_ids.push(div.classList[1]);  // Añade la segunda clase

                div.addEventListener('click', async () => {
                    // Obtén la segunda clase del div (suponiendo que es la ID que quieres enviar)
                    const videoId = div.classList[1];  // O ajusta si la ID está en otro lugar
                    
                    // Crea el objeto que quieres enviar a la API
                    const postData = {
                        "video_id": videoId
                    };
                    
                    try {
                        // Realiza la solicitud POST a tu API
                        const response = await fetch(`${api_domain}/api/update_views`, {
                            method: 'POST',  // Método POST
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(postData)  // Convierte el objeto postData a JSON
                        });
            
                        if (response.ok) {
                            console.log("View added to Video ID:", videoId);
                        } else {
                            console.error("Error updating data");
                        }
                    } catch (error) {
                        console.error("Error during the request", error);
                    }

                    try {

                        const user_id = getCookieValue("user-id");
                        console.log("user_id: ", user_id);

                        const postData = {"user_id":user_id}
                        // Realiza la solicitud POST a tu API
                        const response = await fetch(`${api_domain}/api/update_users`, {
                            method: 'POST',  // Método POST
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(postData)  // Convierte el objeto postData a JSON
                        });
            
                        if (response.ok) {
                            console.log(`User ${user_id} view the video with ID ${videoId}`);
                            location.reload(true);
                        } else {
                            console.error("Error updating data");
                        }
                    } catch (error) {
                        console.error("Error during the request", error);
                    }

                });
            });

            const postData = {
                "shown_video_ids": shown_video_ids,  // Aquí envías el ID del video
            };

            // Asegúrate de esperar la respuesta del servidor
            const updateResponse = await fetch(`${api_domain}/api/update_videos_data`, {
                method: 'POST',  // Aquí aseguramos que se use POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)  // Convertimos el objeto data a JSON
            });

            // Verificar si la solicitud fue exitosa
            if (updateResponse.ok) {
                console.log("Videos data updated successfully");
            } else {
                console.error("Error updating Videos data");
            }
    } catch (error) {
            console.error('Error updating data', error);
    }
    

}

// Llama a la función para cargar los videos cuando la página se carga
loadVideos();

