import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuid } from "uuid";
import bcrypt from 'bcrypt';
import { MongoClient } from "mongodb";
import joi from "joi";
import dayjs from  'dayjs';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
const token = uuid();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
    console.log("mongo db conectado");
} catch (err) {
    console.log(err);
}

const db = mongoClient.db("mywallet");

app.listen(process.env.PORT, () =>
    console.log(`Server running in port: ${process.env.PORT} `)
)