//Requires
var express = require('express');
var mongoose = require('mongoose'); // para la conexion a la bd
var bodyParser = require('body-parser') //para peticiones x-www-form-urlencoded


//Inicializar variables
var app = express();



//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())




//Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err; //detiene el proceso

    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' Online')

});


//Rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);



//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000:\x1b[32m%s\x1b[0m', ' Online')
})