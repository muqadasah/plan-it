import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { GenericResponse } from '../exception/responseJson';
import * as Ably from 'ably';

dotenv.config();
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const response: GenericResponse = {}
    try {
        const { clientId } = req.body
        if (!clientId) {
            throw new Error("Invalid client id");
        }

        const ably = new Ably.Rest({ key: process.env.ABLY_KEY });
        const tokenRequestPromise = () => {
            return new Promise((resolve, reject) => {
                ably.auth.createTokenRequest({ clientId }, null, (err, tokenRequest) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(tokenRequest);
                    }
                });
            });
        };

        const tokenRequest = await tokenRequestPromise();

        res.json({ tokenRequest });
        return
    } catch (e: any) {
        console.log("error", e)
        response.status = 500
        response.msg = e.message || "An error occurred"
    }
    res.json({ response });
});

export default router