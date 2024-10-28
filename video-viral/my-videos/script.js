// Función para cargar los videos desde localStorage y mostrarlos en la página
function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('my-videos')) || { videos: [] };
    const gallery = document.getElementById('gallery');

    const url = 'http://127.0.0.1:5000/api/get-videos';

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
                
                data.videos.forEach(video_api => {
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


