import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { statCard, statLabel, statValue } from '../../styles/ui';
function StatCard({ value, label }) {
    return (_jsxs("article", { className: statCard, children: [_jsx("p", { className: statValue, children: value }), _jsx("p", { className: statLabel, children: label })] }));
}
export default StatCard;
