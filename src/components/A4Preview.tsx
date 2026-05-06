import type { CSSProperties } from "react";
import { DEFAULT_SHEET_IMAGE_ADJUST } from "../constants";
import type { SectionId, SectionOption, SongConti } from "../types";

type A4PreviewProps = {
  song: SongConti;
  sections: SectionOption[];
  pageNumber: number;
};

export function A4Preview({ song, sections, pageNumber }: A4PreviewProps) {
  const getSectionLabel = (sectionId: SectionId) =>
    sections.find((section) => section.id === sectionId)?.label ?? sectionId;

  const imageAdjust = song.sheetImageAdjust ?? DEFAULT_SHEET_IMAGE_ADJUST;
  const imageStyle: CSSProperties = {
    clipPath: `inset(${imageAdjust.cropTop}% ${imageAdjust.cropRight}% ${imageAdjust.cropBottom}% ${imageAdjust.cropLeft}%)`,
    transform: `translateY(${imageAdjust.offsetY}%) scale(${imageAdjust.scale / 100})`,
  };

  return (
    <section className="a4-card" aria-label={`${pageNumber}번 곡 A4 미리보기`}>
      <header className="preview-header">
        <div>
          <p className="preview-date">{song.date || "날짜"}</p>
          <h2>{song.title || "곡 제목"}</h2>
        </div>
        <div className="key-badge">{song.key || "Key"}</div>
      </header>

      <div className="sheet-area">
        {song.sheetImageUrl ? (
          <div className="sheet-image-frame">
            <img src={song.sheetImageUrl} alt="악보 이미지" style={imageStyle} />
          </div>
        ) : (
          <div className="sheet-placeholder">악보 이미지 영역</div>
        )}
      </div>

      <div className="preview-sections">
        {song.sections.length ? (
          song.sections.map((section) => (
            <article
              className={`preview-section ${
                section.sectionId === "other" ? "preview-section-other" : ""
              }`}
              key={section.instanceId}
            >
              {section.sectionId === "other" ? null : (
                <h3>{getSectionLabel(section.sectionId)}</h3>
              )}
              {section.request.trim() ? <p>{section.request}</p> : null}
            </article>
          ))
        ) : (
          <p className="empty-message">선택한 섹션이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
