import type { SongConti } from "../types";

type SongInfoFormProps = {
  date: string;
  title: string;
  songKey: string;
  onChange: (patch: Partial<SongConti>) => void;
};

export function SongInfoForm({
  date,
  title,
  songKey,
  onChange,
}: SongInfoFormProps) {
  return (
    <section className="control-section" aria-labelledby="song-info-title">
      <h2 id="song-info-title">곡 정보</h2>
      <div className="form-grid song-info-grid">
        <label className="field">
          <span>날짜</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </label>
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
    </section>
  );
}
