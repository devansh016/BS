const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        linkedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
            default: null,
        },
        linkPrecedence: {
            type: String,
            enum: ['primary', 'secondary'],
            default: 'primary',
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Contact', contactSchema);
