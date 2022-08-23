import mongoose from "mongoose";
const {Schema} = mongoose;

const incomeSchema = new Schema({
    id: { type: String },
    description: { type: String, required: true },
    category: { type: String },
    value: { type: Number, required: true },
    date: { type: Date, required: true }
});

const Incomes = mongoose.model("incomes", incomeSchema);

export default Incomes;
