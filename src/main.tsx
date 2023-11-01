import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AblyProvider } from "ably/react";
import { nanoid } from "nanoid";
import { Realtime } from "ably";
import Spaces from '@ably/spaces';

const client = new Realtime.Promise({
  clientId: nanoid(),
  key: import.meta.env.VITE_ABLY_KEY,
});


const spaces = new Spaces(client);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AblyProvider client={client}>
      <App spaces={spaces} />
    </AblyProvider>,
  </React.StrictMode>,
)
