const jwt = require('jsonwebtoken');

//============================
// Verificar token
//============================

let verificarToken = (req, res, next) => {
    let token = req.get('token'); //nombre de la propiedad enviada en el header

    //Verifica que el token recibido sea valido
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.json(401, {
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        //valor del payload enviado que se definimos 
        //como usuario en el jwt.sign
        req.usuario = decoded.usuario;
        next();
    });
}

//============================
// Verificar rol administrador (Admin_role)
// para creacion, actualizacion y borrado de usuarios
//============================
let verificarAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json(405, {
            ok: false,
            err: {
                message: `El usuario ${usuario.email} no es Administrador`
            }
        });
    }

    next();
}

module.exports = {
    verificarToken,
    verificarAdmin_Role
}