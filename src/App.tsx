import { Routes, Route, Navigate } from 'react-router-dom';
import Main from './pages/Main';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/main" element={<Main />} />
    </Routes>
  );
};

export default App;
