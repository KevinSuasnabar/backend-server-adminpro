var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuthenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario'); //importamos el modelo de usuario

// ===================================
// Obtener todos los usuarios
// ===================================
app.get('/', (req, res, next) => {

    //find(querys,campos que quiero).exec(manejo de resultados o errores)
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) { //si hay error
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            });

});

// ===================================
// Crear un nuevo usuario
// ===================================
app.post('/', mdAuthenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) { //si hay error
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario

        });

    });


});


// ===================================
// Update  usuario
// ===================================
app.put('/:id',mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    /////////////////////error,usuario encontrado por id
    Usuario.findById(id, 'nombre email img role')
        .exec(
            (err, usuario) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }

                if (!usuario) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'El usuario con el id:' + id + ' no existe',
                        errors: {
                            message: 'No existe un usuario con ese ID'
                        }
                    });
                }

                //actualizamos
                usuario.nombre = body.nombre;
                usuario.email = body.email;
                usuario.role = body.role;

                usuario.save((err, usuarioGuardado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioGuardado
                    });
                });
            });

});

// ===================================
// Eliminar  usuario por id
// ===================================
app.delete('/:id',mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: {
                    message: 'No existe este usuario con el id ' + id
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;