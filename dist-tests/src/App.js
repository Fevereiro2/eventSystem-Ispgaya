import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminCultura from './pages/AdminCultura';
import ClubeCultural from './pages/ClubeCultural';
import ClubeLeitura from './pages/ClubeLeitura';
import EventoCultural from './pages/EventoCultural';
import EventosPage from './pages/EventosPage';
import HomePage from './pages/HomePage';
import LaboratorioAgendaPage from './pages/LaboratorioAgendaPage';
import LaboratorioCultural from './pages/LaboratorioCultural';
import LaboratorioRoadmap from './pages/LaboratorioRoadmap';
import LivroCultural from './pages/LivroCultural';
import NoticiaCultural from './pages/NoticiaCultural';
import NoticiasPage from './pages/NoticiasPage';
import PublicacoesCientificas from './pages/PublicacoesCientificas';
import SessaoCultural from './pages/SessaoCultural';
import Teatro from './pages/Teatro';
import TunaAcademica from './pages/TunaAcademica';
import { appRoot } from './styles/ui';
import InfoCulturaRouteTracker from './components/layout/InfoCulturaRouteTracker';
function App() {
    return (_jsxs(BrowserRouter, { children: [_jsx(InfoCulturaRouteTracker, {}), _jsx("div", { className: appRoot, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/vida-academica/noticias", element: _jsx(NoticiasPage, {}) }), _jsx(Route, { path: "/vida-academica/noticias/:newsId", element: _jsx(NoticiaCultural, {}) }), _jsx(Route, { path: "/vida-academica/eventos", element: _jsx(EventosPage, {}) }), _jsx(Route, { path: "/vida-academica/eventos/:eventId", element: _jsx(EventoCultural, {}) }), _jsx(Route, { path: "/investigacao/publicacoes-cientificas", element: _jsx(PublicacoesCientificas, {}) }), _jsx(Route, { path: "/laboratorio-cultural", element: _jsx(LaboratorioCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/agenda", element: _jsx(LaboratorioAgendaPage, {}) }), _jsx(Route, { path: "/laboratorio-cultural/roadmap", element: _jsx(LaboratorioRoadmap, {}) }), _jsx(Route, { path: "/infocultura/*", element: _jsx(AdminCultura, {}) }), _jsx(Route, { path: "/laboratorio-cultural/admin", element: _jsx(Navigate, { to: "/infocultura/resumo", replace: true }) }), _jsx(Route, { path: "/laboratorio-cultural/tuna", element: _jsx(TunaAcademica, {}) }), _jsx(Route, { path: "/laboratorio-cultural/clube-leitura", element: _jsx(ClubeLeitura, {}) }), _jsx(Route, { path: "/laboratorio-cultural/clubes/:clubId", element: _jsx(ClubeCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/livros/:bookId", element: _jsx(LivroCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/noticias/:newsId", element: _jsx(NoticiaCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/sessoes/:sessionId", element: _jsx(SessaoCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/eventos/:eventId", element: _jsx(EventoCultural, {}) }), _jsx(Route, { path: "/laboratorio-cultural/teatro", element: _jsx(Teatro, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
}
export default App;
