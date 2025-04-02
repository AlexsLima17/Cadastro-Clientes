const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
    nome: String,
    cpf: String,
    telefone: String,
    cep: String,
    endereco: String,
    numero: String,
    estado: String,
    cidade: String
});

const Cliente = mongoose.model("Cliente", ClienteSchema);
module.exports = Cliente;
