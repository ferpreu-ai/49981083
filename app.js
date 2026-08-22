const groupListEl = document.getElementById("groupList");
const groupFilterEl = document.getElementById("groupFilter");
const rangeFilterEl = document.getElementById("rangeFilter");
const searchEl = document.getElementById("search");
const summaryEl = document.getElementById("summary");

const HOY = new Date("2026-08-22T00:00:00");

function parseFecha(fecha) {
  return new Date(`${fecha}T00:00:00`);
}

function formatFecha(fecha) {
  return parseFecha(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function diasDesde(fecha) {
  const ms = HOY - parseFecha(fecha);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function poblarFiltroGrupos() {
  const grupos = [...new Set(REGISTROS.map((r) => r.grupo))].sort();
  for (const grupo of grupos) {
    const opt = document.createElement("option");
    opt.value = grupo;
    opt.textContent = grupo;
    groupFilterEl.appendChild(opt);
  }
}

function aplicarFiltros() {
  const grupoSel = groupFilterEl.value;
  const rango = Number(rangeFilterEl.value);
  const texto = searchEl.value.trim().toLowerCase();

  return REGISTROS.filter((r) => {
    if (grupoSel !== "todos" && r.grupo !== grupoSel) return false;
    if (rango && diasDesde(r.fecha) > rango) return false;
    if (texto && !r.participante.toLowerCase().includes(texto) && !r.estudio.toLowerCase().includes(texto)) {
      return false;
    }
    return true;
  });
}

function agruparPorGrupo(registros) {
  const mapa = new Map();
  for (const r of registros) {
    if (!mapa.has(r.grupo)) mapa.set(r.grupo, []);
    mapa.get(r.grupo).push(r);
  }

  // Ordenar los registros de cada grupo por fecha más reciente primero.
  for (const lista of mapa.values()) {
    lista.sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha));
  }

  // Ordenar los grupos según la fecha más reciente que contienen.
  return [...mapa.entries()].sort((a, b) => {
    const masRecienteA = parseFecha(a[1][0].fecha);
    const masRecienteB = parseFecha(b[1][0].fecha);
    return masRecienteB - masRecienteA;
  });
}

function render() {
  const filtrados = aplicarFiltros();
  const grupos = agruparPorGrupo(filtrados);

  groupListEl.innerHTML = "";

  if (grupos.length === 0) {
    groupListEl.innerHTML = `<div class="empty-state">No hay registros que coincidan con los filtros seleccionados.</div>`;
  } else {
    for (const [grupo, registros] of grupos) {
      const section = document.createElement("section");
      section.className = "group-section";

      const ultimaFecha = formatFecha(registros[0].fecha);

      section.innerHTML = `
        <div class="group-header">
          <div>
            <span class="group-name">${grupo}</span>
            <span class="badge">${registros.length}</span>
          </div>
          <div class="group-meta">Registro más reciente: ${ultimaFecha}</div>
        </div>
        <table class="records">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Participante</th>
              <th>Estudio</th>
            </tr>
          </thead>
          <tbody>
            ${registros
              .map(
                (r, i) => `
              <tr>
                <td class="${i === 0 ? "fecha-reciente" : ""}">${formatFecha(r.fecha)}</td>
                <td>${r.participante}</td>
                <td>${r.estudio}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
      groupListEl.appendChild(section);
    }
  }

  summaryEl.textContent = `${filtrados.length} registro(s) en ${grupos.length} grupo(s) de pertenencia.`;
}

[groupFilterEl, rangeFilterEl, searchEl].forEach((el) =>
  el.addEventListener("input", render)
);

poblarFiltroGrupos();
render();
