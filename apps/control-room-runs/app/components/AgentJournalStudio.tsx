"use client";

import { useMemo, useState } from "react";
import {
  agentPromptOptions,
  initialSavedDocuments,
  type AgentPromptOption,
  type AgentSavedDocument
} from "../data/agent-journal";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type DraftOutput = {
  prompt: AgentPromptOption;
  generatedAt: string;
};

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

export const AgentJournalStudio = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    agentPromptOptions[0]?.id ?? ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftOutput, setDraftOutput] = useState<DraftOutput | null>(null);
  const [savedDocs, setSavedDocs] = useState<AgentSavedDocument[]>(initialSavedDocuments);

  const selectedPrompt = useMemo(
    () => agentPromptOptions.find((prompt) => prompt.id === selectedPromptId),
    [selectedPromptId]
  );

  const handleRunAgent = () => {
    if (!selectedPrompt) {
      return;
    }

    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: `${selectedPrompt.id}-user-${now}`,
        role: "user",
        content: selectedPrompt.userPrompt,
        timestamp: now
      },
      {
        id: `${selectedPrompt.id}-assistant-${now}`,
        role: "assistant",
        content: selectedPrompt.assistantResponse,
        timestamp: now
      }
    ]);
    setDraftOutput({ prompt: selectedPrompt, generatedAt: now });
  };

  const handleSaveDraft = () => {
    if (!draftOutput) {
      return;
    }

    const { prompt, generatedAt } = draftOutput;
    setSavedDocs((prev) => {
      if (prev.some((doc) => doc.path === prompt.targetPath)) {
        return prev.map((doc) =>
          doc.path === prompt.targetPath
            ? { ...doc, savedAt: generatedAt, status: "Updated in repo" }
            : doc
        );
      }

      return [
        {
          id: prompt.id,
          title: prompt.outputTitle,
          type: prompt.outputType,
          path: prompt.targetPath,
          savedAt: generatedAt,
          status: "Saved to repo",
          summary: prompt.description
        },
        ...prev
      ];
    });
  };

  return (
    <section className="agent-grid">
      <div className="agent-panel card">
        <header className="agent-header">
          <div>
            <p className="detail-eyebrow">AI agent workspace</p>
            <h2>Documentation &amp; journal writer</h2>
            <p className="detail-subtitle">
              Predetermined prompts drive the assistant to draft journals and documentation
              artifacts. Outputs are staged for repo writeback through governance review.
            </p>
          </div>
          <span className="app-badge">Read-only safe</span>
        </header>

        <div className="agent-controls">
          <div>
            <label htmlFor="prompt">Prompt library</label>
            <select
              id="prompt"
              value={selectedPromptId}
              onChange={(event) => setSelectedPromptId(event.target.value)}
            >
              {agentPromptOptions.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
            {selectedPrompt && (
              <p className="detail-note">{selectedPrompt.description}</p>
            )}
          </div>
          <div className="action-row">
            <button className="button button-primary" onClick={handleRunAgent}>
              Run agent
            </button>
          </div>
        </div>

        <div className="agent-chat">
          {messages.length === 0 ? (
            <div className="empty-state">Run a prompt to start the AI journal session.</div>
          ) : (
            <ul className="chat-thread">
              {messages.map((message) => (
                <li key={message.id} className={`chat-bubble chat-${message.role}`}>
                  <div className="chat-meta">
                    <span>{message.role === "user" ? "Operator" : "AI agent"}</span>
                    <span>{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div className="chat-content">{message.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="draft-panel">
          <h3>Draft output</h3>
          {draftOutput ? (
            <div className="draft-card">
              <div>
                <p className="draft-title">{draftOutput.prompt.outputTitle}</p>
                <p className="draft-meta">
                  {draftOutput.prompt.outputType} · {draftOutput.prompt.targetPath}
                </p>
                <div className="draft-tags">
                  {draftOutput.prompt.tags.map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="button button-secondary" onClick={handleSaveDraft}>
                Save to repo
              </button>
            </div>
          ) : (
            <p className="detail-note">No draft yet. Run a prompt to generate documentation.</p>
          )}
        </div>
      </div>

      <aside className="agent-panel card">
        <header className="list-header">
          <h3>Saved documentation</h3>
          <p className="list-subtitle">Governance-approved records committed in-repo.</p>
        </header>
        <ul className="doc-list">
          {savedDocs.map((doc) => (
            <li key={doc.path} className="doc-card">
              <div>
                <p className="doc-title">{doc.title}</p>
                <p className="doc-summary">{doc.summary}</p>
                <p className="doc-path">{doc.path}</p>
              </div>
              <div className="doc-meta">
                <span className="doc-status">{doc.status}</span>
                <span className="doc-time">{formatTimestamp(doc.savedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
};
