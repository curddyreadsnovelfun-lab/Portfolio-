const THEME_KEY = "portfolio-theme";
const PROJECTS_URL = "./projects.json";
const CONTACT_EMAIL = "curddyjericestrada@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const state = { items: [], query: "", category: "All" };

/* Theme */
function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (error) { /* storage blocked */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById("themeToggle");
  if (!button) return;
  const isDark = theme === "dark";
  button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  button.querySelector("span").textContent = isDark ? "☀" : "☾";
}

applyTheme(getPreferredTheme()); // runs before first paint

function initTheme() {
  applyTheme(document.documentElement.dataset.theme);
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* ignore */ }
  });
}

/* Mobile menu */
function initNavigation() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* Project data */
function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toWebUrl(value) {
  const text = cleanText(value);
  if (!text) return "";
  try {
    const url = new URL(text, window.location.href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function normalizeProject(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = cleanText(raw.title);
  if (!title) return null; // title required
  return {
    title,
    url: toWebUrl(raw.url),
    description: cleanText(raw.description) || "No description yet.",
    technologies: Array.isArray(raw.technologies) ? raw.technologies.map(cleanText).filter(Boolean) : [],
    status: cleanText(raw.status),
    category: cleanText(raw.category) || "Other",
    image: toWebUrl(raw.image)
  };
}

/* Card building */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function createMedia(project) {
  const media = el("div", "card-media");
  const showFallback = () => {
    media.textContent = "";
    const fallback = el("div", "card-fallback", project.title.charAt(0).toUpperCase());
    fallback.setAttribute("aria-hidden", "true");
    media.append(fallback);
  };
  if (!project.image) {
    showFallback();
    return media;
  }
  const image = el("img");
  image.alt = "Screenshot of " + project.title;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", showFallback);
  image.src = project.image;
  media.append(image);
  return media;
}

function createCard(project, index) {
  const card = el("article", "card");
  const detailsId = "project-details-" + index;

  const head = el("div", "card-head");
  head.append(el("h3", "card-title", project.title));
  if (project.status) head.append(el("span", "badge", project.status));

  const details = el("div", "card-details");
  details.id = detailsId;
  details.append(el("p", "", project.description), el("p", "card-category", project.category));
  if (project.technologies.length) {
    const tags = el("ul", "tags");
    project.technologies.forEach((tech) => tags.append(el("li", "", tech)));
    details.append(tags);
  }

  const actions = el("div", "card-actions");
  const toggle = el("button", "btn btn-secondary details-btn", "Details");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Details: " + project.title);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", detailsId);
  toggle.addEventListener("click", () => {
    const isOpen = card.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  actions.append(toggle);

  if (project.url) {
    const link = el("a", "btn btn-primary", "Open project");
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Open project: " + project.title + " (opens in a new tab)");
    actions.append(link);
  }

  card.append(head, createMedia(project), details, actions);
  return card;
}

/* Search and filters */
function setStatus(text) {
  document.getElementById("projectStatus").textContent = text;
}

function renderCategoryFilters() {
  const container = document.getElementById("categoryFilters");
  container.textContent = "";
  const categories = ["All", ...new Set(state.items.map((item) => item.project.category))];
  categories.forEach((category) => {
    const chip = el("button", "chip", category);
    chip.type = "button";
    chip.dataset.category = category;
    chip.addEventListener("click", () => {
      state.category = category;
      updateView();
    });
    container.append(chip);
  });
}

function updateView() {
  if (!state.items.length) return;
  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  state.items.forEach(({ project, card }) => {
    const text = [project.title, project.description, project.category, ...project.technologies].join(" ").toLowerCase();
    const inCategory = state.category === "All" || project.category === state.category;
    const matches = inCategory && terms.every((term) => text.includes(term));
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  document.querySelectorAll("#categoryFilters .chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.category === state.category));
  });
  const total = state.items.length;
  setStatus(visibleCount === 0
    ? "No projects match your search. Try other keywords or reset the filters."
    : "Showing " + visibleCount + " of " + total + (total === 1 ? " project." : " projects."));
}

function initSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    state.query = input.value;
    updateView();
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    input.value = "";
    state.query = "";
    state.category = "All";
    updateView();
  });
}

async function loadProjects() {
  const grid = document.getElementById("projectGrid");
  setStatus("Loading projects...");
  try {
    const response = await fetch(PROJECTS_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error("projects.json returned status " + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("projects.json must be a list: [ ... ]");
    const projects = data.map(normalizeProject).filter(Boolean);
    if (projects.length !== data.length) console.warn("Some entries were skipped. Each project needs a title.");
    if (!projects.length) {
      setStatus("No projects to show yet. Check back soon.");
      return;
    }
    state.items = projects.map((project, index) => ({ project, card: createCard(project, index) }));
    state.items.forEach((item) => grid.append(item.card));
    renderCategoryFilters();
    updateView();
  } catch (error) {
    console.error("Could not load projects:", error);
    const hint = window.location.protocol === "file:" ? " Open the site through a local server (see README)." : "";
    setStatus("Projects could not be loaded right now." + hint);
  }
}

/* Contact form */
const FORM_FIELDS = [
  { id: "name", message: "Please enter your name.", isValid: (value) => value.length > 0 },
  { id: "email", message: "Please enter a valid email address.", isValid: (value) => EMAIL_PATTERN.test(value) },
  { id: "message", message: "Please write a message.", isValid: (value) => value.length > 0 }
];

function validateField(field) {
  const input = document.getElementById(field.id);
  const valid = field.isValid(input.value.trim());
  input.setAttribute("aria-invalid", String(!valid));
  document.getElementById(field.id + "Error").textContent = valid ? "" : field.message;
  return valid;
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  FORM_FIELDS.forEach((field) => {
    document.getElementById(field.id).addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = FORM_FIELDS.map(validateField);
    const firstInvalid = results.indexOf(false);
    if (firstInvalid !== -1) {
      status.textContent = "";
      document.getElementById(FORM_FIELDS[firstInvalid].id).focus();
      return;
    }
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const subject = "Portfolio inquiry from " + name;
    const body = "Name: " + name + "\r\nEmail: " + email + "\r\n\r\n" + message;
    window.location.href = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    status.textContent = "Your email app should open with a draft. Nothing has been sent until you press send there.";
  });
}

/* Start */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initSearch();
  initContactForm();
  document.getElementById("year").textContent = new Date().getFullYear();
  loadProjects();
});
