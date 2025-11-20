/* Utility: reduced motion detection */
function isReduced() {
  const ui = document.documentElement.getAttribute("data-reduce-motion");
  if (ui === "on") return true;
  if (ui === "off") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  fetch("./data/menu.json")
    .then((r) => r.json())
    .then((data) => {
      // UPDATED: access the array inside the 'items' key
      const menu = data.items;
      
      renderSections(menu);
      renderFilterControls(menu);
      setupRevealObserver();
      setupSectionParallax();
      setupSurpriseButton();
      if (location.hash) focusSectionHeading(location.hash.slice(1));
    })
    .catch((err) => console.error("Failed to load menu.json", err));
});

/* Render menu sections */
function renderSections(menu) {
  const lists = document.querySelectorAll(".cards[data-section]");
  const itemsBySection = groupBy(menu, (d) => d.section);

  lists.forEach((ul) => {
    const sectionName = ul.getAttribute("data-section");
    const items = itemsBySection[sectionName] || [];
    items.forEach((item, idx) => ul.appendChild(cardNode(item, idx)));
  });
}
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

/* Card node */
function cardNode(item, idx) {
  const li = document.createElement("li");
  li.className = "card will-reveal";
  if (item.spirit) li.dataset.spirit = item.spirit;

  const details = document.createElement("details");
  details.className = "card__exp";

  const summary = document.createElement("summary");
  summary.className = "card__summary";

  const h3 = document.createElement("h3");
  h3.className = "card__name";
  h3.textContent = item.name;
  const widths = [36, 28, 24, 32];
  h3.style.setProperty("--uW", widths[idx % widths.length] + "%");

  const caret = document.createElement("span");
  caret.className = "card__caret";
  caret.setAttribute("aria-hidden", "true");

  summary.appendChild(h3);
  summary.appendChild(caret);

  const body = document.createElement("div");
  body.className = "card__body";
  const p = document.createElement("p");
  p.className = "card__ing";
  p.textContent = item.ingredients;
  body.appendChild(p);

  details.appendChild(summary);
  details.appendChild(body);
  li.appendChild(details);

  // Accordion behavior
  summary.addEventListener("click", () => {
    if (!details.open) {
      const siblings =
        li.parentElement?.querySelectorAll("details.card__exp[open]") || [];
      siblings.forEach((d) => {
        if (d !== details) d.removeAttribute("open");
      });
    }
  });

  return li;
}

/* Filter dropdown */
function renderFilterControls(menu) {
  const select = document.getElementById("spirit-filter");
  if (!select) return;
  const spirits = ["All", ...new Set(menu.map((i) => i.spirit).filter(Boolean))];
  spirits.forEach((spirit) => {
    const opt = document.createElement("option");
    opt.value = spirit;
    opt.textContent = spirit;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => filterCardsBySpirit(select.value));
}
function filterCardsBySpirit(spirit) {
  const allCards = document.querySelectorAll(".card");
  const sections = document.querySelectorAll(".section");
  allCards.forEach((card) => {
    const show = spirit === "All" || card.dataset.spirit === spirit;
    card.classList.toggle("is-hidden", !show);
  });
  sections.forEach((section) => {
    const visible = section.querySelectorAll(".card:not(.is-hidden)");
    section.classList.toggle("is-empty", visible.length === 0);
  });
}

/* Reveal observer */
function setupRevealObserver() {
  const cards = document.querySelectorAll(".will-reveal");
  if (isReduced()) {
    cards.forEach((el) => el.classList.add("revealed"));
    document.querySelectorAll(".section").forEach((s) => s.classList.add("inview"));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach((el) => io.observe(el));

  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("inview"); });
  }, { threshold: 0.4 });
  document.querySelectorAll(".section").forEach((s) => so.observe(s));
}

/* Anchor focus */
function focusSectionHeading(sectionId) {
  const h = document.querySelector(`#${CSS.escape(sectionId)} .section__title`);
  if (!h) return;
  h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
  setTimeout(() => h.removeAttribute("tabindex"), 500);
}

/* Parallax drift */
function setupSectionParallax() {
  if (isReduced()) return;
  const sections = [...document.querySelectorAll(".section")];
  let current = null;
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) current = e.target; });
  }, { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 });
  sections.forEach((s) => watcher.observe(s));

  let ticking = false;
  function onScroll() {
    if (!current || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = current.getBoundingClientRect();
      const yMid = (r.top + r.bottom) / 2;
      const vh = window.innerHeight;
      const norm = (yMid - vh / 2) / (vh / 2);
      const max = 14;
      current.style.setProperty("--bg-shift-y", `${(-norm * max).toFixed(1)}px`);
      current.style.setProperty("--bg-shift-x", `${(norm * max * 0.6).toFixed(1)}px`);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Surprise-me: pick a random visible card, open + highlight it */
function setupSurpriseButton() {
  const btn = document.getElementById("surprise-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // collect visible cards (respect current filter)
    let cards = [...document.querySelectorAll(".card:not(.is-hidden)")];

    // if none visible (e.g., filtered to an empty state), reset to All
    if (cards.length === 0) {
      const select = document.getElementById("spirit-filter");
      if (select) {
        select.value = "All";
        // this calls your existing filter logic
        filterCardsBySpirit("All");
        cards = [...document.querySelectorAll(".card:not(.is-hidden)")];
      }
    }
    if (cards.length === 0) return;

    // pick one at random
    const card = cards[Math.floor(Math.random() * cards.length)];

    // open it
    const details = card.querySelector("details.card__exp");
    if (details && !details.open) details.open = true;

    // scroll into view (center if possible)
    card.scrollIntoView({
      behavior: isReduced() ? "auto" : "smooth",
      block: "center"
    });

    // add brief highlight
    card.classList.remove("surprise-highlight"); // reset if pressed quickly
    // force reflow so animation can retrigger
    void card.offsetWidth;
    card.classList.add("surprise-highlight");
    setTimeout(() => card.classList.remove("surprise-highlight"), 1600);
  });
}