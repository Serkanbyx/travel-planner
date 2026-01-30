import { Routes, Route, Navigate } from 'react-router-dom';
import { PlansPage } from '@/pages/PlansPage';
import { PlanDetailPage } from '@/pages/PlanDetailPage';

/**
 * Main application component with routing
 */
function App() {
  return (
    <Routes>
      {/* Home redirects to plans */}
      <Route path="/" element={<Navigate to="/plans" replace />} />
      
      {/* Plans list page */}
      <Route path="/plans" element={<PlansPage />} />
      
      {/* Plan detail page */}
      <Route path="/plan/:id" element={<PlanDetailPage />} />
      
      {/* Catch all - redirect to plans */}
      <Route path="*" element={<Navigate to="/plans" replace />} />
    </Routes>
  );
}

export default App;
