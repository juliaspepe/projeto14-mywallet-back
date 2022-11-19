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

app.post("/sign-up", async (req, res) => {
    const user = req.body;
    const { name, email, password } = req.body;
    const userSchema = joi.object({
        name: joi.required(),
        email: joi.string().required(),
        password: joi.string().required(),
    });

    try {
        const userExists = await db.collection('users').findOne({ email: user.email })
        if (userExists) {
            return res.status(409).send({ message: "e-mail já cadastrado" })
        }

        const validation = userSchema.validate({ name, email, password }, { abortEarly: false })

        if (validation.error) {
            return res.status(422).send(validation.error.details)
        }

        const passwordHash = bcrypt.hashSync(user.password, 10);

        await db.collection('users').insertOne({ ...user, password: passwordHash })

        res.sendStatus(201);
        console.log('usuário cadastrado com sucesso')

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Server running in port: ${process.env.PORT} `)
)