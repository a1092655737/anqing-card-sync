import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import Sidebar from '@/components/Sidebar';
import DataCenter from '@/pages/DataCenter';
import Generator from '@/pages/Generator';
import Manage from '@/pages/Manage';
import DocMatch from '@/pages/DocMatch';
import FlowMatch from '@/pages/FlowMatch';
import TitleSelect from '@/pages/flow/TitleSelect';
import PositionProcess from '@/pages/flow/PositionProcess';
import TopicLibrary from '@/pages/flow/TopicLibrary';
import ReviewSummary from '@/pages/flow/ReviewSummary';
import './App.css';
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <HashRouter>
      <DataProvider>
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3c 30%, #2d1b69 60%, #1a1040 100%)' }}>
          <Sidebar />
          <div className="flex-1 ml-56">
            <Routes>
              <Route path="/" element={<DataCenter />} />
              <Route path="/generator" element={<Generator />} />
              <Route path="/manage" element={<Manage />} />
              <Route path="/doc-match" element={<DocMatch />} />
              <Route path="/flow-match" element={<FlowMatch />} />
              <Route path="/flow-match/title-select" element={<TitleSelect />} />
              <Route path="/flow-match/position-process" element={<PositionProcess />} />
              <Route path="/flow-match/topic-library" element={<TopicLibrary />} />
              <Route path="/flow-match/review-summary" element={<ReviewSummary />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </DataProvider>
    </HashRouter>
  );
}

export default App;
