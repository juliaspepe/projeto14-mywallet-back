import express from "express";
import {
    postEntrada,
    postSaida,
    getRegistros
} from "../controllers/userController.js";
import validation from "../middlewares/validationMiddlewares.js"

const router = express.Router();

router.use(validation);

router.post("/entrada", postEntrada);

router.post("/saida", postSaida);

router.get("/registros", getRegistros);

export default router;
