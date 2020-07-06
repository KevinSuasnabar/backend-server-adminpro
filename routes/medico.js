var express = require('express');

var mdAuthenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ===================================
// Obtener todos los Medicos
// ===================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0; // si no viene algun parametro le pongo 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});


// ===================================
// Crear Medicos
// ===================================
app.post('/', mdAuthenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al registrar medico',
                errors: err
            });

        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario

        });
    });

});


// ===================================
// Modificar medicos
// ===================================
app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, "nombre img usuario hospital")
        .exec(
            (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        errors: err
                    });
                }

                if (!medico) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'El medico con el id:' + id + ' no existe',
                        errors: {
                            message: 'No existe un medico con ese ID'
                        }
                    });
                }

                medico.nombre = body.nombre;
                medico.img = body.img;
                medico.usuario = req.usuario._id;
                medico.hospital = body.hospital;

                medico.save((err, medicoModificado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar medico',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        medico: medicoModificado
                    });
                });
            });

});

// ===================================
// Eliminamos medicos
// ===================================
app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: {
                    message: 'No existe este medico con el id ' + id
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;