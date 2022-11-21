import db from "../database/database.js";

export default async function validation(req, res, next){
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

    if (!user) {
       return res.sendStatus(401)
    } 

    res.locals.user = user;
    next();
};



