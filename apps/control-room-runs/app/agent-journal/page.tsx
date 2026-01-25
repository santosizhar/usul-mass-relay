import { AgentJournalStudio } from "../components/AgentJournalStudio";

const AgentJournalPage = () => {
  return (
    <div>
      <p>
        Use the AI agent workspace to draft Control Room journals and documentation. Prompts are
        predefined and output is staged for repository writeback through governance review.
      </p>
      <AgentJournalStudio />
    </div>
  );
};

export default AgentJournalPage;
