const defaultSections = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Interlude", "Bridge", "Solo", "Outro"
];

const state = { songs: [] };

const songTitle = document.getElementById("songTitle");
const reference = document.getElementById("reference");
const keyInput = document.getElementById("key");
const songsEl = document.getElementById("songs");
const songTemplate = document.getElementById("songTemplate");

document.getElementById("addSongBtn").addEventListener("click", addSong);
document.getElementById("exportBtn").addEventListener("click", exportPdf);

function addSong() {
  const title = songTitle.value.trim();
  if (!title) return alert("곡 제목을 입력해 주세요.");

  state.songs.push({
    id: crypto.randomUUID(),
    title,
    reference: reference.value.trim(),
    key: keyInput.value.trim(),
    enabledSections: new Set(defaultSections),
    sequence: ["Intro", "Verse", "Chorus", "Outro"],
    request: "",
    sheetDataUrl: ""
  });

  songTitle.value = "";
  reference.value = "";
  keyInput.value = "";
  renderSongs();
}

function renderSongs() {
  songsEl.innerHTML = "";
  state.songs.forEach((song) => {
    const node = songTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".song-title").textContent = song.title;
    node.querySelector(".song-meta").textContent = `레퍼런스: ${song.reference || "-"} | Key: ${song.key || "-"}`;

    const removeBtn = node.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      state.songs = state.songs.filter((s) => s.id !== song.id);
      renderSongs();
    });

    const chips = node.querySelector(".chips");
    const picker = node.querySelector(".section-picker");
    defaultSections.forEach((section) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = section;
      chip.className = `chip ${song.enabledSections.has(section) ? "active" : ""}`;
      chip.addEventListener("click", () => {
        if (song.enabledSections.has(section)) {
          song.enabledSections.delete(section);
          song.sequence = song.sequence.filter((s) => s !== section);
        } else {
          song.enabledSections.add(section);
        }
        renderSongs();
      });
      chips.appendChild(chip);

      const opt = document.createElement("option");
      opt.value = section;
      opt.textContent = section;
      opt.disabled = !song.enabledSections.has(section);
      picker.appendChild(opt);
    });

    node.querySelector(".add-sequence").addEventListener("click", () => {
      const value = picker.value;
      if (!song.enabledSections.has(value)) return;
      song.sequence.push(value);
      renderSongs();
    });

    node.querySelector(".clear-sequence").addEventListener("click", () => {
      song.sequence = [];
      renderSongs();
    });

    node.querySelector(".sequence-output").textContent =
      `흐름: ${song.sequence.length ? song.sequence.join(" - ") : "-"}`;

    const req = node.querySelector(".request-text");
    req.value = song.request;
    req.addEventListener("input", (e) => {
      song.request = e.target.value;
    });

    const sheetInput = node.querySelector(".sheet-input");
    const preview = node.querySelector(".sheet-preview");
    if (song.sheetDataUrl) {
      preview.src = song.sheetDataUrl;
      preview.style.display = "block";
    }

    sheetInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        song.sheetDataUrl = reader.result;
        renderSongs();
      };
      reader.readAsDataURL(file);
    });

    songsEl.appendChild(node);
  });
}

async function exportPdf() {
  if (!state.songs.length) return alert("추가된 곡이 없습니다.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  for (let i = 0; i < state.songs.length; i += 1) {
    const song = state.songs[i];
    if (i > 0) doc.addPage("a4", "p");

    doc.setFontSize(18);
    doc.text(song.title, 15, 18);
    doc.setFontSize(11);
    doc.text(`Reference: ${song.reference || "-"}`, 15, 26);
    doc.text(`Key: ${song.key || "-"}`, 15, 32);

    const sequenceText = song.sequence.length ? song.sequence.join(" - ") : "-";

    let y = 40;
    if (song.sheetDataUrl) {
      const imgProps = doc.getImageProperties(song.sheetDataUrl);
      const pageWidth = 180;
      const pageHeightLimit = 200;
      const ratio = Math.min(pageWidth / imgProps.width, pageHeightLimit / imgProps.height);
      const w = imgProps.width * ratio;
      const h = imgProps.height * ratio;
      doc.addImage(song.sheetDataUrl, "JPEG", 15, y, w, h);
      y += h + 8;
    } else {
      doc.setFontSize(10);
      doc.text("(악보 이미지 미첨부)", 15, y);
      y += 8;
    }

    if (y > 265) y = 265;
    doc.setFontSize(11);
    doc.text(`섹션 흐름: ${sequenceText}`, 15, y);

    y += 10;
    doc.setFontSize(11);
    const request = `특별 요청사항: ${song.request || "-"}`;
    const wrapped = doc.splitTextToSize(request, 180);
    doc.text(wrapped, 15, y);
  }

  doc.save("conti_output_a4_portrait.pdf");
}
