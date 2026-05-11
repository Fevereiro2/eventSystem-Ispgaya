import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { pieChartWrap, pieCircle, pieLegend, pieLegendDot, pieLegendItem, pieSubtitle, pieTitle } from '../../styles/ui';
const legendItems = [
    { label: 'Artigos Cientificos', color: '#1f77b4' },
    { label: 'Capitulos', color: '#ff7f0e' },
    { label: 'Livros', color: '#2ca02c' },
    { label: 'Artigos em atas', color: '#9467bd' }
];
const pieStyle = {
    background: 'conic-gradient(#1f77b4 0deg 170deg, #ff7f0e 170deg 260deg, #2ca02c 260deg 300deg, #9467bd 300deg 360deg)'
};
function PieChartHero() {
    return (_jsxs("div", { className: pieChartWrap, children: [_jsx("h3", { className: pieTitle, children: "Distribuicao das Publicacoes" }), _jsx("p", { className: pieSubtitle, children: "Publicacoes Cientificas por tipo" }), _jsx("div", { className: pieCircle, style: pieStyle, "aria-label": "Distribuicao de publicacoes" }), _jsx("div", { className: pieLegend, children: legendItems.map((item) => (_jsxs("div", { className: pieLegendItem, children: [_jsx("span", { className: pieLegendDot, style: { backgroundColor: item.color } }), _jsx("span", { children: item.label })] }, item.label))) })] }));
}
export default PieChartHero;
