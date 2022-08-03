window.onload = function () {

    google.accounts.id.initialize({
        client_id: "878948407763-ugmqhn0cfqqpdhkhn7kej3dtjjmqv5t6.apps.googleusercontent.com", // process.env.GOOGLE_CLIENT_ID
        callback: onSignIn
    });
    google.accounts.id.renderButton(
        document.getElementById("loginButtonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
}

//TODO: modificar else
var url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'http://localhost:8080/api/auth/'; //cambiar al subir a heroku (y registrar url en api de google)


function onSignIn(googleUser) {
    const id_token = googleUser.credential;
    const data = { id_token };
    fetch(url + "google", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(resp => resp.json())
        .then(data => {
            localStorage.setItem('token', data.token);
            window.location = 'chat.html';
        })
        .catch(console.log);

}

const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', ev => {

    ev.preventDefault(); //evitar hacer un refresh del navegador al hacer submit

    const formData = {};

    for (let element of loginForm.elements) {
        if (element.name.length > 0) {
            formData[element.name] = element.value;
        }
    }

    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type:': 'application/json' }
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.msg) {
                return console.error(msg);
            }
            localStorage.setItem('token', data.token);
            window.location = 'chat.html';
        })
        .catch(err => {
            console.log(err)
        })

})
