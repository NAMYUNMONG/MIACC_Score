export type SectionId =
  | "intro"
  | "verse"
  | "pre-chorus"
  | "chorus"
  | "bridge"
  | "interlude"
  | "tag"
  | "outro"
  | "other";

export type SectionOption = {
  id: SectionId;
  label: string;
};

export type SongSection = {
  instanceId: string;
  sectionId: SectionId;
  request: string;
};

export type SheetImageAdjust = {
  scale: number;
  offsetY: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
  cropLeft: number;
};

export type SongConti = {
  id: string;
  date: string;
  title: string;
  key: string;
  referenceUrl: string;
  sheetImageUrl: string;
  sheetImageAdjust: SheetImageAdjust;
  secondSheet: {
    key: string;
    imageUrl: string;
    imageAdjust: SheetImageAdjust;
  } | null;
  sections: SongSection[];
};
