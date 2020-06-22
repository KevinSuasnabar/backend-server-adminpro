var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; //la llave que valida mi token

// ===================================
// Verificar Token (MIDDLEWARE)
// ===================================
exports.verificaToken = function (req, res, next) {

    var token = req.query.token; //obtenido por la url aunque puede ser por el body mejor

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido!',
                errors: err
            });
        }

        req.usuario = decoded.usuarioDB; //extraemos la informacion del usuario y lo ponemos en el req

        next(); //para continuar con las funciones de abajo una vez validado el token

    });
}