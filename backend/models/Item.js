const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ItemSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  itemName: { type: String, required: true },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  description: { type: String, required: true },
  dateOfReport: { type: Date, default: Date.now, required: true },
  location: { type: String },
  image: { type: String, default: '' },  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

ItemSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'item_id_counter' });
module.exports = mongoose.model('Item', ItemSchema);