import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Planner from './pages/Planner';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import { RecoilRoot } from 'recoil';
import Spaces from '@ably/spaces';
import { SpaceProvider, SpacesProvider } from "@ably/spaces/react";
import { ReactFlowProvider } from 'reactflow';

function App({ spaces }: { spaces: Spaces }) {
  return (
    <>
      <RecoilRoot>
      <ReactFlowProvider>
        <SpacesProvider client={spaces}>
          <SpaceProvider name="member-location">
            <BrowserRouter>
              <Routes>
                <Route index element={<Home />} />
                <Route path="planner" element={<Planner />} >
                  <Route path="page1" element={<Page1 />} />
                  <Route path="page2" element={<Page2 />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </SpaceProvider>
        </SpacesProvider>
        </ReactFlowProvider>
      </RecoilRoot>
    </>
  )
}

export default App
