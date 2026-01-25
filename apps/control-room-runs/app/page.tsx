import { ControlRoomModules } from "./components/ControlRoomModules";
import { RunDashboard } from "./components/RunDashboard";

const HomePage = () => {
  return (
    <div>
      <p>
        Monitor run activity across the Mass Relay platform, review pending human-in-the-loop
        gates, and route exceptions through governance workflows.
        Monitor run activity across the Mass Relay platform. Filters are read-only, and every
        run is aggregated across Foundation projects (not only Ops Automation Studio).
      </p>
      <ControlRoomModules />
      <RunDashboard />
    </div>
  );
};

export default HomePage;
