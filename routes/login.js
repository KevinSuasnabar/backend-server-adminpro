var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; //la llave que valida mi token


var app = express();

var Usuario = require('../models/usuario'); //importamos el modelo de usuario
const {
    findOne
} = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({
        email: body.email //buscando usuario por email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //Creamos un token
        var token = jwt.sign({
            usuarioDB
        }, SEED, {
            expiresIn: 14400 //4horas
        });


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});


module.exports = app;