function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

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
        
            const postData = { "user_id": user_id };
        
            // Realiza la solicitud POST a tu API
            const response = await fetch('http://127.0.0.1:5000/api/check-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });
        
            if (response.ok) {
                const responseData = await response.json();  // Analiza la respuesta como JSON
                if (responseData.sufficient_points === "true") {
                    const reader = new FileReader();
                    reader.readAsDataURL(fileInput);
                    reader.onload = async function() {
                        const thumbnailBase64 = reader.result;
                    
                        const data = {
                            user_id : user_id,
                            title: title,
                            thumbnail: thumbnailBase64  // Enviamos la imagen en formato base64
                        };
                    
                        // Realiza la petición a la API con el método POST
                        const response = await fetch('http://127.0.0.1:5000/api/post-video', {
                            method: 'POST',  // Aquí aseguramos que se use POST
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)  // Convertimos el objeto data a JSON
                        });
                    
                        if (response.ok) {
                            const result = await response.json();
                            const thumbnailUrl = result.response.data.thumbnail;
                            const videoTitle = result.response.data.title;
                            const videoId = result.response.data.id;
                        
                            window.location.href = `success.html?id=${encodeURIComponent(videoId)}&title=${encodeURIComponent(videoTitle)}&thumbnail=${encodeURIComponent(thumbnailUrl)}`;
                        } else {
                            document.getElementById('status').innerText = "Error uploading video";
                        }
                    };

                } else {
                    document.getElementById('status').innerText = "You don't have sufficient Points. Win 5 Points rating other videos.";
                }
            } else {
                console.error("Error al actualizar los datos");
            }
        } catch (error) {
            console.error("Error durante la solicitud", error);
        }
    
        
    } else {
        document.getElementById('status').innerText = "Please upload a Thumbnail and a Title Video";
    }
});

const fileInput = document.querySelector('.input-thumbnail');
const thumbnail = document.querySelector('.image-thumbnail')
// Escucha cambios en el input de archivo
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];  // Obtén el archivo subido
    if (file) {
        const reader = new FileReader();  // Crea un FileReader para leer el archivo
        
        // Función que se ejecuta cuando el archivo se ha leído correctamente
        reader.onload = function(e) {
            thumbnail.src = e.target.result;  // Actualiza el src de la imagen con la URL de la imagen cargada
            thumbnail.style
        };
        
        reader.readAsDataURL(file);  // Lee el archivo como una URL de datos
    }
});
