import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import QuestionGenerator from './components/QuestionGenerator';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);


function Q_App() {
  return (
    <div>
      <h1>Interview Questions</h1>
      <QuestionGenerator />
    </div>
  );
}

export default Q_App;
