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

app.get('/sign-up', async (req, res) => {
    try {
        const userMywallet = await db.collection('users').find().toArray()
        res.send(userMywallet)
    } catch (err) {
        console.log(err)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = uuid();

        await db.collection("sessions").insertOne({
            userId: user._id,
            token
        })

        res.send(token);
        console.log('usuário encontrado')
    } else {
        console.log('Usuário não encontrado')
    }
});

app.post("/entrada", async (req, res) => {
    const { authorization } = req.headers;
    const user = req.body
    const { value, description } = req.body;
    const day = dayjs().format('DD/MM');
    const type = "entrada";

    const userSchema = joi.object({
        value: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        description: joi.string().required(),
    });

    try {
        const userExists = await db.collection('sessions').findOne({ userId: user._id })
        if (userExists) {
            const validation = userSchema.validate({ value, description }, { abortEarly: false })

            if (validation.error) {
                return res.status(422).send(validation.error.details)
            }
        }

        await db.collection('cashflow').insertOne({
            value,
            description,
            day,
            type
        });
        console.log('entrada cadastrada')
        return res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

})

app.post("/saida", async (req, res) => {
    const { authorization } = req.headers;
    const user = req.body
    const { value, description } = req.body;
    const day = dayjs().format('DD/MM');
    const type = "saida";

    const userSchema = joi.object({
        value: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        description: joi.string().required(),
    });

    try {
        const userExists = await db.collection('sessions').findOne({ userId: user._id })
        if (userExists) {
            const validation = userSchema.validate({ value, description }, { abortEarly: false })

            if (validation.error) {
                return res.status(422).send(validation.error.details)
            }
        }

        await db.collection('cashflow').insertOne({
            value,
            description,
            day,
            type
        });
        console.log('saída cadastrada')
        return res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
});

app.get("/registros", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);

    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
        return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
        _id: session.userId
    })

    if (user) {
        const usersWallet = await db.collection('cashflow').find().toArray();
        res.send(usersWallet);
    } else {
        res.sendStatus(401);
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Server running in port: ${process.env.PORT} `)
)