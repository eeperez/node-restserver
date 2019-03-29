const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        //Si no se encontro el usuario
        if (!usuarioDB) {
            return res.json(400, {
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        //Si la contraseña no coincide
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });

        //regresa el usuario y su token si se encontró
        res.json({
            ok: true,
            Usuario: usuarioDB,
            token
        });
    });

});

module.exports = app;