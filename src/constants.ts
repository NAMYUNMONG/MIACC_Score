import type { SectionOption, SheetImageAdjust } from "./types";

export const SECTION_OPTIONS: SectionOption[] = [
  { id: "intro", label: "Intro" },
  { id: "verse", label: "Verse" },
  { id: "pre-chorus", label: "Pre-Chorus" },
  { id: "chorus", label: "Chorus" },
  { id: "bridge", label: "Bridge" },
  { id: "interlude", label: "Interlude" },
  { id: "tag", label: "Tag" },
  { id: "outro", label: "Outro" },
  { id: "other", label: "직접입력" },
];

export const DEFAULT_SHEET_IMAGE_ADJUST: SheetImageAdjust = {
  scale: 100,
  offsetY: 0,
  cropTop: 0,
  cropRight: 0,
  cropBottom: 0,
  cropLeft: 0,
};
