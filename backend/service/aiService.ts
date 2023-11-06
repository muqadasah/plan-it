import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

export const generateTaskService = async (taskDescription: string): Promise<any | null> => {

    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });

        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().padStart(4, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = currentDate.getDate().toString().padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system', content: `You are task manager, who is assigned to create and update tasks. You are given tasks as nodes array of json object.  based on the ask from user (either to create a new task, update task). You are supposed to respond in json format only. Todays date is ${formattedDate} in YYYY-MM-DD.
                ` },
                { role: 'user', content: taskDescription }],
            functions: [
                {
                    name: "nodeAction",
                    parameters: {
                        type: "object",
                        properties: {
                            action: {
                                type: "string",
                                description: "",
                                enum: ['add-node', 'delete-node', 'update-node']
                            },
                            title: {
                                type: "string",
                                description: "applicabe only if you are updating an existing node",
                            },
                            id: {
                                type: "number",
                                description: "Applicable only if a node is asked to be deleted of updated otherwise 0",
                            },
                            startDate: {
                                type: "string",
                                description: "if any start date or range specified then start date in YYYY-MM-DD format else empty. For existing tasks if no start date specified then show the input start date of that existing task",
                            },
                            endDate: {
                                type: "string",
                                description: "if any end date / range specified then the end date in YYYY-MM-DD format else empty. For existing tasks if no date specified then show the input end date of that task",
                            },
                        },
                        required: ["action", "startDate", "endDate"]
                    },
                }
            ],
            model: 'gpt-3.5-turbo',
            //            model: 'gpt-4',
        });
        return chatCompletion.choices;
        //          return {'aa':"hello"};
    } catch (e: any) {
        throw new Error(e.message || "Unknown error")
    }

}
