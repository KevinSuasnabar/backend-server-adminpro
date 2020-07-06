var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//============================
//BUSQUEDA POR COLECCION
//============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {


    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;

    var regex = new RegExp(busqueda, 'i'); //  la ' i ' hace que se busquen en mayus y minus


    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje:'Los tipos de busqueda solo son usuarios,medicos y hostipales',
                error:{message:'Tipo de tabla/coleccion no valido'}
            });
    }

    promesa.then(data=>{
        return res.status(200).json({
            ok: true,
            [tabla]:data
        });
    })
});

//============================
//BUSQUEDA GENERAL
//============================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    //es nesecaio crear una exp regular para no tomar el valor literal de la variable
    //busqueda
    var regex = new RegExp(busqueda, 'i'); //  la ' i ' hace que se busquen en mayus y minus


    Promise.all([buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });



});

//me devulve una promesa
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({
                nombre: regex
            }).populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales) // si no hay error enviames la data obtenida
                }
            });
    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({
                nombre: regex
            }).populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos) // si no hay error enviames la data obtenida
                }
            });
    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{
                'nombre': regex
            }, {
                'email': regex
            }]) //condiciones
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}

module.exports = app;