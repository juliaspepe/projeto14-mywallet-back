import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(userRouter);

app.listen(process.env.PORT, () =>
    console.log(`Server running in port: ${process.env.PORT} `)
)