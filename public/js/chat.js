const btnSalir = document.querySelector('#btnSalir');
const txtUid = document.querySelector('#txtUid');
const txtMsg = document.querySelector('#txtMsg');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');


let usuario = null;
let socket = null;
//TODO: modificar else
var url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'http://localhost:8080/api/auth/'; //cambiar al subir a heroku (y registrar url en api de google)


const main = async () => {
    await validarJWT();
}

const validarJWT = async () => {
    //TODO: Try/Catch para redirigir al index si algo sale mal

    const token = localStorage.getItem('token') || '';
    if (token.length <= 10) {
        window.location = 'index.html'
        throw new Error('No hay token en el servidor');
    }
    const resp = await fetch(url, {
        headers: { 'x-token': token }
    });
    const { usuario: userDb, token: tokenDb } = await resp.json();
    //renueva el token:
    localStorage.setItem('token', tokenDb);
    usuario = userDb;
    await conectarSocket();

}

const conectarSocket = async () => {
    //enviamos el token validado a través del socket:
    socket = io({
        'extraHeaders': {
            'token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('online');
    })
    socket.on('disconnect', () => {
        console.log('offline')
    })
    socket.on('recibir-mensajes', dibujarMensajes);

    // socket.on('usuarios-activos',(payload)=>{
    //     dibujarUsuarios(payload)
    // })

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado', (payload) => {

    })
}

const dibujarUsuarios = (usuarios = []) => {
    let usersHtml = '';
    usuarios.forEach(user => {
        usersHtml += `
        <li>
        <p>
        <h5 class="text-success">${user.nombre}</h5>
        <span class="fs-6 text-muted">${user.uid}</span>
        <p/>
         </li>
        `
    });
    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = (mensajes = []) => {
    let mesajesHtml = '';
    mensajes.forEach(({ nombre, mensaje }) => {
        mesajesHtml += `
        <li>
        <p>
        <span class="text-primary">${nombre}:</span>
        <span class="">${mensaje}</span>
        <p/>
         </li>
        `
    });
    ulMensajes.innerHTML = mesajesHtml;
}

txtMsg.addEventListener('keyup', (ev) => {
    if (ev.key === 'Enter') {
        const msg = txtMsg.value;
        const uid = txtUid.value;
        if (msg.length > 0) {
            socket.emit('enviar-mensaje', { uid, msg });
            txtMsg.value = '';
        }
    }
})

main();
