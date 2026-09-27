"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const closeMobileMenu = initMobileMenu();

  initTheme(closeMobileMenu);
  initHeader();
  initProjectFilters();
  initProjectModal();
  initDesignSystemTabs();
  initContactForm();
  initBackToTop();
  initScrollSpy();
});

function initMobileMenu() {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  function closeMenu({ returnFocus = false } = {}) {
    if (!menuButton || !mobileMenu) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú de navegación");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
    header?.classList.remove("has-open-menu");

    if (returnFocus) menuButton.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) return;

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú de navegación");
    mobileMenu.hidden = false;
    document.body.classList.add("menu-open");
    header?.classList.add("has-open-menu");
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    const isOpen = menuButton?.getAttribute("aria-expanded") === "true";

    if (
      isOpen &&
      event.target instanceof Node &&
      !mobileMenu?.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      closeMenu({ returnFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeMenu();
  });

  return closeMenu;
}

function initTheme(closeMobileMenu) {
  const storageKey = "wilmer-portfolio-theme";
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const themeText = document.querySelector("[data-theme-text]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // El sitio continúa funcionando si el navegador bloquea localStorage.
    }
  }

  function applyTheme(theme, persist = false) {
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    themeButtons.forEach((button) => {
      const label = isDark ? "Activar modo claro" : "Activar modo oscuro";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });

    if (themeText) themeText.textContent = isDark ? "Modo claro" : "Modo oscuro";
    if (themeColor) themeColor.setAttribute("content", isDark ? "#0f172a" : "#ffffff");
    if (persist) saveTheme(theme);
  }

  const savedTheme = getSavedTheme();
  const initialTheme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : systemTheme.matches
      ? "dark"
      : "light";

  applyTheme(initialTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(nextTheme, true);

      if (button.closest("[data-mobile-menu]")) closeMobileMenu();
    });
  });

  systemTheme.addEventListener("change", (event) => {
    if (!getSavedTheme()) applyTheme(event.matches ? "dark" : "light");
  });
}

function initHeader() {
  const header = document.querySelector("[data-header]");

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initProjectFilters() {
  const filterButtons = document.querySelectorAll("[data-project-filter]");
  const projectCards = document.querySelectorAll("[data-project-card]");
  const filterStatus = document.querySelector("[data-filter-status]");

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.projectFilter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const categories = card.dataset.category?.split(" ") ?? [];
        const shouldShow = selectedCategory === "all" || categories.includes(selectedCategory);
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      if (filterStatus) {
        const filterName = button.textContent?.trim() ?? "seleccionado";
        const noun = visibleCount === 1 ? "proyecto visible" : "proyectos visibles";
        filterStatus.textContent = `${visibleCount} ${noun} para el filtro ${filterName}.`;
      }
    });
  });
}

function initProjectModal() {
  const projects = {
    afu: {
      title: "Sistema de Gestión Comercial AFU",
      subtitle: "Plataforma de gestión comercial",
      category: "Web",
      description: "Plataforma web diseñada para centralizar la gestión de interesados, ventas, seguimiento comercial, pagos y análisis de resultados.",
      problem: "La información comercial requería una forma centralizada de registrar y consultar interesados, ventas, pagos y resultados.",
      solution: "Se desarrolló una plataforma que integra gestión de interesados, registro de ventas, reportes, auditoría, sincronización y configuración dentro de una misma interfaz.",
      technologies: ["TypeScript", "JavaScript", "Supabase", "PL/pgSQL", "Vite"],
      featuresTitle: "Funcionalidades",
      features: [
        "Gestión centralizada de interesados y seguimiento comercial.",
        "Registro de ventas y pagos.",
        "Reportes, auditoría, sincronización y configuración."
      ],
      link: "https://ventasafu.vercel.app/",
      linkLabel: "Ver proyecto ↗",
      image: "assets/images/projects/Sistema-ventas-afu.png",
      imageAlt: "Vista ampliada del dashboard del Sistema de Gestión Comercial AFU"
    },
    smartrecipe: {
      title: "SmartRecipe",
      subtitle: "Recetario inteligente con reconocimiento de ingredientes",
      category: "Web · Inteligencia artificial",
      description: "Aplicación orientada al reconocimiento de ingredientes mediante imágenes para posteriormente sugerir recetas utilizando los alimentos identificados.",
      problem: "Determinar qué preparar con los ingredientes disponibles puede requerir tiempo y planificación.",
      solution: "El sistema permite capturar o cargar una imagen, identificar ingredientes y utilizar los resultados para facilitar la búsqueda de recetas.",
      technologies: ["Python", "Django", "HTML5", "CSS3", "JavaScript", "OpenCV", "YOLOv8 / Ultralytics", "PostgreSQL"],
      featuresTitle: "Funcionalidades",
      features: [
        "Captura o carga de imágenes.",
        "Reconocimiento de ingredientes mediante Computer Vision.",
        "Uso de los ingredientes identificados para facilitar la búsqueda de recetas."
      ],
      link: "https://github.com/Wilmer-Espinoza/RECETAI",
      linkLabel: "Ver repositorio ↗",
      video: "assets/Rectai..mp4",
      poster: "assets/images/projects/smartrecipe-poster.jpg",
      videoLabel: "Demostración en video de SmartRecipe"
    },
    "academic-insights": {
      title: "AFU Academic Insights",
      subtitle: "Analítica de permanencia, desempeño y resultados académicos",
      category: "Datos · Académico",
      description: "Sistema de análisis de datos orientado al seguimiento del rendimiento académico, permanencia estudiantil, desempeño docente y resultados obtenidos durante procesos de formación.",
      problem: "El seguimiento de permanencia, compromiso, rendimiento, desempeño docente y resultados de admisión requiere organizar la información académica de forma clara.",
      solution: "El sistema estructura indicadores y visualizaciones para facilitar la interpretación de resultados y apoyar la toma de decisiones mediante datos.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Excel", "Business Intelligence", "KPIs", "Análisis de datos"],
      featuresTitle: "Métricas analizadas",
      features: [
        "Permanencia: continuidad de estudiantes dentro de su proceso formativo.",
        "Compromiso académico: participación, continuidad y constancia durante el curso.",
        "Rendimiento académico: calificaciones y resultados obtenidos por estudiantes.",
        "Desempeño docente: puntuaciones e indicadores obtenidos durante los cursos.",
        "Resultados de admisión: estudiantes que posteriormente obtuvieron cupos en la Universidad Estatal de Milagro."
      ],
      link: "https://github.com/Wilmer-Espinoza/AFU-Academic-Insights",
      linkLabel: "Ver repositorio ↗",
      image: "assets/images/projects/academic-insights.png",
      imageAlt: "Vista ampliada del dashboard de analítica de admisión de AFU Academic Insights"
    }
  };

  const modal = document.querySelector("[data-project-modal]");
  const detailButtons = document.querySelectorAll("[data-project-details]");

  if (!modal || !detailButtons.length) return;

  const closeButton = modal.querySelector("[data-modal-close]");
  const fields = {
    category: modal.querySelector("[data-modal-category]"),
    title: modal.querySelector("[data-modal-title]"),
    subtitle: modal.querySelector("[data-modal-subtitle]"),
    description: modal.querySelector("[data-modal-description]"),
    problem: modal.querySelector("[data-modal-problem]"),
    solution: modal.querySelector("[data-modal-solution]"),
    technologies: modal.querySelector("[data-modal-technologies]"),
    featuresTitle: modal.querySelector("[data-modal-features-title]"),
    features: modal.querySelector("[data-modal-features]"),
    link: modal.querySelector("[data-modal-link]"),
    imageFrame: modal.querySelector("[data-modal-image-frame]"),
    image: modal.querySelector("[data-modal-image]"),
    fallback: modal.querySelector("[data-modal-fallback]"),
    videoFrame: modal.querySelector("[data-modal-video-frame]"),
    video: modal.querySelector("[data-modal-video]")
  };
  let lastTrigger = null;

  function renderList(container, items) {
    if (!container) return;

    container.replaceChildren();
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      fragment.append(listItem);
    });
    container.append(fragment);
  }

  function resetMedia() {
    fields.imageFrame.hidden = true;
    fields.image.removeAttribute("src");
    fields.image.alt = "";
    fields.fallback.hidden = true;
    fields.fallback.replaceChildren();
    fields.videoFrame.hidden = true;
    fields.video.pause();
    fields.video.removeAttribute("src");
    fields.video.removeAttribute("poster");
    fields.video.removeAttribute("aria-label");
    fields.video.load();
  }

  function openModal(projectId, trigger) {
    const project = projects[projectId];
    if (!project) return;

    fields.category.textContent = project.category;
    fields.title.textContent = project.title;
    fields.subtitle.textContent = project.subtitle;
    fields.description.textContent = project.description;
    fields.problem.textContent = project.problem;
    fields.solution.textContent = project.solution;
    fields.featuresTitle.textContent = project.featuresTitle;
    renderList(fields.technologies, project.technologies);
    renderList(fields.features, project.features);
    fields.link.href = project.link;
    fields.link.textContent = project.linkLabel;

    resetMedia();

    if (project.image) {
      fields.image.src = project.image;
      fields.image.alt = project.imageAlt;
      fields.imageFrame.hidden = false;
    } else if (!project.video) {
      const preview = trigger.closest("[data-project-card]")?.querySelector(".project-preview");

      if (preview) {
        fields.fallback.append(preview.cloneNode(true));
        fields.fallback.hidden = false;
      }
    }

    if (project.video) {
      fields.video.src = project.video;
      if (project.poster) fields.video.poster = project.poster;
      fields.video.setAttribute("aria-label", project.videoLabel);
      fields.videoFrame.hidden = false;
      fields.video.load();
    }

    lastTrigger = trigger;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => closeButton?.focus());
  }

  function closeModal() {
    if (modal.hidden) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    resetMedia();
    lastTrigger?.focus();
  }

  detailButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.projectDetails, button));
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;

    const focusableElements = [...modal.querySelectorAll("a[href], button:not([disabled]), video[controls]")];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  });
}

function initDesignSystemTabs() {
  const tabList = document.querySelector('[role="tablist"]');
  const tabs = [...document.querySelectorAll("[data-design-tab]")];
  const panels = [...document.querySelectorAll("[data-design-panel]")];

  if (!tabList || !tabs.length || !panels.length) return;

  function activateTab(tab, moveFocus = false) {
    const targetPanel = tab.dataset.designTab;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.designPanel !== targetPanel;
    });

    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  tabList.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const currentIndex = tabs.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;

    activateTab(tabs[nextIndex], true);
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const rules = {
    name: {
      validate: (value) => value.trim().length >= 2,
      message: "Ingresa un nombre de al menos 2 caracteres."
    },
    email: {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Ingresa un correo electrónico válido."
    },
    subject: {
      validate: (value) => value.trim().length >= 3,
      message: "Ingresa un asunto de al menos 3 caracteres."
    },
    message: {
      validate: (value) => value.trim().length >= 10,
      message: "Escribe un mensaje de al menos 10 caracteres."
    }
  };

  function setFieldState(field, errorMessage = "") {
    const errorElement = form.querySelector(`[data-error-for="${field.name}"]`);
    const hasError = Boolean(errorMessage);

    field.setAttribute("aria-invalid", String(hasError));
    if (errorElement) errorElement.textContent = errorMessage;
    return !hasError;
  }

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;

    return setFieldState(field, rule.validate(field.value) ? "" : rule.message);
  }

  Object.keys(rules).forEach((fieldName) => {
    const field = form.elements.namedItem(fieldName);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
      if (status) status.textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Object.keys(rules)
      .map((name) => form.elements.namedItem(name))
      .filter((field) => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement);
    const isValid = fields.map(validateField).every(Boolean);

    if (!isValid) {
      fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      if (status) status.textContent = "";
      return;
    }

    form.reset();
    fields.forEach((field) => setFieldState(field));
    if (status) {
      status.textContent = "Mensaje validado correctamente. El envío se encuentra en modo demostración.";
    }
  });
}

function initBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!button) return;

  function updateVisibility() {
    const isVisible = window.scrollY > 600;
    button.classList.toggle("is-visible", isVisible);
    button.setAttribute("aria-hidden", String(!isVisible));
    button.tabIndex = isVisible ? 0 : -1;
  }

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
}

function initScrollSpy() {
  if (!("IntersectionObserver" in window)) return;

  const sectionIds = ["inicio", "sobre-mi", "habilidades", "proyectos", "design-system", "contacto"];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navigationLinks = document.querySelectorAll(
    ".navbar__desktop-nav a[href^='#'], .mobile-menu__content > a[href^='#']"
  );

  function setActiveSection(sectionId) {
    navigationLinks.forEach((link) => {
      const isActive = sectionId !== "inicio" && link.getAttribute("href") === `#${sectionId}`;
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) setActiveSection(visibleEntry.target.id);
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
