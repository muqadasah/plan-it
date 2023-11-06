
import { SpaceProvider, SpacesProvider } from "@ably/spaces/react";
import { ReactFlowProvider } from 'reactflow';
import Planner from "./Planner";
import { nanoid } from "nanoid";
import { Realtime } from "ably";
import Spaces from '@ably/spaces';
import axios from 'axios';
import { AblyProvider } from "ably/react";
import { useRecoilState } from "recoil";
import boardInfoAtom from "../state/boardInfo";

function PlannerHolder() {

    const [boardInfo] = useRecoilState(boardInfoAtom);

    const client = new Realtime.Promise({
        clientId: nanoid(),
        authCallback: async (tokenParams, callback) => {
            const response = await axios.post('https://planit-api.vercel.app/auth', { "clientId": tokenParams.clientId })
            callback(null, response.data.tokenRequest)
        },
    });

    const spaces = new Spaces(client);
    return (
        <>
            {spaces ? (
                <AblyProvider client={client}>
                    <ReactFlowProvider>
                        <SpacesProvider client={spaces} >
                            <SpaceProvider name={boardInfo}>
                                <Planner />
                            </SpaceProvider>
                        </SpacesProvider>
                    </ReactFlowProvider >
                </AblyProvider >) : ''}
        </>
    )
}

export default PlannerHolder

