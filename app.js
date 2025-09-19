/* Utility: reduced motion detection */
function isReduced() {
  const ui = document.documentElement.getAttribute("data-reduce-motion");
  if (ui === "on") return true;
  if (ui === "off") return false;
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // Load data & render
  fetch("./data/menu.json")
    .then((r) => r.json())
    .then((data) => {
      renderSections(data);
      setupRevealObserver();
      setupSectionParallax();
      if (location.hash) focusSectionHeading(location.hash.slice(1));
    })
    .catch((err) => console.error("Failed to load menu.json", err));
});

/* Render menu sections into .cards lists */
function renderSections(menu) {
  const lists = document.querySelectorAll(".cards[data-section]");
  const itemsBySection = groupBy(menu, (d) => d.section);

  lists.forEach((ul) => {
    const sectionName = ul.getAttribute("data-section");
    const items = itemsBySection[sectionName] || [];
    items.forEach((item, idx) => {
      ul.appendChild(cardNode(item, idx));
    });
  });
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

/* Create a card node */
function cardNode(item, idx) {
  const li = document.createElement("li");
  li.className = "card will-reveal";
  li.innerHTML = `
    <h3 class="card__name" data-idx="${idx}">${escapeHTML(item.name)}</h3>
    <p class="card__ing">${escapeHTML(item.ingredients)}</p>
  `;

  // underline width pattern (ensures every card shows one)
  const widths = [36, 28, 24, 32]; // percents, repeats
  const h3 = li.querySelector(".card__name");
  h3.style.setProperty("--uW", widths[idx % widths.length] + "%");

  // entrance stagger
  li.style.transitionDelay = `${Math.min(idx * 60, 240)}ms`;

  return li;
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

/* IntersectionObserver: entrance reveals + section motif fade */
function setupRevealObserver() {
  const cards = document.querySelectorAll(".will-reveal");
  if (isReduced()) {
    cards.forEach((el) => el.classList.add("revealed"));
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("inview"));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((el) => io.observe(el));

  const so = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("inview"); });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".section").forEach((sec) => so.observe(sec));
}

/* Focus section heading after anchor jumps */
function focusSectionHeading(sectionId) {
  const h = document.querySelector(`#${CSS.escape(sectionId)} .section__title`);
  if (!h) return;
  h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
  setTimeout(() => h.removeAttribute("tabindex"), 500);
}

/* Background motif parallax drift */
function setupSectionParallax() {
  if (isReduced()) return;

  const sections = [...document.querySelectorAll(".section")];
  let current = null;
  const watcher = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) current = e.target; });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 }
  );
  sections.forEach((s) => watcher.observe(s));

  let ticking = false;
  function onScroll() {
    if (!current) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = current.getBoundingClientRect();
      const yMid = (r.top + r.bottom) / 2;
      const vh = window.innerHeight;
      const norm = (yMid - vh / 2) / (vh / 2);
      const max = 14; // px
      current.style.setProperty("--bg-shift-y", `${(-norm * max).toFixed(1)}px`);
      current.style.setProperty("--bg-shift-x", `${(norm * (max*0.6)).toFixed(1)}px`);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
