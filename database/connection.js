const mongoose = require('mongoose');

// Conexión a la base de datos
const connection = async () => {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/mi_red_social');
        console.log('Conexión a la base de datos establecida');
    }catch(error){
        throw new Error('Error al conectar a la base de datos');
    }
}

module.exports = connection; 