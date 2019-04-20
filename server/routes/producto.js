const express = require('express');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const app = express();

//==============================
// Obtener todos los productos
//==============================
app.get('/producto', verificarToken, (req, res) => {
    let desde = req.query.desde || 0;
    let iDesde = isNaN(desde) ? 0 : Number(desde);

    let limite = req.query.limite || 5;
    let iLimite = isNaN(limite) ? 5 : Number(limite);

    Producto.find({ disponible: true })
        .skip(iDesde)
        .limit(iLimite)
        .populate('categoria', 'descripcion') //nombre de la propiedad del modelo
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.json(500, {
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, iTotalProductos) => {
                return res.json({
                    ok: true,
                    producto: productoDB,
                    totalProductos: iTotalProductos
                });
            });
        });
});

//==============================
// Obtener un producto por ID
//==============================
app.get('/producto/:id', verificarToken, (req, res) => {
    let idProducto = req.params.id;

    Producto.findById(idProducto)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.json(500, {
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return json(400, {
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            return res.json({
                ok: true,
                producto: productoDB
            });
        });
});

//==============================
// Buscar productos
//==============================
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {
    let termino = req.params.termino;
    //Expresion regular para que el nombre no tenga que ser igual al de la BD
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.json(500, {
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                producto: productoDB
            });
        });
});

//==============================
// Crear un nuevo producto
//==============================
app.post('/producto', verificarToken, (req, res) => {
    let body = req.body;
    //let precio = req.body.precioUni

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        usuario: req.usuario._id,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.json(400, {
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            producto: productoDB
        });
    });

});

//==============================
// Actualizar un producto
//==============================
app.put('/producto/:id', verificarToken, (req, res) => {
    let idProducto = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(idProducto, body, { new: true, runValidators: true }, (err, prodcutoDB) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!prodcutoDB) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        return res.json({
            ok: true,
            producto: prodcutoDB
        });
    });

});

//==============================
// Borrar un producto
//==============================
app.delete('/producto/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    //Actualiza la propiedad disponible en falso
    let id = req.params.id;
    let deshabilitar = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, deshabilitar, (err, productoActualizado) => {
        if (err) {
            return res.json(500, {
                ok: false,
                err
            });
        }

        if (!productoActualizado) {
            return res.json(400, {
                ok: false,
                err: {
                    message: 'No se encontró el producto'
                }
            });
        }

        return res.json({
            ok: true,
            producto: productoActualizado,
            message: 'El producto ha sido deshabilitado'
        });

    })

});

module.exports = app;