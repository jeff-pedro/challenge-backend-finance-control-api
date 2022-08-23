import express from "express";
import db from "./config/dbConnect.js";
import routes from "./routes/index.js";

// database's connection
db.on("error", console.log.bind(console, "Connection error - "));
db.once("open", () => {
    console.log("Database connected!");
});

const app = express();
routes(app);

export default app;
