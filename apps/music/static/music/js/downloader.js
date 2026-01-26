const groups = [];

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

function render() {
  if (groups.length === 0) {
    groups.push({ folder: "Carpeta", links: [], collapsed: false });
  }

  const container = document.getElementById("groups");
  container.innerHTML = "";

  const showDeleteFolder = groups.length > 1;

  groups.forEach((group, i) => {
    container.innerHTML += `
      <div class="card mb-4 shadow-sm music-card">

        <!-- HEADER -->
        <div class="folder-header" onclick="toggleGroup(${i})">
          <span class="folder-title">${group.folder || "Carpeta"}</span>

          ${
            showDeleteFolder
              ? `
              <button
                class="btn btn-danger btn-sm"
                onclick="event.stopPropagation(); removeGroup(${i})"
              >
                <i class="bi bi-trash-fill"></i>
              </button>
            `
              : ""
          }
        </div>

        <!-- BODY -->
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

render();