const api_domain = "https://api-test-mocha.vercel.app";
// Función para generar un UUID v4 (string aleatorio)
function generarUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// Función para establecer una cookie
function setCookie(nombre, valor, dias) {
    let d = new Date();
    d.setTime(d.getTime() + (dias*24*60*60*1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = nombre + "=" + valor + ";" + expires + ";path=/";
}
// Comprobar si la cookie ya existe
function getCookie(nombre) {
    let name = nombre + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function createUser(userId) {
    try {

        const postData = {"user_id":userId}
        // Realiza la solicitud POST a tu API
        const response = fetch(`${api_domain}/api/create_user`, {
            method: 'POST',  // Método POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)  // Convierte el objeto postData a JSON
        });

        if (response.ok) {
            console.log(`User ${user_id} was created`);
        } else {
            console.error("Error updating Users data");
        }
    } catch (error) {
        console.error("Error during the 'Create User' request", error);
    }
}

// Crear cookie si no existe
if (!getCookie("user-id")) {
    let userId = generarUUIDv4();
    setCookie("user-id", userId, 365);  // La cookie expira en 1 año
    createUser(userId);
    console.log("Se ha creado la cookie 'user-id' con el valor: " + userId);
} else {
    console.log("Ya existe la cookie 'user-id': " + getCookie("user-id"));
}
