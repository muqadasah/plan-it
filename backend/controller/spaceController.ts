import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { GenericResponse } from '../exception/responseJson';
import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'
import { memberColors } from '../utils/constants';

dotenv.config();
const router = express.Router();

const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;
const UPSTASH_URL = process.env.UPSTASH_URL;

router.post('/create', async (req: Request, res: Response) => {

    const response: GenericResponse = {}
    try {
        const { userFullname } = req.body
        if (!userFullname || userFullname == '') {
            throw new Error("Invalid fullname");
        }

        const newSpace=nanoid();
        const setup:CacheDataType={
            owner:userFullname,
            space:newSpace,
            members:[userFullname]
        }
        const redis = new Redis({
            url: UPSTASH_URL!,
            token: UPSTASH_TOKEN!,
        })

        await redis.set(newSpace,JSON.stringify(setup))
        setup.memberColor=memberColors[0]
        response.status=200
        response.data=setup

    } catch (e: any) {
        console.log("error", e)
        response.status = 500
        response.msg = e.message || "An error occurred"
    }

    res.json({ response });
});

type CacheDataType={
    nodes?:Array<any> | null;
    edges?:Array<any> | null;
    members:Array<string>;
    owner:string;
    space:string;
    lastSavedBy?:string |null;
    memberColor?:string
}

router.post('/join', async (req: Request, res: Response) => {

    const response: GenericResponse = {}
    try {
        const { userFullname, shortCode } = req.body
        if (!userFullname || userFullname == '') {
            throw new Error("Invalid fullname");
        }
        if (!shortCode || shortCode == '') {
            throw new Error("Invalid board code");
        }

        const redis = new Redis({
            url: UPSTASH_URL!,
            token: UPSTASH_TOKEN!,
        })
        const cacheData=await redis.get(shortCode) as CacheDataType
        if(!cacheData){
            throw new Error("Invalid board code");
        }
        let memberIndex = cacheData.members.indexOf(userFullname);
        if(memberIndex==-1){
            cacheData.members.push(userFullname)
            await redis.set(shortCode,JSON.stringify(cacheData))
            memberIndex=cacheData.members.length-1;
        }
        cacheData.memberColor=memberColors[memberIndex]

        response.status=200
        response.data=cacheData
    } catch (e: any) {
        console.log("error", e)
        response.status = 500
        response.msg = e.message || "An error occurred"
    }
    res.json({ response });
});


router.post('/save', async (req: Request, res: Response) => {
    const response: GenericResponse = {}
    try {
        const { userFullname,nodes,edges,owner,space } = req.body
        if (!userFullname || userFullname == '') {
            throw new Error("Invalid fullname");
        }
        if (!space || space == '') {
            throw new Error("Invalid space");
        }
        if (!owner || owner == '') {
            throw new Error("Invalid owner");
        }

        const redis = new Redis({
            url: UPSTASH_URL!,
            token: UPSTASH_TOKEN!,
        })

        const cacheData=await redis.get(space) as CacheDataType

        cacheData.lastSavedBy=userFullname;
        cacheData.nodes=nodes;
        cacheData.edges=edges;

        await redis.set(space,JSON.stringify(cacheData))
        response.status=200
        response.data=cacheData
    } catch (e: any) {
        console.log("error", e)
        response.status = 500
        response.msg = e.message || "An error occurred"
    }
    res.json({ response });
});

export default router