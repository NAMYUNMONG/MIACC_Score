import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";

type ExportBarProps = {
  disabled: boolean;
  songCount: number;
  currentPage: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onExport: () => void;
};

export function ExportBar({
  disabled,
  songCount,
  currentPage,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onExport,
}: ExportBarProps) {
  return (
    <div className="export-bar">
      <div className="preview-nav">
        <button
          type="button"
          className="icon-button"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="이전 곡 미리보기"
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          {currentPage} / {songCount}
        </span>
        <button
          type="button"
          className="icon-button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="다음 곡 미리보기"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <button
        type="button"
        className="pdf-button"
        disabled={disabled}
        onClick={onExport}
      >
        <FileDown size={18} />
        PDF 내보내기
      </button>
    </div>
  );
}
