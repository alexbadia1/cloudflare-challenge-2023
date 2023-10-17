import { Routes, Route } from 'react-router-dom';

import Me from './components/me';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Me />} />
    </Routes>
  );
}

export default App;