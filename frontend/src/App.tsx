import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CreateRetro from './pages/CreateRetro';
import JoinRetro from './pages/JoinRetro';
import RetroRoom from './pages/RetroRoom';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRetro />} />
        <Route path="/join/:inviteCode" element={<JoinRetro />} />
        <Route path="/retro/:retroId" element={<RetroRoom />} />
      </Routes>
    </>
  );
}

export default App;
