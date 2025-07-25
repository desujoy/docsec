import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Verify } from './pages/Verify';
import { Admin } from './pages/Admin';
import { Audit } from './pages/Audit';
import { Test } from './pages/Test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
