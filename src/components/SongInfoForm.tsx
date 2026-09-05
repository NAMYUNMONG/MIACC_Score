import type { SongConti } from "../types";
import { getReferenceUrl } from "../referenceUrl";

type SongInfoFormProps = {
  title: string;
  songKey: string;
  referenceUrl: string;
  onChange: (patch: Partial<SongConti>) => void;
};

export function SongInfoForm({
  title,
  songKey,
  referenceUrl,
  onChange,
}: SongInfoFormProps) {
  const invalidReference = Boolean(referenceUrl.trim()) && !getReferenceUrl(referenceUrl);
  return (
    <section className="control-section" aria-labelledby="song-info-title">
      <h2 id="song-info-title">곡 정보</h2>
      <div className="form-grid song-info-grid">
        <label className="field">
          <span>곡 제목</span>
          <input
            value={title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="예: 주 이름 찬양"
          />
        </label>
        <label className="field">
          <span>조성</span>
          <input
            value={songKey}
            onChange={(event) => onChange({ key: event.target.value })}
            placeholder="예: G, Bb, F#m"
          />
        </label>
      </div>
      <label className="field">
        <span>레퍼런스 링크 (선택)</span>
        <input
          type="url"
          value={referenceUrl}
          onChange={(event) => onChange({ referenceUrl: event.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={invalidReference}
          aria-describedby="reference-url-help"
        />
        <small id="reference-url-help" className={invalidReference ? "field-error" : "field-help"}>
          {invalidReference
            ? "http:// 또는 https://로 시작하는 올바른 주소를 입력해 주세요."
            : "곡의 영상이나 음원 주소를 입력하면 미리보기와 PDF에 함께 표시됩니다."}
        </small>
      </label>
    </section>
  );
}
