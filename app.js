const defaultSections = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Interlude", "Bridge", "Solo", "Outro"
];

const state = { songs: [] };

const songTitle = document.getElementById("songTitle");
const reference = document.getElementById("reference");
const keyInput = document.getElementById("key");
const songsEl = document.getElementById("songs");
const songTemplate = document.getElementById("songTemplate");

const toKeyLabel = (rawKey) => {
  if (!rawKey) return "";
  return rawKey
    .replace(/major/i, "maj")
    .replace(/minor/i, "min")
    .replace(/\s+/g, " ")
    .trim();
};

const buildSearchQuery = (song) => {
  const chunks = [song.title, song.reference, song.key, "sheet music"];
  return chunks.filter(Boolean).join(" ").trim();
};

function buildCandidates(song, inferredKey = "") {
  const baseQuery = buildSearchQuery({ ...song, key: song.key || inferredKey });
  const keyTag = inferredKey || song.key;
  return [
    {
      label: "Google 이미지 (고해상도 우선)",
      reason: "고해상도 악보를 빠르게 확인하기 좋습니다.",
      keyHint: keyTag || "미확인",
      url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${baseQuery} high resolution`)}`
    },
    {
      label: "IMSLP",
      reason: "클래식/찬송가 계열 악보 아카이브 확인에 유리합니다.",
      keyHint: keyTag || "미확인",
      url: `https://imslp.org/index.php?search=${encodeURIComponent(song.title)}`
    },
    {
      label: "MuseScore",
      reason: "사용자 편곡 및 조성 표기가 명확한 경우가 많습니다.",
      keyHint: keyTag || "미확인",
      url: `https://musescore.com/sheetmusic?text=${encodeURIComponent(baseQuery)}`
    },
    {
      label: "YouTube 레퍼런스",
      reason: "특정 연주자/버전 기반 편곡 방향을 잡기 쉽습니다.",
      keyHint: keyTag || "미확인",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.reference}`)}`
    }
  ];
}

async function inferKeyFromWikipedia(title, ref = "") {
  const query = `${title} ${ref}`.trim();
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

  const searchResponse = await fetch(endpoint);
  const searchJson = await searchResponse.json();
  const topHit = searchJson?.query?.search?.[0];
  if (!topHit?.title) return "";

  const extractEndpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&exintro=true&titles=${encodeURIComponent(topHit.title)}&format=json&origin=*`;
  const extractResponse = await fetch(extractEndpoint);
  const extractJson = await extractResponse.json();
  const page = Object.values(extractJson?.query?.pages || {})[0];
  const extract = page?.extract || "";

  const keyPattern = /key of\s+([A-G](?:\s?[#b])?\s?(?:major|minor))/i;
  const match = extract.match(keyPattern);
  return toKeyLabel(match?.[1] || "");
}

document.getElementById("addSongBtn").addEventListener("click", addSong);
document.getElementById("exportBtn").addEventListener("click", exportPdf);

async function addSong() {
  const title = songTitle.value.trim();
  if (!title) return alert("곡 제목을 입력해 주세요.");

  const song = {
    id: crypto.randomUUID(),
    title,
    reference: reference.value.trim(),
    key: toKeyLabel(keyInput.value.trim()),
    inferredKey: "",
    candidateLinks: [],
    selectedCandidate: "",
    enabledSections: new Set(defaultSections),
    sequence: ["Intro", "Verse", "Chorus", "Outro"],
    request: "",
    sheetDataUrl: ""
  };

  state.songs.push(song);
  songTitle.value = "";
  reference.value = "";
  keyInput.value = "";
  renderSongs();

  if (!song.key) {
    try {
      const inferred = await inferKeyFromWikipedia(song.title, song.reference);
      song.inferredKey = inferred;
      song.candidateLinks = buildCandidates(song, inferred);
    } catch {
      song.candidateLinks = buildCandidates(song, "");
    }
  } else {
    song.candidateLinks = buildCandidates(song, "");
  }

  renderSongs();
}

function renderSongs() {
  songsEl.innerHTML = "";
  state.songs.forEach((song) => {
    const node = songTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".song-title").textContent = song.title;
    node.querySelector(".song-meta").textContent = `레퍼런스: ${song.reference || "-"} | Key: ${song.key || song.inferredKey || "-"}`;

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

    node.querySelector(".sequence-output").textContent = `흐름: ${song.sequence.length ? song.sequence.join(" - ") : "-"}`;

    const req = node.querySelector(".request-text");
    req.value = song.request;
    req.addEventListener("input", (e) => {
      song.request = e.target.value;
    });

    const candidateWrap = node.querySelector(".candidate-links");
    candidateWrap.innerHTML = "";
    const candidates = song.candidateLinks.length ? song.candidateLinks : buildCandidates(song);

    candidates.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "candidate-item";
      row.innerHTML = `
        <div>
          <strong>${item.label}</strong>
          <p>${item.reason} | Key 힌트: ${item.keyHint}</p>
        </div>
      `;

      const right = document.createElement("div");
      right.className = "candidate-actions";

      const openBtn = document.createElement("a");
      openBtn.href = item.url;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      openBtn.textContent = "검색 열기";
      openBtn.className = "link-btn";

      const chooseBtn = document.createElement("button");
      chooseBtn.type = "button";
      chooseBtn.textContent = song.selectedCandidate === item.url ? "선택됨" : "후보 선택";
      chooseBtn.disabled = song.selectedCandidate === item.url;
      chooseBtn.addEventListener("click", () => {
        song.selectedCandidate = item.url;
        renderSongs();
      });

      right.append(openBtn, chooseBtn);
      row.appendChild(right);
      candidateWrap.appendChild(row);

      if (idx === 0 && !song.selectedCandidate) {
        song.selectedCandidate = item.url;
      }
    });

    const selected = node.querySelector(".selected-candidate");
    selected.textContent = `선택된 후보: ${song.selectedCandidate || "-"}`;

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
    doc.text(`Key: ${song.key || song.inferredKey || "-"}`, 15, 32);

    let y = 40;
    if (song.sheetDataUrl) {
      const imgProps = doc.getImageProperties(song.sheetDataUrl);
      const pageWidth = 180;
      const pageHeightLimit = 170;
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

    const sequenceText = song.sequence.length ? song.sequence.join(" - ") : "-";
    doc.setFontSize(11);
    doc.text(`섹션 흐름: ${sequenceText}`, 15, Math.min(y, 255));

    y = Math.min(y + 8, 265);
    const request = `특별 요청사항: ${song.request || "-"}`;
    const wrapped = doc.splitTextToSize(request, 180);
    doc.text(wrapped, 15, y);

    y = Math.min(y + 14, 275);
    const candidateSummary = `선택된 악보 후보 링크: ${song.selectedCandidate || "-"}`;
    const candidateWrapped = doc.splitTextToSize(candidateSummary, 180);
    doc.text(candidateWrapped, 15, y);
  }

  doc.save("conti_output_a4_portrait.pdf");
}
