import { PlaybookExplorer } from "../components/PlaybookExplorer";

const PlaybooksPage = () => {
  return (
    <div>
      <p>
        Browse Agent Playbooks available to the Control Room. This view is read-only and aligns
        to the governed playbook contracts.
      </p>
      <PlaybookExplorer />
    </div>
  );
};

export default PlaybooksPage;
