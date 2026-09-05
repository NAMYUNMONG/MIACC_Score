import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { A4Preview } from "./components/A4Preview";
import { ExportBar } from "./components/ExportBar";
import { ImageUploader } from "./components/ImageUploader";
import { SectionToggleList } from "./components/SectionToggleList";
import { SongInfoForm } from "./components/SongInfoForm";
import { DEFAULT_SHEET_IMAGE_ADJUST, SECTION_OPTIONS } from "./constants";
import type { SectionId, SongConti, SongSection } from "./types";

const createId = () => crypto.randomUUID();

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createSection = (sectionId: SectionId): SongSection => ({
  instanceId: createId(),
  sectionId,
  request: "",
});

const createSong = (): SongConti => ({
  id: createId(),
  date: getToday(),
  title: "",
  key: "",
  referenceUrl: "",
  sheetImageUrl: "",
  sheetImageAdjust: DEFAULT_SHEET_IMAGE_ADJUST,
  secondSheet: null,
  sections: [],
});

function App() {
  const [songs, setSongs] = useState<SongConti[]>(() => [createSong()]);
  const [activeSongId, setActiveSongId] = useState(() => songs[0].id);
  const [previewIndex, setPreviewIndex] = useState(0);

  const activeSong = songs.find((song) => song.id === activeSongId) ?? songs[0];
  const previewSong = songs[Math.min(previewIndex, songs.length - 1)];

  const hasPreviewContent = useMemo(
    () =>
      songs.some(
        (song) => song.title || song.key || song.referenceUrl || song.sheetImageUrl || song.secondSheet?.imageUrl || song.sections.length,
      ),
    [songs],
  );

  const updateActiveSong = (patch: Partial<SongConti>) => {
    setSongs((current) =>
      current.map((song) =>
        song.id === activeSong.id ? { ...song, ...patch } : song,
      ),
    );
  };

  const selectSong = (songId: string, index: number) => {
    setActiveSongId(songId);
    setPreviewIndex(index);
  };

  const updateSecondSheet = (patch: Partial<NonNullable<SongConti["secondSheet"]>>) => {
    if (!activeSong.secondSheet) return;
    updateActiveSong({ secondSheet: { ...activeSong.secondSheet, ...patch } });
  };

  const addSong = () => {
    const nextSong = createSong();
    setSongs((current) => [...current, nextSong]);
    setActiveSongId(nextSong.id);
    setPreviewIndex(songs.length);
  };

  const removeSong = (songId: string) => {
    if (songs.length === 1) return;

    const removedIndex = songs.findIndex((song) => song.id === songId);
    const nextSongs = songs.filter((song) => song.id !== songId);
    const nextIndex = Math.min(Math.max(removedIndex, 0), nextSongs.length - 1);

    setSongs(nextSongs);
    setPreviewIndex((currentIndex) => Math.min(currentIndex, nextSongs.length - 1));

    if (songId === activeSongId) {
      setActiveSongId(nextSongs[nextIndex].id);
    }
  };

  const addSection = (sectionId: SectionId) => {
    updateActiveSong({
      sections: [...activeSong.sections, createSection(sectionId)],
    });
  };

  const removeSection = (instanceId: string) => {
    updateActiveSong({
      sections: activeSong.sections.filter(
        (section) => section.instanceId !== instanceId,
      ),
    });
  };

  const updateSectionRequest = (instanceId: string, request: string) => {
    updateActiveSong({
      sections: activeSong.sections.map((section) =>
        section.instanceId === instanceId ? { ...section, request } : section,
      ),
    });
  };

  const movePreview = (direction: -1 | 1) => {
    setPreviewIndex((current) => {
      const nextIndex = Math.min(Math.max(current + direction, 0), songs.length - 1);
      setActiveSongId(songs[nextIndex].id);
      return nextIndex;
    });
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="editor-panel">
          <a className="score-home-link" href="./index.html">
            <ArrowLeft size={18} aria-hidden="true" />
            메인으로
          </a>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Score Conti</span>
              <h1>악보 콘티 작성</h1>
            </div>
            <label className="field heading-date">
              <span>날짜</span>
              <input
                type="date"
                value={activeSong.date}
                onChange={(event) => updateActiveSong({ date: event.target.value })}
              />
            </label>
          </div>

          <section className="control-section" aria-labelledby="song-list-title">
            <div className="section-title-row">
              <h2 id="song-list-title">곡 페이지</h2>
              <button type="button" className="small-button" onClick={addSong}>
                곡 추가
              </button>
            </div>

            <div className="song-tabs">
              {songs.map((song, index) => (
                <button
                  type="button"
                  key={song.id}
                  className={`song-tab ${song.id === activeSong.id ? "is-active" : ""}`}
                  onClick={() => selectSong(song.id, index)}
                >
                  {song.title || `${index + 1}번 곡`}
                </button>
              ))}
            </div>

            {songs.length > 1 ? (
              <button
                type="button"
                className="danger-button"
                onClick={() => removeSong(activeSong.id)}
              >
                현재 곡 삭제
              </button>
            ) : null}
          </section>

          <SongInfoForm
            title={activeSong.title}
            songKey={activeSong.key}
            referenceUrl={activeSong.referenceUrl}
            onChange={updateActiveSong}
          />

          <ImageUploader
            key={`${activeSong.id}-first`}
            title={activeSong.secondSheet ? "기본 악보 이미지" : "악보 이미지"}
            imageUrl={activeSong.sheetImageUrl}
            imageAdjust={activeSong.sheetImageAdjust}
            onImageChange={(sheetImageUrl) =>
              updateActiveSong({
                sheetImageUrl,
                sheetImageAdjust: DEFAULT_SHEET_IMAGE_ADJUST,
              })
            }
            onImageAdjustChange={(sheetImageAdjust) =>
              updateActiveSong({ sheetImageAdjust })
            }
          />

          {activeSong.secondSheet ? (
            <ImageUploader
              key={`${activeSong.id}-second`}
              title="키업 악보 이미지"
              imageUrl={activeSong.secondSheet.imageUrl}
              imageAdjust={activeSong.secondSheet.imageAdjust}
              onRemove={() => updateActiveSong({ secondSheet: null })}
              onImageChange={(imageUrl) => updateSecondSheet({
                imageUrl,
                imageAdjust: DEFAULT_SHEET_IMAGE_ADJUST,
              })}
              onImageAdjustChange={(imageAdjust) => updateSecondSheet({ imageAdjust })}
            >
              <label className="field">
                <span>키업 후 조성</span>
                <input
                  value={activeSong.secondSheet.key}
                  placeholder="예: A"
                  onChange={(event) => updateSecondSheet({ key: event.target.value })}
                />
              </label>
              <p className="field-help">키업 악보를 올리면 기본 악보와 같은 A4 페이지에 표시됩니다.</p>
            </ImageUploader>
          ) : (
            <button
              type="button"
              className="small-button"
              onClick={() => updateActiveSong({ secondSheet: {
                key: "",
                imageUrl: "",
                imageAdjust: DEFAULT_SHEET_IMAGE_ADJUST,
              } })}
            >
              + 키업 악보 추가 (같은 페이지)
            </button>
          )}

          <SectionToggleList
            sections={SECTION_OPTIONS}
            songSections={activeSong.sections}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onRequestChange={updateSectionRequest}
          />
        </div>

        <div className="preview-column">
          <ExportBar
            disabled={!hasPreviewContent}
            songCount={songs.length}
            currentPage={previewIndex + 1}
            canGoPrev={previewIndex > 0}
            canGoNext={previewIndex < songs.length - 1}
            onPrev={() => movePreview(-1)}
            onNext={() => movePreview(1)}
            onExport={handleExportPdf}
          />

          <div className="screen-preview">
            <A4Preview
              song={previewSong}
              sections={SECTION_OPTIONS}
              pageNumber={previewIndex + 1}
            />
          </div>

          <div className="print-pages" aria-hidden="true">
            {songs.map((song, index) => (
              <A4Preview
                key={song.id}
                song={song}
                sections={SECTION_OPTIONS}
                pageNumber={index + 1}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
