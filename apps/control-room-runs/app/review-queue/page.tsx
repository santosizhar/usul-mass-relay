import { ApprovalQueue } from "../components/ApprovalQueue";

const ReviewQueuePage = () => {
  return (
    <div>
      <p>
        Resolve pending approvals, document decisions, and route escalations into the policy
        council workflow.
      </p>
      <ApprovalQueue />
    </div>
  );
};

export default ReviewQueuePage;
