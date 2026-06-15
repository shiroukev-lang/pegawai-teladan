import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ValidationPage } from './components/ValidationPage';
import { Phase1Voting } from './components/Phase1Voting';
import { Phase1Results } from './components/Phase1Results';
import { Phase2Voting } from './components/Phase2Voting';
import { Phase2Results } from './components/Phase2Results';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/preview_page_v2.html" element={<Navigate to="/admin" replace />} />
          <Route path="/vote" element={<ValidationPage />} />
          <Route path="/phase1" element={<Phase1Voting />} />
          <Route path="/phase1/results" element={<Phase1Results />} />
          <Route path="/phase2" element={<Phase2Voting />} />
          <Route path="/phase2/results" element={<Phase2Results />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}