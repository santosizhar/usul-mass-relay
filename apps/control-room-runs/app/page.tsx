import { RunDashboard } from "./components/RunDashboard";

const HomePage = () => {
  return (
    <div>
      <p>
        Monitor run activity across the Mass Relay platform, review pending human-in-the-loop
        gates, and route exceptions through governance workflows.
      </p>
      <RunDashboard />
    </div>
  );
};

export default HomePage;
