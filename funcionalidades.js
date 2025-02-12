// Definir elementos globalmente
let ciudad = document.getElementById("ciudad");
let boton = document.getElementById("boton");
let imagen = document.getElementById("imagen");
let reloj = document.getElementById("hora");
let mensaje = document.getElementById("mensaje")

//habilitar boton
ciudad.addEventListener("input", function () {
    if (ciudad.value.trim() !== '') {
        boton.disabled = false
    } else {
        boton.disabled = true
    }
}
)

//Funcionalidad del reloj
function iniciarReloj() {
    setInterval(tiempoActual, 1000)
}
function tiempoActual() {
    let fechaTiempo = new Date()
    let hora = String(fechaTiempo.getHours()).padStart(2, "0")
    let minutos = String(fechaTiempo.getMinutes()).padStart(2, "0")
    let segundos = String(fechaTiempo.getSeconds()).padStart(2, "0")
    let horaActual = `${hora}:${minutos}:${segundos}`
    reloj.textContent = horaActual
}

//Obtencion de coordenadas por ciudad
async function coordenadas() {
    try {
        mensaje.textContent = "Espere un momento mientras se carga la imagen"
        let ciudadIngresada = ciudad.value.toLowerCase().trim()
        let obtenerCoordenadas = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${ciudadIngresada}&key=abb59af4f1964405b4b414317277ffc0`)
        if (!obtenerCoordenadas.ok) {
            throw new Error('Error en la consulta a la API de coordenadas ');
        }

        let respuestaCoordenadas = await obtenerCoordenadas.json()
        if (respuestaCoordenadas.results.length === 0) {
            throw new Error('Ciudad no encontrada ');
        }
        let resultadoValido = respuestaCoordenadas.results.find(lugar =>
            ["city", "town", "village"].includes(lugar.components._type)
        );

        if (!resultadoValido) {
            throw new Error("Debe ingresar una ciudad válida. No se aceptan países o regiones.");
        }

        let latitud = respuestaCoordenadas.results[0].geometry.lat
        let longitud = respuestaCoordenadas.results[0].geometry.lng
        imagenesSatelitales(latitud, longitud, ciudadIngresada)
    } catch (error) {
        mensaje.textContent = ""
        alert(`${error}: asegurese de que la ciudad ingresada exista`)
    }
}

//Obtencion de imagen por coordenadas
async function imagenesSatelitales(latitud, longitud, ciudadIngresada) {
    try {
        let fecha = new Date()
        let year = fecha.getFullYear()
        let mes = String(fecha.getMonth() + 1).padStart(2, "0")
        let dia = fecha.getDate()
        if (dia == 1) {
            fecha.setDate(0)
            dia = fecha.getDate()

        } else {
            dia = dia - 1
        }
        let obtenerImagenes = await fetch(`https://api.nasa.gov/planetary/earth/imagery?lon=${longitud}&lat=${latitud}&date=${year}-${mes}-${String(dia).padStart(2, "0")}&dim=0.1&api_key=ABXXwOTL97mGMdgJWYdz3EPw0eGitc1iNCXre20g`)
        if (!obtenerImagenes.ok) {
            throw new Error('Error en la obtencion de la imagen');
        }
        imagen.src = obtenerImagenes.url
        imagen.alt = `Imagen de ${ciudadIngresada}`
        mensaje.textContent = ""
    } catch (error) {
        mensaje.textContent = ""
        alert(`Hay problemas al obtener la imagen de ${ciudadIngresada}`)
    }
}

