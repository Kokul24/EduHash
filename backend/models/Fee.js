const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // Tuition, Library, Lab
    dueDate: { type: Date },
    description: { type: String }
});

module.exports = mongoose.model('Fee', FeeSchema);
