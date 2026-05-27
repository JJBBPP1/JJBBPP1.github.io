// 1. TIPOS DE SALIDAS
console.log("Salida por consola");
alert("Salida por alerta");
document.write("<p>Salida en la página web</p>");

// 2. VARIABLES
let nombre = "Juan";
let edad = 20;
const PI = 3.1416;

document.write("<p>Nombre: " + nombre + "</p>");
document.write("<p>Edad: " + edad + "</p>");
document.write("<p>Valor de PI: " + PI + "</p>");

function saludar(nombre) { document.write("<p>Hola " + nombre + "</p>"); }
saludar("Carlos");

function sumar(a, b) { return a + b; }
let resultado = sumar(5, 3);
document.write("<p>Resultado de la suma: " + resultado + "</p>");

(function() { document.write("<p>Función autoinvocada ejecutada</p>"); })();

let multiplicar = function(a, b) { return a * b; };
document.write("<p>Multiplicación: " + multiplicar(4, 2) + "</p>");

const dividir = (a, b) => a / b;
document.write("<p>División: " + dividir(10, 2) + "</p>");

function cuadrado(numero) { return numero * numero; }
let num = 6;
let resultadoCuadrado = cuadrado(num);
document.write("<p>El cuadrado de " + num + " es " + resultadoCuadrado + "</p>");
