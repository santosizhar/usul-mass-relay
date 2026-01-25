import { RunDashboard } from "./components/RunDashboard";

const HomePage = () => {
  return (
    <div>
      <p>
        Monitor run activity across the Mass Relay platform. Filters are read-only and reflect
        the canonical Run summary schema.
      </p>
      <RunDashboard />
    </div>
  );
};

export default HomePage;
