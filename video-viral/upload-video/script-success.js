// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const title = params.get('title');
const thumbnail = params.get('thumbnail')
const id = params.get('id')
// Establecer el título del video y la imagen del thumbnail
document.getElementById('videoTitle').innerText = title;
document.getElementById('thumbnailImage').src = thumbnail;

const newVideo = {
    id: decodeURIComponent(id),
    title: decodeURIComponent(title), // Decodifica para espacios y caracteres especiales
    thumbnail: decodeURIComponent(thumbnail) // Decodifica la URL del thumbnail
};

// 3. Obtener el array actual de videos desde el localStorage
let videos = JSON.parse(localStorage.getItem('my-videos')) || { videos: [] };

// 4. Agregar el nuevo video al array de videos
videos.videos.push(newVideo);

// 5. Guardar el array actualizado en el localStorage
localStorage.setItem('my-videos', JSON.stringify(videos));

console.log('Video guardado exitosamente en localStorage', videos);