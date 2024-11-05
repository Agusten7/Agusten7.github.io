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

                const video_id = video.id;
                
                data.data.videos.forEach(video_api => {
                    if (video_api.id === video_id) {

                        const item = document.createElement('div');
                        item.classList.add('item');

                        const image_container = document.createElement('div')
                        image_container.classList.add('image-container');
                        // Crea el elemento de la imagen
                        const img = document.createElement('img');
                        img.src = video_api.image_url;
                        img.alt = video_api.title;

                        // Crea el título
                        const title = document.createElement('p');
                        title.classList.add('title-text')
                        title.textContent = video_api.title;


                        image_container.appendChild(img);
                        item.appendChild(image_container)
                        item.appendChild(title);

                        const times_shown = video_api.shown;
                        const times_clicked = video_api.views;
                        
                        const information = document.createElement('p');
                        information.classList.add("information")
                        information.textContent = `Times shown: ${times_shown} Times clicked: ${times_clicked}`;
                        item.appendChild(information);    

                        gallery.appendChild(item);
                    } else {
                        console.log(`${video_id} != ${video_api.id}`);
                    }
                    
                });
                // Añade el contenedor del video a la galería
                
            });
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });

}
getPoints();
// Cargar los videos al cargar la página
window.onload = loadVideos;


