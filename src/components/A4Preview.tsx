import type { CSSProperties } from "react";
import { DEFAULT_SHEET_IMAGE_ADJUST } from "../constants";
import { getReferenceUrl } from "../referenceUrl";
import type { SectionId, SectionOption, SheetImageAdjust, SongConti } from "../types";

type A4PreviewProps = {
  song: SongConti;
  sections: SectionOption[];
  pageNumber: number;
};

export function A4Preview({ song, sections, pageNumber }: A4PreviewProps) {
  const referenceUrl = getReferenceUrl(song.referenceUrl);
  const getSectionLabel = (sectionId: SectionId) =>
    sections.find((section) => section.id === sectionId)?.label ?? sectionId;

  const getImageStyle = (imageAdjust: SheetImageAdjust): CSSProperties => ({
    clipPath: `inset(${imageAdjust.cropTop}% ${imageAdjust.cropRight}% ${imageAdjust.cropBottom}% ${imageAdjust.cropLeft}%)`,
    transform: `translateY(${imageAdjust.offsetY}%) scale(${imageAdjust.scale / 100})`,
  });
  const sheets = [
    {
      id: "first",
      label: "기본 악보",
      key: song.key,
      imageUrl: song.sheetImageUrl,
      imageAdjust: song.sheetImageAdjust ?? DEFAULT_SHEET_IMAGE_ADJUST,
    },
    ...(song.secondSheet?.imageUrl ? [{
      id: "second",
      label: "키업 악보",
      ...song.secondSheet,
    }] : []),
  ].filter((sheet) => sheet.imageUrl);

  return (
    <section className="a4-card" aria-label={`${pageNumber}번 곡 A4 미리보기`}>
      <header className="preview-header">
        <div className="preview-song-info">
          <p className="preview-date">{song.date || "날짜"}</p>
          <h2>{song.title || "곡 제목"}</h2>
          {referenceUrl ? (
            <a className="preview-reference" href={referenceUrl} target="_blank" rel="noopener noreferrer">
              레퍼런스: {referenceUrl}
            </a>
          ) : null}
        </div>
        <div className="key-badge">
          {song.key || "Key"}
          {song.secondSheet?.imageUrl ? ` → ${song.secondSheet.key || "Key"}` : ""}
        </div>
      </header>

      <div className={`sheet-stack${sheets.length > 1 ? " sheet-stack-double" : ""}`}>
        {sheets.length ? sheets.map((sheet) => (
          <div className="sheet-slot" key={sheet.id}>
            {song.secondSheet?.imageUrl ? (
              <p className="sheet-key-label">{sheet.label} · {sheet.key || "Key"}</p>
            ) : null}
            <div className="sheet-area">
              <div className="sheet-image-frame">
                <img src={sheet.imageUrl} alt={sheet.label} style={getImageStyle(sheet.imageAdjust)} />
              </div>
            </div>
          </div>
        )) : (
          <div className="sheet-area"><div className="sheet-placeholder">악보 이미지 영역</div></div>
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
