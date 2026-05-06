import { X } from "lucide-react";
import type { ChangeEvent } from "react";
import type { SectionId, SectionOption, SongSection } from "../types";

type SectionToggleListProps = {
  sections: SectionOption[];
  songSections: SongSection[];
  onAddSection: (sectionId: SectionId) => void;
  onRemoveSection: (instanceId: string) => void;
  onRequestChange: (instanceId: string, request: string) => void;
};

export function SectionToggleList({
  sections,
  songSections,
  onAddSection,
  onRemoveSection,
  onRequestChange,
}: SectionToggleListProps) {
  const getSectionLabel = (sectionId: SectionId) =>
    sections.find((section) => section.id === sectionId)?.label ?? sectionId;

  const resizeRequestInput = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleRequestChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
    instanceId: string,
  ) => {
    resizeRequestInput(event.currentTarget);
    onRequestChange(instanceId, event.currentTarget.value);
  };

  return (
    <section className="control-section compact-section-control" aria-labelledby="sections-title">
      <h2 id="sections-title">섹션 구성</h2>

      <div className="add-section-grid" aria-label="섹션 추가">
        {sections.map((section) => (
          <button
            type="button"
            className="toggle-button"
            key={section.id}
            onClick={() => onAddSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="sequence-list">
        {songSections.length ? (
          songSections.map((section) => (
            <article className="sequence-item" key={section.instanceId}>
              <div className="sequence-item-header">
                <strong>{getSectionLabel(section.sectionId)}</strong>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onRemoveSection(section.instanceId)}
                  aria-label={`${getSectionLabel(section.sectionId)} 섹션 제외`}
                >
                  <X size={14} />
                </button>
              </div>

              <textarea
                className="section-request-input"
                ref={resizeRequestInput}
                value={section.request}
                onChange={(event) => handleRequestChange(event, section.instanceId)}
                placeholder="추가 요청사항"
                rows={1}
                aria-label={`${getSectionLabel(section.sectionId)} 추가 요청사항`}
              />
            </article>
          ))
        ) : (
          <p className="empty-message compact-empty">섹션을 추가하세요.</p>
        )}
      </div>
    </section>
  );
}
