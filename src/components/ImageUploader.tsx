import { ImageUp, RotateCcw, X } from "lucide-react";
import { useId, type ChangeEvent, type ReactNode } from "react";
import { DEFAULT_SHEET_IMAGE_ADJUST } from "../constants";
import type { SheetImageAdjust } from "../types";

type ImageUploaderProps = {
  title?: string;
  children?: ReactNode;
  onRemove?: () => void;
  imageUrl: string;
  imageAdjust: SheetImageAdjust;
  onImageChange: (imageUrl: string) => void;
  onImageAdjustChange: (imageAdjust: SheetImageAdjust) => void;
};

export function ImageUploader({
  title = "악보 이미지",
  children,
  onRemove,
  imageUrl,
  imageAdjust,
  onImageChange,
  onImageAdjustChange,
}: ImageUploaderProps) {
  const headingId = useId();
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(String(reader.result));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const updateAdjust = (key: keyof SheetImageAdjust, value: number) => {
    onImageAdjustChange({
      ...imageAdjust,
      [key]: value,
    });
  };

  const resetAdjust = () => {
    onImageAdjustChange(DEFAULT_SHEET_IMAGE_ADJUST);
  };

  return (
    <section className="control-section" aria-labelledby={headingId}>
      <div className="section-title-row">
        <h2 id={headingId}>{title}</h2>
        {imageUrl || onRemove ? (
          <button
            type="button"
            className="icon-button"
            onClick={onRemove ?? (() => onImageChange(""))}
            aria-label={`${title} 삭제`}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {children}

      <label className={`upload-box${imageUrl ? " upload-box-compact" : ""}`}>
        <ImageUp size={22} />
        <span>{imageUrl ? "다른 이미지 선택" : "이미지 업로드"}</span>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      {imageUrl ? (
        <div className="image-upload-layout">
          <div className="uploaded-thumb">
            <img src={imageUrl} alt="업로드한 악보 미리보기" />
          </div>

          <div className="image-adjust-panel" aria-label="악보 크기 및 위치 조절">
            <div className="section-title-row adjust-title-row">
              <strong>악보 조절</strong>
              <button
                type="button"
                className="icon-button"
                onClick={resetAdjust}
                aria-label="악보 조절 초기화"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <label className="range-field">
              <span>크기 {imageAdjust.scale}%</span>
              <input
                type="range"
                min="60"
                max="180"
                value={imageAdjust.scale}
                onChange={(event) => updateAdjust("scale", Number(event.target.value))}
              />
            </label>

            <label className="range-field">
              <span>상하 이동 {imageAdjust.offsetY}%</span>
              <input
                type="range"
                min="-40"
                max="40"
                value={imageAdjust.offsetY}
                onChange={(event) =>
                  updateAdjust("offsetY", Number(event.target.value))
                }
              />
            </label>

            <div className="crop-grid">
              <label className="range-field">
                <span>위 삭제 {imageAdjust.cropTop}%</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={imageAdjust.cropTop}
                  onChange={(event) =>
                    updateAdjust("cropTop", Number(event.target.value))
                  }
                />
              </label>

              <label className="range-field">
                <span>아래 삭제 {imageAdjust.cropBottom}%</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={imageAdjust.cropBottom}
                  onChange={(event) =>
                    updateAdjust("cropBottom", Number(event.target.value))
                  }
                />
              </label>

              <label className="range-field">
                <span>왼쪽 삭제 {imageAdjust.cropLeft}%</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={imageAdjust.cropLeft}
                  onChange={(event) =>
                    updateAdjust("cropLeft", Number(event.target.value))
                  }
                />
              </label>

              <label className="range-field">
                <span>오른쪽 삭제 {imageAdjust.cropRight}%</span>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={imageAdjust.cropRight}
                  onChange={(event) =>
                    updateAdjust("cropRight", Number(event.target.value))
                  }
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
