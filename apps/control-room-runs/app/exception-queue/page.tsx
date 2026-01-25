import { ExceptionQueue } from "../components/ExceptionQueue";

const ExceptionQueuePage = () => {
  return (
    <div>
      <p>
        Review exception requests, validate mitigations, and keep execution lanes within
        policy guardrails.
      </p>
      <ExceptionQueue />
    </div>
  );
};

export default ExceptionQueuePage;
