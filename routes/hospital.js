var express = require('express');

var mdAuthenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ===================================
// Obtener todos los hospitales
// ===================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0; // si no viene algun parametro le pongo 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });
});
// ===================================
// Crear hospitales
// ===================================
app.post('/', mdAuthenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img, //se puede borrar porque lo trabajaremos en otro lado
        usuario: req.usuario._id //id del usuario que ha iniciado sesion y crea el hospital
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al registrar hospital',
                errors: err
            });

        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario

        });
    });

});

// ===================================
// Modificar hospitales
// ===================================
app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, "nombre img usuario")
        .exec(
            (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        errors: err
                    });
                }

                if (!hospital) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'El hospital con el id:' + id + ' no existe',
                        errors: {
                            message: 'No existe un hospital con ese ID'
                        }
                    });
                }

                hospital.nombre = body.nombre;
                hospital.img = body.img;
                hospital.usuario = req.usuario._id; //id del usuario que lo modifica

                hospital.save((err, hospitalModificado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar hospital',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        hospital: hospitalModificado
                    });
                });
            });

});

// ===================================
// Eliminamos hospitales
// ===================================
app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: {
                    message: 'No existe este hospital con el id ' + id
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});




module.exports = app;