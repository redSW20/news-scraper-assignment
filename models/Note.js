var mongoose = require("mongoose");

// Save reference to Scheme constructor
var Schema = mongoose.Schema;

//Use Schema to create NoteSchema object, similar to sequelize model
var NoteSchema = Schema({
    body: String
});

//This creates our model from above schema utilizing mongoose's method
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;