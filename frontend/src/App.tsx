import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import CreateReferral from './pages/CreateReferral';
import AllReferrals from './pages/AllReferrals';
import ReferralDetail from './pages/ReferralDetail';
import FacilityDirectory from './pages/FacilityDirectory';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import PatientView from './pages/PatientView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateReferral />} />
          <Route path="referrals" element={<AllReferrals />} />
          <Route path="referrals/:id" element={<ReferralDetail />} />
          <Route path="facilities" element={<FacilityDirectory />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="patient" element={<PatientView />} />
          <Route path="patient/:code" element={<PatientView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
