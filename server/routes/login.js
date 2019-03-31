const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

//Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

//Login por google
app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let usuarioGoogle = await verify(token)
        .catch(e => {
            return res.json(403, {
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: usuarioGoogle.email }, (err, usuarioDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.json(400, {
                    ok: false,
                    err: {
                        message: 'El usuario ya existe con autenticación normal, use esos datos'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // si el usuaio no existe en la BD se crea el nuevo usuario
            let usuario = new Usuario();
            usuario.nombre = usuarioGoogle.nombre;
            usuario.email = usuarioGoogle.email;
            usuario.img = usuarioGoogle.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.json(400, {
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });
        }
    });
});

module.exports = app;