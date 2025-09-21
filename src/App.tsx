import { Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
