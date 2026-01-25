const groups = [];

function addGroup() {
  groups.push({ folder: "Carpeta", links: [] });
  render();

  setTimeout(() => {
    const cards = document.querySelectorAll(".music-card");
    cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth" });
  }, 50);
}

function removeGroup(index) {
  if (!confirm("¿Eliminar esta carpeta y todos sus links?")) return;
  groups.splice(index, 1);
  render();
}

function addLink(index) {
  const input = document.getElementById(`link-${index}`);
  const value = input.value.trim();

  if (!value) {
    alert("Link vacío");
    return;
  }

  groups[index].links.push(value);
  input.value = "";
  render();
}

function removeLink(groupIndex, linkIndex) {
  groups[groupIndex].links.splice(linkIndex, 1);
  render();
}

function render() {
  if (groups.length === 0) {
    groups.push({ folder: "Carpeta", links: [] });
  }

  const container = document.getElementById("groups");
  container.innerHTML = "";

  const showDeleteFolder = groups.length > 1;

  groups.forEach((group, i) => {
    container.innerHTML += `
      <div class="card mb-4 shadow-sm music-card position-relative">

        ${
          showDeleteFolder
            ? `
              <button
                class="btn btn-danger rounded-circle folder-delete-btn"
                onclick="removeGroup(${i})"
                title="Eliminar carpeta"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            `
            : ""
        }

        <div class="card-body">

          <div class="row mb-3">
            <div class="col-12 col-md-6">
              <input
                class="form-control"
                placeholder="Nombre de la carpeta"
                value="${group.folder}"
                onchange="groups[${i}].folder = this.value"
              />
            </div>
          </div>

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
            ${group.links.map((link, j) => `
              <li class="list-group-item d-flex align-items-center gap-2">
                <span class="flex-fill small text-break">${link}</span>
                <button
                  class="btn btn-danger btn-sm"
                  onclick="removeLink(${i}, ${j})"
                  title="Eliminar link"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </li>
            `).join("")}
          </ul>

        </div>
      </div>
    `;
  });
}

function download() {
  fetch("/music/download/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({ groups })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "music.zip";
      a.click();
    })
    .catch(() => alert("Error al descargar"));
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name))
    ?.split("=")[1];
}

render();