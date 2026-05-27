import { jsx as _jsx } from "react/jsx-runtime";
import ActivitiesPage from '../ActivitiesPage';
function SessionsPage(props) {
    return _jsx(ActivitiesPage, { ...props, activityTab: "sessions" });
}
export default SessionsPage;
