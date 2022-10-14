import mongoose from 'mongoose';

const { Schema } = mongoose;

const incomeSchema = new Schema({
  id: { type: String },
  description: { type: String, required: true },
  value: { type: Number, min: 0, required: true },
  date: { type: Date, required: true },
});

const Incomes = mongoose.model('incomes', incomeSchema);

export default Incomes;
