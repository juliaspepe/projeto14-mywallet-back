import joi from "joi";
import bcrypt from 'bcrypt';
import { v4 as uuid } from "uuid";
import db from "../database/database.js"

const token = uuid();

export async function postSignUp(req, res) {
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
};

export async function getSignUp(req, res) {
    try {
        const userMywallet = await db.collection('users').find().toArray()
        res.send(userMywallet)
    } catch (err) {
        console.log(err)
    }
};

export async function postSignIn(req, res) {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });


    if (user && bcrypt.compareSync(password, user.password)) {
        const token = uuid();

        await db.collection("sessions").insertOne({
            userId: user._id,
            token,
        })

        const userInformation = {
            name: user.name,
            token: token
        }

        res.send(userInformation);
    } else {
        res.sendStatus(404);
    }
};