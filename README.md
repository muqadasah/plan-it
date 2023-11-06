# Plan-it
Plan-it is an innovative way to collaborate in realtime and quickly jot down activities for an upcoming project, powered by Ably spaces and Open AI.

## Inspiration
While project management tools are organised, there are a lot of discussions that take place to arrive at plans. What if someone could quick gather notes and convert them to tasks. Plan.it aims to be that brainstorming notes taking session that can help convert things to a brief project plan. It comes with realtime collaboration using a task board which also has as Gantt view.

## Demo & Video
Demo Link: [https://planit.coauth.dev](https://planit.coauth.dev)
Video Link: [Youtube](https://youtu.be/RcvJFfo7D8I)
Blog Post: [Devpost](https://devpost.com/software/plan-it-xrncmp)

## Tech Stack
- React Typescript
- Express Typescript
- Ably Spaces React SDK (for realtime collaboration)
- ReactFlow
- gantt-task-react
- Upstash
- Vercel

## Features
- No login required
- Create tasks / activities and collaborate in real-time with Ably spaces (Online status, live cursor, live location)
- View activities as a set of connected flows or Gantt chart
- Save to cloud (Powered by Upstash redis)
- Import or export your board to local machine
- Easily type tasks and AI will create the task for you

## Ably related learnings for future developers
- Using Spaces React SDK
- Location feature usage in non-row format scenarios
- Avatars based on centralized colors to keep in sync
- Adding pointers on canvas board
- Channels communication

## Pre-requisite
1. Ably account for realtime (Key to be updated in backend)
2. Upstash (rest url and token) to store data
3. Vercel for hosting

### Environment variables
**frontend**
VITE_PLANIT_API_URL= The Backend hosted url of Planit

**backend**
OPENAI_API_KEY= Open AI Key for AI task generation
ABLY_KEY= Ably key for authentication
UPSTASH_URL= Redis store Rest URL from upstash
UPSTASH_TOKEN= Redis Rest Token from upstash


## Installation
1. add the env file in **backend/.env** and **frontend/.env**. Examples keys are provided
2. Note: once 
```shell
git clone https://github.com/godwinpinto/plan-it.git
cd backend
npm run build
vercel --prod

# update the domain of your Backend in the frontend env file

cd frontend
npm run build
vercel --prod

```

## License
The source code is released under MIT license.
