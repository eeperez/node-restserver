const express = require('express');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');
const app = express();

//==============================
// Mostrar todos las categorias
//==============================
app.get('/categoria', verificarToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //ordenamiento
        .populate('usuario', 'nombre email') //nombre del esquema a llenar
        .exec((err, categoria) => {
            if (err) {
                return res.json(500, {
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categoria
            });
        });
});

//==============================
// Mostrar una categoria por ID
//==============================
app.get('/categoria/:idCategoria', verificarToken, (req, res) => {
    let idCategoria = req.params.idCategoria;

    Categoria.findById(idCategoria, (err, categoriaDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'Categoria no encotrada'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//==============================
// Crear una categoria
//==============================
app.post('/categoria', [verificarToken], (req, res) => {
    let descripcion = req.body.descripcion;

    let categoria = new Categoria({
        descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.json(400, {
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//==============================
// Actualizar una categoria
//==============================
app.put('/categoria/:idCategoria', verificarToken, (req, res) => {
    let idCategoria = req.params.idCategoria;
    let body = req.body;

    Categoria.findByIdAndUpdate(idCategoria, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.json(400, {
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//==============================
// Borrar fisicamente una categoria
//==============================
app.delete('/categoria/:idCategoria', [verificarToken, verificarAdmin_Role], (req, res) => {
    let idCategoria = req.params.idCategoria;
    Categoria.findByIdAndRemove(idCategoria, (err, categoriaBorrada) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        return res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaBorrada
        });
    });
});

module.exports = app;