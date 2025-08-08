const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const FlaggedItemSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, 
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  dateFlagged: { type: Date, default: Date.now }
});

FlaggedItemSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'flag_id_counter' });
module.exports = mongoose.model('FlaggedItem', FlaggedItemSchema);
