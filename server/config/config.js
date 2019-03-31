//============================
// Puerto
//============================
process.env.PORT = process.env.PORT || 3000;

//============================
// Entorno
//============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//============================
// Vencimiento del token
//============================
//60 segundos
//60 minutos
//24 horas
//30 dias = vencimiento en un mes
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//============================
// Semilla de autenticación SEED
//============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//============================
// Base de datos
//============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;

//============================
// google clien id
//============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '345510888141-tq77dm9ohquttv5mbv4tuf13qplv5e9t.apps.googleusercontent.com';