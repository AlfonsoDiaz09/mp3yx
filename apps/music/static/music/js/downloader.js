const groups = [];
let downloadTaskId = null;
let progressInterval = null;

/* ---------------- GROUPS ---------------- */

function addGroup() {
  groups.push({ folder: "Carpeta", links: [], collapsed: false });
  render();

  setTimeout(() => {
    const cards = document.querySelectorAll(".music-card");
    cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth" });
  }, 50);
}

function toggleGroup(index) {
  groups[index].collapsed = !groups[index].collapsed;
  render();
}

function removeGroup(index) {
  if (!confirm("¿Eliminar esta carpeta y todos sus links?")) return;
  groups.splice(index, 1);
  render();
}

function addLink(index) {
  const input = document.getElementById(`link-${index}`);
  const value = input.value.trim();

  if (!value) return alert("Link vacío");

  groups[index].links.push(value);
  input.value = "";
  render();
}

function removeLink(groupIndex, linkIndex) {
  groups[groupIndex].links.splice(linkIndex, 1);
  render();
}

/* ---------------- RENDER ---------------- */

function render() {
  if (groups.length === 0) {
    groups.push({ folder: "Carpeta", links: [], collapsed: false });
  }

  const container = document.getElementById("groups");
  container.innerHTML = "";

  const showDeleteFolder = groups.length > 1;

  groups.forEach((group, i) => {
    container.innerHTML += `
      <div class="card mb-3 shadow-sm music-card">
        <div class="folder-header d-flex align-items-center" onclick="toggleGroup(${i})">
          <div class="folder-toggle d-flex align-items-center justify-content-between flex-fill px-2">
            <span class="folder-title">
              ${group.folder || "Carpeta"}
            </span>

            <i class="bi ${
              group.collapsed ? "bi-chevron-down" : "bi-chevron-up"
            }"></i>
          </div>

          ${
            showDeleteFolder
              ? `
                <button
                  class="btn btn-outline-danger"
                  onclick="removeGroup(${i})"
                  title="Eliminar carpeta"
                >
                  <i class="bi bi-trash"></i>
                </button>
              `
              : ""
          }
        </div>

        <div class="folder-body ${group.collapsed ? "d-none" : ""}">
          <div class="card-body">
            <input
              class="form-control mb-3"
              placeholder="Nombre de la carpeta"
              value="${group.folder}"
              onchange="groups[${i}].folder = this.value"
            />

            <div class="input-group mb-3">
              <input
                id="link-${i}"
                class="form-control"
                placeholder="Pega el link de YouTube"
              />
              <button class="btn btn-outline-secondary" onclick="addLink(${i})">
                <i class="bi bi-plus-circle me-1"></i>
                Agregar
              </button>
            </div>

            <ul class="list-group list-group-flush">
              ${group.links
                .map(
                  (link, j) => `
                <li class="list-group-item d-flex align-items-center gap-2">
                  <span class="flex-fill small text-break">${link}</span>
                  <button
                    class="btn btn-danger btn-sm"
                    onclick="removeLink(${i}, ${j})"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </li>
              `
                )
                .join("")}
            </ul>

          </div>
        </div>
      </div>
    `;
  });
}

/* ---------------- DOWNLOAD ---------------- */

function startDownload() {
  const btn = document.getElementById("downloadBtn");
  btn.disabled = true;
  btn.innerHTML =
    `<span class="spinner-border spinner-border-sm me-2"></span>Descargando...`;

  document.getElementById("download-progress").classList.remove("d-none");

  fetch("/music/download/start/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({ groups })
  })
    .then(res => res.json())
    .then(data => {
      downloadTaskId = data.task_id;
      progressInterval = setInterval(fetchProgress, 1000);
    })
    .catch(resetDownloadUI);
}

function fetchProgress() {
  fetch(`/music/download/progress/?task_id=${downloadTaskId}`)
    .then(res => res.json())
    .then(data => {
      updateProgressUI(data);

      if (data.status === "finished") {
        clearInterval(progressInterval);
        downloadFile();
      }
    });
}

function updateProgressUI(data) {
  const bar = document.getElementById("globalProgress");
  bar.style.width = `${data.overall}%`;
  bar.innerText = `${data.overall}%`;

  const list = document.getElementById("folderProgressList");
  list.innerHTML = "";

  data.folders.forEach(folder => {
    list.innerHTML += `
      <div class="mb-2">
        <small class="fw-semibold">${folder.name}</small>
        <div class="progress">
          <div class="progress-bar bg-info" style="width:${folder.progress}%"></div>
        </div>
      </div>
    `;
  });
}

function downloadFile() {
  fetch(`/music/download/file/?task_id=${downloadTaskId}`)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "music.zip";
      a.click();
      resetDownloadUI();
    });
}

function resetDownloadUI() {
  clearInterval(progressInterval);

  const btn = document.getElementById("downloadBtn");
  btn.disabled = false;
  btn.innerHTML =
    `<i class="bi bi-download me-2"></i>Descargar MP3`;

  document.getElementById("download-progress").classList.add("d-none");
}

/* ---------------- HELPERS ---------------- */

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name))
    ?.split("=")[1];
}

render();