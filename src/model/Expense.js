import mongoose from 'mongoose';

const { Schema } = mongoose;

const expenseSchema = new Schema({
  id: { type: String },
  description: { type: String, required: true },
  category: { type: String, default: 'Outras' },
  value: { type: Number, min: 0, required: true },
  date: { type: Date, required: true },
});

const Expenses = mongoose.model('expenses', expenseSchema);

export default Expenses;
