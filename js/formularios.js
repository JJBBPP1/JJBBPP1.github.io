// Mostrar/ocultar contraseña
document.getElementById('mostrarPassword')?.addEventListener('change', function() {
    const passwordInput = document.getElementById('password');
    if (this.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

document.getElementById('formulario')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const nombre = form.nombre.value.trim() || 'No especificado';
    const email = form.email.value.trim() || 'No especificado';
    const mensaje = form.mensaje.value.trim() || 'No especificado';
    const password = form.password.value ? '*****' : 'No especificado';
    const telefono = form.telefono.value.trim() || 'No especificado';
    const edad = form.edad.value || 'No especificado';
    const fechaNacimiento = form.fecha_nacimiento.value || 'No especificado';
    const fechaHora = form.fecha_hora.value || 'No especificado';
    const direccion = form.direccion.value.trim() || 'No especificado';
    const ciudad = form.ciudad.value.trim() || 'No especificado';
    const pais = form.pais.value || 'No especificado';
    const number = form.number.value || 'No especificado';
    const genero = form.querySelector('input[name="genero"]:checked')?.value || 'No especificado';
    const terminos = form.terminos.checked ? 'Sí' : 'No';

    const mensajeAlerta =
        `Datos del formulario:\n` +
        `Nombre: ${nombre}\n` +
        `Correo Electrónico: ${email}\n` +
        `Mensaje: ${mensaje}\n` +
        `Contraseña: ${password}\n` +
        `Teléfono: ${telefono}\n` +
        `Edad: ${edad}\n` +
        `Fecha de Nacimiento: ${fechaNacimiento}\n` +
        `Fecha y Hora: ${fechaHora}\n` +
        `Dirección: ${direccion}\n` +
        `Ciudad: ${ciudad}\n` +
        `País: ${pais}\n` +
        `Número: ${number}\n` +
        `Género: ${genero}\n` +
        `Acepta términos: ${terminos}`;

    alert(mensajeAlerta);
});
