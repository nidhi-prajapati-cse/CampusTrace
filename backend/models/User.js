const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: Number, unique: true },
  email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
  phone: { type: String, match: [/^\d{10}$/, 'Phone must be 10 digits'] },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  studentId: { type: String },
  branch: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  lastLogin: { type: Date, default: null },
  image: { type: String, default: "" }, 
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
});


UserSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'user_id_counter' });

UserSchema.pre('save', function(next) {
  if (this.gender) this.gender = this.gender.toLowerCase();
  next();
});

module.exports = mongoose.model('User', UserSchema);
