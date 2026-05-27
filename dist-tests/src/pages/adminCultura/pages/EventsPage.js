import { jsx as _jsx } from "react/jsx-runtime";
import ActivitiesPage from '../ActivitiesPage';
function EventsPage(props) {
    return _jsx(ActivitiesPage, { ...props, activityTab: "events" });
}
export default EventsPage;
