import express from "express";
import { 
    postSignUp, 
    getSignUp, 
    postSignIn
} from "../controllers/authController.js";

const router = express.Router();

router.post("/sign-up", postSignUp);

router.get('/sign-up', getSignUp);

router.post("/sign-in", postSignIn);

export default router;