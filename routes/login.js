var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; //la llave que valida mi token

var app = express();
var Usuario = require('../models/usuario'); //importamos el modelo de usuario
const {
    findOne
} = require('../models/usuario');


//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==============================
// Autentificacion de Google
// ==============================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}

app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: true,
                mensaje: 'Token no valido.',
            });
        });

    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google == false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal',
                    errors: err
                });
            } else {
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
            }
        } else {
            //El usuario no existe y hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
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
            })

        }
    })

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Ok!!',
    //     googleUser: googleUser
    // });
});



// ==============================
// Autentificacion Normal
// ==============================
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