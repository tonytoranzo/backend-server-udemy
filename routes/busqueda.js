var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ========================================================================================
// Busqueda por colección
// ========================================================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

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
                mensaje: 'Los tipos de búsqueda solo son: usuarios, medicos, hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});

// ========================================================================================
// Busqueda General
// ========================================================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise
        .all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital
            .find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {

                if (error) {
                    reject('Error al cargar hospitales', error);
                } else {
                    resolve(hospitales);
                }

            })
    })
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico
            .find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((error, medicos) => {

                if (error) {
                    reject('Error al cargar médicos', error);
                } else {
                    resolve(medicos);
                }

            })
    })
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario
            .find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((error, usuarios) => {

                if (error) {
                    reject('Error al cargar usuarios', error);
                } else {
                    resolve(usuarios);
                }

            })
    })
}

module.exports = app;