const {Schema, model} = require('mongoose');

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Publication = model('Publication', PublicationSchema, 'publications'); // Exportamos el modelo de Publication.
module.exports = Publication; // Exportamos el modelo de Publication