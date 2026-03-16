import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminCultura from './pages/AdminCultura';
import ClubeLeitura from './pages/ClubeLeitura';
import LaboratorioCultural from './pages/LaboratorioCultural';
import PublicacoesCientificas from './pages/PublicacoesCientificas';
import Teatro from './pages/Teatro';
import TunaAcademica from './pages/TunaAcademica';
import { appRoot } from './styles/ui';

function App() {
  return (
    <BrowserRouter>
      <div className={appRoot}>
        <Routes>
          <Route path="/" element={<PublicacoesCientificas />} />
          <Route path="/laboratorio-cultural" element={<LaboratorioCultural />} />
          <Route
            path="/infocultura/*"
            element={<AdminCultura />}
          />
          <Route
            path="/laboratorio-cultural/admin"
            element={<Navigate to="/infocultura/resumo" replace />}
          />
          <Route path="/laboratorio-cultural/tuna" element={<TunaAcademica />} />
          <Route
            path="/laboratorio-cultural/clube-leitura"
            element={<ClubeLeitura />}
          />
          <Route path="/laboratorio-cultural/teatro" element={<Teatro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
