// Importar dependencias
const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');

// Mensaje de bienvenida
console.log('API NODE para RED SOCIAL ARRANCADA');

// Mensaje de bienvenida
connection()

//Crear servidor
const app = express();
const port = 3900;

// Configurar cors
app.use(cors());

//Convertir los datos del body a JSON
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configurar rutas
const UserRoutes = require('./routes/user');
const FollowRoutes = require('./routes/follow');
const PublicationRoutes = require('./routes/publication');

app.use('/api/user', UserRoutes);
app.use('/api/follow', FollowRoutes);
app.use('/api/publication', PublicationRoutes);

// Ruta de prueba
app.get('/prueba', (req,res) => {
   res.status(200).send({
       'message': 'Hola mundo desde mi API de NodeJS'
   })
 })

 // Correr servidor
 app.listen(port, () => {
        console.log('Servidor corriendo en el puerto:' + port);
 })