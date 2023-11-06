import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { GenericResponse } from '../exception/responseJson';
import { generateTaskService } from '../service/aiService';

const router = express.Router();

router.post('/generate-task', async (req: Request, res: Response) => {

    const response: GenericResponse = {}
    try {
        const { taskDescription } = req.body
        if (!taskDescription) {
            throw new Error("Invalid task description");
        }
        const results=await generateTaskService(taskDescription.trim());
        response.status = 200
        response.data=results
    } catch (e: any) {
        console.log("error", e)
        response.status = 500
        response.msg = e.message || "An error occurred"
    }

    res.json({ response });
});

export default router