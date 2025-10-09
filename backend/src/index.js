import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config(
    {
        path: './.env'
    }
)

const PORT = process.env.PORT || 5000
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Express app error:", error);
            throw error;
        });

        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
            
        })
    })
    .catch((err) => {
        console.log('MONGODB connection error!!!', err);
        process.exit(1);

    })