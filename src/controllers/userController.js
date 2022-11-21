import joi from "joi";
import dayjs from 'dayjs';
import { ObjectId } from "mongodb";
import db from "../database/database.js"
import { v4 as uuid } from "uuid";

const token = uuid();

export async function postEntrada(req, res) {
    const { value, description } = req.body;
    const day = dayjs().format('DD/MM');
    const type = "entrada";
    const user = res.locals.user;

    const userSchema = joi.object({
        value: joi.string().required(),
        description: joi.string().required(),
    });

    try {
        const validation = userSchema.validate({ value, description }, { abortEarly: false })

        if (validation.error) {
            return res.status(422).send(validation.error.details)
        }

        await db.collection('cashflow').insertOne({
            value,
            description,
            day,
            type,
            userId: user._id
        });
        return res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
        return;
    }
};

export async function postSaida(req, res) {
    const { value, description } = req.body;
    const day = dayjs().format('DD/MM');
    const type = "saida";
    const user = res.locals.user;

    const userSchema = joi.object({
        value: joi.string().required(),
        description: joi.string().required(),
    });

    try {
        const validation = userSchema.validate({ value, description }, { abortEarly: false })

        if (validation.error) {
            return res.status(422).send(validation.error.details)
        }

        await db.collection('cashflow').insertOne({
            value: value*-1,
            description,
            day,
            type,
            userId: user._id
        });
        return res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
        return;
    }
};

export async function getRegistros(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);

    const session = await db.collection("sessions").findOne({ token });
    console.log("session:", session)

    if (!session) {
        return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
        _id: session.userId
    })
    console.log("user:", user)

    if (user) {
        const usersWallet = await db.collection('cashflow').find({ userId: new ObjectId(user._id) }).toArray();
        console.log("wallet:", usersWallet)
        return res.send(usersWallet);
    } else {
        res.sendStatus(401);
    }
};