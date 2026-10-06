import { projects, weeks, projectTypes } from "./projects.js";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

export const galleryMarkup = `
  <div class="work-toolbar">
    <div class="work-views" role="group" aria-label="Browse student work">
      <button type="button" data-view="students" aria-pressed="true">Student sites</button>
      <button type="button" data-view="projects" aria-pressed="false">Projects</button>
    </div>
    <div class="gallery-filters" hidden>
      <div class="week-control">
        <select id="week-filter" aria-label="Filter by week">
          <option value="all">All weeks</option>
          ${weeks.map(({ number, title }) => `<option value="${number}">Week ${number} — ${escapeHtml(title)}</option>`).join("")}
        </select>
      </div>
    </div>
  </div>
  <div class="project-gallery" hidden>
    <div class="gallery-heading">
      <h2 id="gallery-title">All projects</h2>
      <p class="gallery-count" role="status" aria-live="polite"></p>
    </div>
    <ul class="project-grid" aria-labelledby="gallery-title"></ul>
  </div>
`;

export function initGallery(students) {
  const gallery = document.querySelector(".project-gallery");
  const grid = document.querySelector(".project-grid");
  const title = document.querySelector("#gallery-title");
  const count = document.querySelector(".gallery-count");
  const directory = document.querySelector(".student-list");
  const filter = document.querySelector("#week-filter");
  const viewButtons = [...document.querySelectorAll("[data-view]")];
  const studentByName = new Map(students.map((student) => [student.name, student]));
  let view = "students";
  let selectedWeek = "all";

  const render = () => {
    const showProjects = view === "projects";
    gallery.hidden = !showProjects;
    directory.hidden = showProjects;
    document.querySelector(".gallery-filters").hidden = !showProjects;
    document.querySelector(".site-preview").classList.remove("is-visible");
    viewButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
    filter.value = selectedWeek;
    if (!showProjects) return;

    const week = weeks.find(({ number }) => String(number) === selectedWeek);
    const visibleProjects = projects.filter((project) => selectedWeek === "all" || String(project.week) === selectedWeek);
    const showTypes = new Set(visibleProjects.map(({ type }) => type)).size > 1;
    title.textContent = week ? `Week ${week.number} - ${week.title}` : "All projects";
    const studentCount = new Set(visibleProjects.map(({ student }) => student)).size;
    count.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"} · ${studentCount} ${studentCount === 1 ? "student" : "students"}`;
    grid.innerHTML = visibleProjects.map((project, index) => {
      const student = studentByName.get(project.student);
      const url = new URL(project.path, student.url).href;
      return `
        <li class="project-card">
          <a class="project-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(project.title)} by ${escapeHtml(student.name)} (new tab)">
            <div class="project-image">
              <span class="preview-fallback">Preview unavailable<span>Open project ↗</span></span>
              <img src="${escapeHtml(project.preview)}" alt="" width="1440" height="900" loading="${index < 3 ? "eager" : "lazy"}" decoding="async" />
              <span class="project-open" aria-hidden="true">Open project ↗</span>
            </div>
            <div class="project-caption">
              <span class="project-student">${escapeHtml(student.name)}</span>
              <span class="project-week">Week ${project.week}</span>
              <h3>${escapeHtml(project.title)}</h3>
              ${showTypes ? `<span class="project-type">${escapeHtml(projectTypes.find(({ id }) => id === project.type).title)}</span>` : ""}
            </div>
          </a>
        </li>`;
    }).join("");
    if (!visibleProjects.length) {
      grid.innerHTML = `<li class="gallery-empty">No project links for this week yet. Choose another week or browse the student sites.</li>`;
    }
    grid.querySelectorAll("img").forEach((image) => image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".project-image").classList.add("has-missing-preview");
    }, { once: true }));
  };

  const readLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");
    // Keep shared week links opening their gallery, while the homepage defaults to the directory.
    view = requestedView === "students" ? "students"
      : requestedView === "projects" || params.has("week") || params.has("type") ? "projects" : "students";
    const requestedWeek = params.get("week");
    selectedWeek = weeks.some(({ number }) => String(number) === requestedWeek) ? requestedWeek : "all";
    render();
  };

  const updateLocation = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    if (selectedWeek === "all") url.searchParams.delete("week");
    else url.searchParams.set("week", selectedWeek);
    url.searchParams.delete("type");
    window.history.pushState(null, "", url);
    render();
  };

  viewButtons.forEach((button) => button.addEventListener("click", () => {
    if (view === button.dataset.view) return;
    view = button.dataset.view;
    updateLocation();
  }));
  filter.addEventListener("change", () => {
    selectedWeek = filter.value;
    updateLocation();
  });
  window.addEventListener("popstate", readLocation);
  readLocation();
}
