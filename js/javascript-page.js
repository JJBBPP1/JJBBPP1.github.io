// ============================================================
// EVENTOS DEL DOM - javascript.html
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Botón Java - Cambiar saludo
  const btnJava = document.getElementById('btnJava');
  if (btnJava) {
    btnJava.addEventListener('click', () => {
      document.getElementById('saludo').innerHTML = '¡Hola, JavaScript!';
    });
  }

  // Botones de emociones
  const btnSonrie = document.getElementById('btnSonrie');
  const btnTriste = document.getElementById('btnTriste');
  const btnNeutral = document.getElementById('btnNeutral');
  const neutral = document.getElementById('neutral');
  const sonrie = document.getElementById('sonrie');
  const triste = document.getElementById('triste');

  if (btnSonrie) {
    btnSonrie.addEventListener('click', () => {
      neutral.hidden = true;
      sonrie.hidden = false;
      triste.hidden = true;
    });
  }

  if (btnTriste) {
    btnTriste.addEventListener('click', () => {
      neutral.hidden = true;
      sonrie.hidden = true;
      triste.hidden = false;
    });
  }

  if (btnNeutral) {
    btnNeutral.addEventListener('click', () => {
      neutral.hidden = false;
      sonrie.hidden = true;
      triste.hidden = true;
    });
  }

  // Botones de tema
  const btnTemaOscuro = document.getElementById('btnTemaOscuro');
  const btnTemaClaro = document.getElementById('btnTemaClaro');

  if (btnTemaOscuro) {
    btnTemaOscuro.addEventListener('click', () => {
      document.body.style.backgroundColor = 'rgb(57, 57, 57)';
      document.body.style.color = 'white';
    });
  }

  if (btnTemaClaro) {
    btnTemaClaro.addEventListener('click', () => {
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
    });
  }

  // Botón toggle árbol
  const btnToggleArbol = document.getElementById('btnToggleArbol');
  const arbol = document.getElementById('arbol');

  if (btnToggleArbol && arbol) {
    btnToggleArbol.addEventListener('click', () => {
      arbol.hidden = !arbol.hidden;
      btnToggleArbol.innerHTML = arbol.hidden ? 'Mostrar árbol' : 'Quitar árbol';
    });
  }

  // Botones árbol2 - show/hide
  const btnQuitarArbol2 = document.getElementById('btnQuitarArbol2');
  const btnMostrarArbol2 = document.getElementById('btnMostrarArbol2');
  const arbol2 = document.getElementById('arbol2');

  if (btnQuitarArbol2 && arbol2) {
    btnQuitarArbol2.addEventListener('click', () => {
      arbol2.style.display = 'none';
    });
  }

  if (btnMostrarArbol2 && arbol2) {
    btnMostrarArbol2.addEventListener('click', () => {
      arbol2.style.display = 'block';
    });
  }

  // Botón cambiar primer párrafo
  const btnCambiarPrimerParrafo = document.getElementById('btnCambiarPrimerParrafo');

  if (btnCambiarPrimerParrafo) {
    btnCambiarPrimerParrafo.addEventListener('click', () => {
      const parrafo0 = document.getElementsByTagName('p')[0];
      parrafo0.style.color = 'green';
      parrafo0.style.fontSize = '20px';
      parrafo0.style.fontWeight = 'bold';
      parrafo0.style.fontStyle = 'italic';

      document.getElementsByTagName('p')[1].classList.add('clase-coleccion');
    });
  }

  // Botones de números
  const btnMayor = document.getElementById('btnMayor');
  const btnMayorMenor = document.getElementById('btnMayorMenor');
  const btnMenorMayor = document.getElementById('btnMenorMayor');
  const btnMenor = document.getElementById('btnMenor');

  if (btnMayor) {
    btnMayor.addEventListener('click', mostrarMayor);
  }

  if (btnMayorMenor) {
    btnMayorMenor.addEventListener('click', ordenarDesc);
  }

  if (btnMenorMayor) {
    btnMenorMayor.addEventListener('click', ordenarAsc);
  }

  if (btnMenor) {
    btnMenor.addEventListener('click', mostrarMenor);
  }
});

// ============================================================
// FUNCIONES DE UTILIDAD - Números
// ============================================================

function cambiarEstilosGlobales() {
  const parrafos = document.querySelectorAll('p');
  parrafos.forEach(parrafo => {
    parrafo.style.color = 'blue';
    parrafo.style.fontSize = '15px';
    parrafo.style.fontWeight = 'bold';
    parrafo.style.fontStyle = 'italic';
  });
}

function mostrarMayor() {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  const num3 = parseFloat(document.getElementById('num3').value);

  if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
    document.getElementById('resultado').innerHTML = 'Por favor, introduce 3 números válidos.';
    return;
  }

  const mayor = Math.max(num1, num2, num3);
  const mayorDisplay = Number.isInteger(mayor) ? mayor : mayor.toFixed(2);
  document.getElementById('resultado').innerHTML = `El mayor es ${mayorDisplay}.`;
}

function ordenarDesc() {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  const num3 = parseFloat(document.getElementById('num3').value);

  if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
    document.getElementById('resultado').innerHTML = 'Por favor, introduce 3 números válidos.';
    return;
  }

  const numeros = [num1, num2, num3].sort((a, b) => b - a);
  const ordenados = numeros.map(n => Number.isInteger(n) ? n : n.toFixed(2)).join(', ');
  document.getElementById('resultado').innerHTML = `Ordenados (mayor a menor): ${ordenados}`;
}

function ordenarAsc() {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  const num3 = parseFloat(document.getElementById('num3').value);

  if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
    document.getElementById('resultado').innerHTML = 'Por favor, introduce 3 números válidos.';
    return;
  }

  const numeros = [num1, num2, num3].sort((a, b) => a - b);
  const ordenados = numeros.map(n => Number.isInteger(n) ? n : n.toFixed(2)).join(', ');
  document.getElementById('resultado').innerHTML = `Ordenados (menor a mayor): ${ordenados}`;
}

function mostrarMenor() {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  const num3 = parseFloat(document.getElementById('num3').value);

  if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
    document.getElementById('resultado').innerHTML = 'Por favor, introduce 3 números válidos.';
    return;
  }

  const menor = Math.min(num1, num2, num3);
  const menorDisplay = Number.isInteger(menor) ? menor : menor.toFixed(2);
  document.getElementById('resultado').innerHTML = `El menor es ${menorDisplay}.`;
}

