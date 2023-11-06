import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import { RecoilRoot } from 'recoil';
import PlannerHolder from './pages/PlannerHolder';

function App() {
  return (
    <>
      <RecoilRoot>
            <BrowserRouter>
              <Routes>
                <Route index element={<Home />} />
                <Route path="planner" element={<PlannerHolder />} />
              </Routes>
            </BrowserRouter>
      </RecoilRoot>
    </>
  )
}

export default App
