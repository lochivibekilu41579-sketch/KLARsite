(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const dialog = document.querySelector("[data-dialog]");
  const closeDialogButton = document.querySelector("[data-close-dialog]");
  const needSelect = document.querySelector("[data-need-select]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const year = document.querySelector("[data-year]");
  const productDialog = document.querySelector("[data-product-dialog]");
  const closeProductDialogButton = document.querySelector("[data-close-product-dialog]");
  const productDialogImage = document.querySelector("[data-product-dialog-image]");
  const productDialogVolume = document.querySelector("[data-product-dialog-volume]");
  const productDialogTitle = document.querySelector("[data-product-dialog-title]");
  const productDialogPrice = document.querySelector("[data-product-dialog-price]");
  const productInstruction = document.querySelector("[data-product-instruction]");
  const productComposition = document.querySelector("[data-product-composition]");
  const productRecommendations = document.querySelector("[data-product-recommendations]");
  const productDetailStatus = document.querySelector("[data-product-detail-status]");

  const productSourceSections = {
    "dish-sensitive": 6,
    "dish-orange-500": 7,
    "dish-orange-1500": 8,
    "dishwasher-rinse-aid": 9,
    "stain-remover-soap": 11,
    "universal-powder": 4,
    "color-powder": 3,
    "fabric-softener": 5,
    "universal-liquid-1500": 2,
    "glass-cleaner": 10,
    "toilet-cleaner": 12
  };

  const colorLiquidDetails = {
    instruction: `
- Підходить для машинного й ручного прання кольорових тканин при 30–60 °C; не використовувати для вовни та шовку.
- Для завантаження 4–5 кг, м’яка вода: легке/середнє забруднення — 40 мл, сильне — 60 мл.
- Середня жорсткість: легке — 40 мл, середнє — 60 мл, сильне — 75 мл.
- Жорстка вода: легке — 40 мл, середнє — 75 мл, сильне — 100 мл.
- Завантаження 2–3 кг: зменшити дозу на 10 мл; 6–8 кг: додати 50 мл. Ручне прання: 20 мл на 5 л води.`,
    composition: `
- 15–30% мило: мило та мило з рослинних олій із контрольованого органічного землеробства.
- <5% неіоногенні ПАР: цукрові ПАР.
- Вода, етанол, калієві солі лимонної кислоти, молочна кислота, лимонна кислота.
- 100% інгредієнтів природного походження; формула не містить ензимів і віддушок.`,
    recommendations: `
- Використовувати програму для кольорової або делікатної білизни та звірятися з ярликами одягу.
- Для стійких плям виробник рекомендує попередню обробку KLAR Bio-Gallseife або KLAR Öko-Kernseife.
- Для білого прання краще обрати відповідний універсальний порошок або регулярно додавати KLAR Fleckensalz.
- Засіб може подразнювати шкіру й очі. Зберігати поза доступом дітей; при потраплянні в очі промивати водою кілька хвилин.`
  };

  let productDetailsCache;

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Відкрити меню");
    mobileNav.hidden = true;
  };

  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Закрити меню" : "Відкрити меню");
      mobileNav.hidden = !willOpen;
    });

    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeMenu();
    });
  }

  const openDialog = (preferredSet = "") => {
    if (!dialog) return;
    closeMenu();
    if (preferredSet && needSelect) needSelect.value = preferredSet;
    if (formStatus) formStatus.textContent = "";
    document.body.classList.add("dialog-open");

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    window.setTimeout(() => dialog.querySelector("input")?.focus(), 50);
  };

  const closeDialog = () => {
    if (!dialog) return;
    document.body.classList.remove("dialog-open");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  const knownProductHeadings = new Set([
    "Склад",
    "Інструкція із застосування",
    "Рекомендації та обмеження"
  ]);

  const parseProductBlocks = (body) => {
    const markerPattern = /^\*\*([^*\r\n]+)\*\*[ \t]*$/gm;
    const markers = [];
    let marker;

    while ((marker = markerPattern.exec(body)) !== null) {
      const title = marker[1].trim();
      if (knownProductHeadings.has(title)) {
        markers.push({ title, start: marker.index, contentStart: markerPattern.lastIndex });
      }
    }

    return markers.reduce((blocks, current, index) => {
      const next = markers[index + 1];
      const end = next ? next.start : body.length;
      blocks[current.title] = body.slice(current.contentStart, end)
        .split(/\n\*\*Джерело:\*\*/)[0]
        .split(/\n---[ \t]*/)[0]
        .replace(/^\s+|\s+$/g, "");
      return blocks;
    }, {});
  };

  const parseProductSource = (source) => {
    const headingPattern = /^## (\d+)\.[^\r\n]*$/gm;
    const headings = [...source.matchAll(headingPattern)];

    return headings.reduce((products, heading, index) => {
      const nextHeading = headings[index + 1];
      const bodyStart = heading.index + heading[0].length;
      const bodyEnd = nextHeading ? nextHeading.index : source.length;
      const blocks = parseProductBlocks(source.slice(bodyStart, bodyEnd));
      products[Number(heading[1])] = {
        instruction: blocks["Інструкція із застосування"] || "",
        composition: blocks["Склад"] || "",
        recommendations: blocks["Рекомендації та обмеження"] || ""
      };
      return products;
    }, {});
  };

  const loadProductDetails = () => {
    if (!productDetailsCache) {
      if (!window.KLAR_PRODUCT_SOURCE) {
        return Promise.reject(new Error("Вбудовані дані про товари недоступні"));
      }
      productDetailsCache = parseProductSource(window.KLAR_PRODUCT_SOURCE);
    }
    return Promise.resolve(productDetailsCache);
  };

  const cleanMarkdownText = (value) => value
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^\\\*/g, "*")
    .replace(/[ \t]+$/g, "")
    .trim();

  const renderProductBlock = (container, source) => {
    if (!container) return;
    container.replaceChildren();

    const lines = String(source || "").split(/\r?\n/);
    let list = null;

    lines.forEach((rawLine) => {
      const line = cleanMarkdownText(rawLine);
      if (!line) {
        list = null;
        return;
      }

      if (line.startsWith("- ")) {
        if (!list) {
          list = document.createElement("ul");
          container.append(list);
        }
        const item = document.createElement("li");
        item.textContent = line.slice(2).trim();
        list.append(item);
        return;
      }

      list = null;
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      container.append(paragraph);
    });

    if (!container.childElementCount) {
      const paragraph = document.createElement("p");
      paragraph.textContent = "Інформацію для цієї позиції не знайдено.";
      container.append(paragraph);
    }
  };

  const setProductLoadingState = () => {
    [productInstruction, productComposition, productRecommendations].forEach((container) => {
      if (!container) return;
      container.replaceChildren();
      const paragraph = document.createElement("p");
      paragraph.textContent = "Завантаження…";
      container.append(paragraph);
    });
    if (productDetailStatus) {
      productDetailStatus.textContent = "";
      productDetailStatus.classList.remove("is-error");
    }
  };

  const showProductDialog = () => {
    if (!productDialog) return;
    closeMenu();
    document.body.classList.add("dialog-open");
    if (typeof productDialog.showModal === "function") {
      if (!productDialog.open) productDialog.showModal();
    } else {
      productDialog.setAttribute("open", "");
    }
    window.setTimeout(() => closeProductDialogButton?.focus(), 50);
  };

  const closeProductDialog = () => {
    if (!productDialog) return;
    document.body.classList.remove("dialog-open");
    if (typeof productDialog.close === "function") productDialog.close();
    else productDialog.removeAttribute("open");
  };

  const openProductDetails = async (button) => {
    if (!productDialog) return;
    const productId = button.dataset.productDetail;
    const card = button.closest(".product-card");
    const cardImage = card?.querySelector(".product-image img");

    if (productDialogImage && cardImage) {
      productDialogImage.src = cardImage.currentSrc || cardImage.src;
      productDialogImage.alt = cardImage.alt;
    }
    if (productDialogVolume) productDialogVolume.textContent = card?.querySelector(".product-volume")?.textContent || "";
    if (productDialogTitle) productDialogTitle.textContent = card?.querySelector("h3")?.textContent || "KLAR EcoSensitive";
    if (productDialogPrice) productDialogPrice.textContent = (card?.querySelector(".product-price")?.textContent || "").replace(/\s+/g, " ").trim();

    setProductLoadingState();
    showProductDialog();

    try {
      const details = productId.startsWith("color-liquid-")
        ? colorLiquidDetails
        : (await loadProductDetails())[productSourceSections[productId]];

      if (!details) throw new Error("Деталі товару не знайдено");
      renderProductBlock(productInstruction, details.instruction);
      renderProductBlock(productComposition, details.composition);
      renderProductBlock(productRecommendations, details.recommendations);
    } catch (error) {
      renderProductBlock(productInstruction, "");
      renderProductBlock(productComposition, "");
      renderProductBlock(productRecommendations, "");
      if (productDetailStatus) {
        productDetailStatus.textContent = "Не вдалося завантажити деталі. Оновіть сторінку та спробуйте ще раз.";
        productDetailStatus.classList.add("is-error");
      }
    }
  };

  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => openDialog(button.dataset.set || ""));
  });

  document.querySelectorAll("[data-product-detail]").forEach((button) => {
    button.addEventListener("click", () => openProductDetails(button));
  });

  closeDialogButton?.addEventListener("click", closeDialog);
  closeProductDialogButton?.addEventListener("click", closeProductDialog);

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));

  productDialog?.addEventListener("click", (event) => {
    if (event.target === productDialog) closeProductDialog();
  });

  productDialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") closeMenu();
  });

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      if (formStatus) formStatus.textContent = "Перевірте, будь ласка, обов’язкові поля.";
      return;
    }

    if (formStatus) {
      formStatus.textContent = "Дякуємо. Це демонстраційна форма — під’єднайте CRM або месенджер, щоб запити надходили менеджеру.";
    }
  });

  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".faq-list details[open]").forEach((other) => {
        if (other !== item) other.removeAttribute("open");
      });
    });
  });

  if (year) year.textContent = String(new Date().getFullYear());
})();
