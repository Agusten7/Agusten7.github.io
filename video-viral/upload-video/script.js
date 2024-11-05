const form = document.getElementById('uploadForm');
form.addEventListener('submit', async function(e) {
    e.preventDefault();  // Evitar que el formulario se envíe de la manera predeterminada (GET)
    document.getElementById('status').innerText = "Uploading your video...";
    
    const fileInput = document.getElementById('thumbnail').files[0];
    const title = document.getElementById('title').value;

    if (fileInput && title) {
        try {
            const user_id = getCookieValue("user-id");
            console.log("user_id: ", user_id);
        
            const reader = new FileReader();
            reader.readAsDataURL(fileInput);
            reader.onload = async function() {
                const thumbnailBase64 = reader.result;
                
                const data = {
                    user_id: user_id,
                    title: title,
                    thumbnail: thumbnailBase64  // Enviamos la imagen en formato base64
                };
                
                // Realiza la petición a la API con el método POST
                const response = await fetch(`${api_domain}/api/create_video`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)  // Convertimos el objeto data a JSON
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const image_url = result.data.image_url;
                    const videoTitle = result.data.title;
                    const videoId = result.data.id;
                    
                    window.location.href = `success.html?id=${encodeURIComponent(videoId)}&title=${encodeURIComponent(videoTitle)}&image_url=${encodeURIComponent(image_url)}`;
                } else {
                    const result = await response.json();
                    const message = result.message;
                    document.getElementById('status').innerText = message;
                }
            };
        } catch (error) {
            console.error("Error durante la solicitud", error);
        }
    } else {
        document.getElementById('status').innerText = "Please upload a Thumbnail and a Title Video";
    }
});

const fileInput = document.querySelector('.input-thumbnail');
const thumbnail = document.querySelector('.image-thumbnail');

// Escucha cambios en el input de archivo
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];  // Obtén el archivo subido
    if (file) {
        const reader = new FileReader();  // Crea un FileReader para leer el archivo
        
        // Función que se ejecuta cuando el archivo se ha leído correctamente
        reader.onload = function(e) {
            thumbnail.src = e.target.result;  // Actualiza el src de la imagen con la URL de la imagen cargada
        };
        
        reader.readAsDataURL(file);  // Lee el archivo como una URL de datos
    }
});

getPoints();