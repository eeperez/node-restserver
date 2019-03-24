const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore'); //guion bajo por estandar para usar underscore
const Usuario = require('../models/usuario');
const app = express();

app.get('/usuario', function(req, res) {
    let desde = req.query.desde || 0;
    let iDesde = isNaN(desde) ? 0 : Number(desde);

    let limite = req.query.limite || 5;
    let iLimite = isNaN(limite) ? 5 : Number(limite);
    //Solo debe traer los activos
    let condicion = {
        estado: true
    };

    //Primera parametro condicion de busqueda {google: true}, segundo son los campos del select
    Usuario.find(condicion, 'nombre email role estado google img')
        .skip(iDesde)
        .limit(iLimite)
        .exec((err, usuarios) => {
            if (err)
                return res.status(400).json({
                    ok: false,
                    err
                });

            Usuario.count(condicion, (err, totalRegistros) => {
                res.json({
                    ok: true,
                    usuarios,
                    totalUsuarios: totalRegistros
                });
            });
        });
});

app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
            //img: body.imagen
    });

    usuario.save((err, usuarioDB) => {
        if (err)
            return res.status(400).json({
                ok: false,
                err
            });

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Usado por convencion para actualizar datos
app.put('/usuario/:idUsuario', function(req, res) {
    let id = req.params.idUsuario;
    //Con el pick se filtran del objeto original las propiedades indicadas en el arreglo, 
    //es decir solo tendra las indicadas en el arreglo
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //{ new: true, runValidators: true } el new indica que el usuario devuelto sera el nuevo, si es false
    //regresa el usuario antes de los cambios
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err)
            return res.status(400).json({
                ok: false,
                err
            });

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//delete es usado por convencion para inhabilitar registros o borrar

//Elimina de forma fisica
// app.delete('/usuario/:idUsuario', function(req, res) {
//     let id = req.params.idUsuario;
//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//         if (err) {
//             return res.json(400, {
//                 ok: false,
//                 err
//             });
//         }

//         if (!usuarioBorrado) {
//             return res.json(400, {
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     })
// });

//Actualiza el estado a falso
app.delete('/usuario/:idUsuario', function(req, res) {
    let id = req.params.idUsuario;
    let usuarioInhabilitar = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, usuarioInhabilitar, { new: true }, (err, usuarioActualizado) => {
        if (err) {
            return res.json(400, {
                ok: false,
                err
            });
        }

        if (!usuarioActualizado) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });
    })
});

module.exports = app;