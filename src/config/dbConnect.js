import mongoose from "mongoose";
import dotenv from "dotenv/config";

mongoose.connect(process.env.MONGODB_URI)
    .catch(error => console.log(error.message));

const db = mongoose.connection;

export default db;
