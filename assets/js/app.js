const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("laura-cart") || "[]")
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const money = (value) => {
  if (value == null) return "A confirmar";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
};

function save() {
  localStorage.setItem("laura-cart", JSON.stringify(state.cart));
  renderCart();
}

function toast(text) {
  const el = $("#toast");

  if (!el) return;

  el.textContent = text;
  el.classList.add("show");

  clearTimeout(window._toast);

  window._toast = setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}

function add(product) {
  const item = state.cart.find((x) => x.id === product.id);

  if (item) {
    item.qty++;
  } else {
    state.cart.push({
      id: product.id,
      nombre: product.nombre,
      titulo: product.titulo,
      imagen: product.imagen,
      precio: product.precio,
      qty: 1
    });
  }

  save();

  toast(`"${product.titulo}" agregado al pedido`);
}

function change(id, delta) {
  const item = state.cart.find((x) => x.id === id);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    state.cart = state.cart.filter((x) => x.id !== id);
  }

  save();
}

function remove(id) {
  state.cart = state.cart.filter((x) => x.id !== id);
  save();
}

function renderProducts() {
  $$(".product-grid").forEach((grid) => {
    const category = grid.dataset.category;

    const products = state.products.filter(
      (product) => product.categoria === category
    );

    const count = document.querySelector(
      `[data-count="${category}"]`
    );

    if (count) {
      count.textContent = `${products.length} opciones`;
    }

    if (!products.length) {
      grid.innerHTML = `
        <div class="products-empty">
          <p>No hay productos disponibles en esta categoría.</p>
        </div>
      `;

      return;
    }

    grid.innerHTML = products
      .map(
        (product) => `
          <article class="product-card">

            <div class="product-image">

              <img
                src="${product.imagen}"
                alt="${escapeHtml(product.titulo)}"
                loading="lazy"
                data-zoom="${product.imagen}"
              >

              <span class="zoom-badge">⌕</span>

            </div>

            <div class="product-info">

              <h3>${escapeHtml(product.titulo)}</h3>

              ${
                product.descripcion
                  ? `<p class="product-description">
                      ${escapeHtml(product.descripcion)}
                    </p>`
                  : ""
              }

              <div class="price-placeholder">
                ${
                  product.precio != null
                    ? money(product.precio)
                    : "Precio: consultar"
                }
              </div>

              <button
                class="add-button"
                type="button"
                data-add="${product.id}"
              >
                🛒 Agregar al pedido
              </button>

            </div>

          </article>
        `
      )
      .join("");
  });

  $$("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = state.products.find(
        (item) => item.id === button.dataset.add
      );

      if (product) {
        add(product);
      }
    });
  });

  $$("[data-zoom]").forEach((image) => {
    image.addEventListener("click", () => {
      openModal(image.dataset.zoom, image.alt);
    });
  });
}

function renderCart() {
  const items = $("#cartItems");

  if (!items) return;

  const totalQty = state.cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const cartCount = $("#cartCount");
  const heroCount = $("#heroCount");

  if (cartCount) {
    cartCount.textContent = totalQty;
  }

  if (heroCount) {
    heroCount.textContent = totalQty;
  }

  if (!state.cart.length) {
    items.innerHTML = `
      <div class="empty-cart">

        <div class="empty-icon">🧺</div>

        <h3>Tu pedido está vacío</h3>

        <p>
          Elegí tus productos y aparecerán acá.
        </p>

      </div>
    `;

    const total = $("#cartTotal");

    if (total) {
      total.textContent = "A confirmar";
    }

    return;
  }

  items.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">

          <img
            src="${item.imagen}"
            alt="${escapeHtml(item.titulo)}"
          >

          <div>

            <h3>${escapeHtml(item.titulo)}</h3>

            <div class="qty-controls">

              <button
                type="button"
                data-minus="${item.id}"
              >
                −
              </button>

              <span>${item.qty}</span>

              <button
                type="button"
                data-plus="${item.id}"
              >
                +
              </button>

            </div>

          </div>

          <button
            type="button"
            class="remove-item"
            data-remove="${item.id}"
            aria-label="Eliminar producto"
          >
            ✕
          </button>

        </div>
      `
    )
    .join("");

  const total = $("#cartTotal");

  if (total) {
    total.textContent = "A confirmar";
  }

  $$("[data-minus]").forEach((button) => {
    button.onclick = () => {
      change(button.dataset.minus, -1);
    };
  });

  $$("[data-plus]").forEach((button) => {
    button.onclick = () => {
      change(button.dataset.plus, 1);
    };
  });

  $$("[data-remove]").forEach((button) => {
    button.onclick = () => {
      remove(button.dataset.remove);
    };
  });
}

function openCart() {
  const drawer = $("#cartDrawer");
  const backdrop = $("#cartBackdrop");

  if (!drawer || !backdrop) return;

  drawer.classList.add("open");
  backdrop.classList.add("open");

  drawer.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeCart() {
  const drawer = $("#cartDrawer");
  const backdrop = $("#cartBackdrop");

  if (!drawer || !backdrop) return;

  drawer.classList.remove("open");
  backdrop.classList.remove("open");

  drawer.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

function sendWhatsApp() {
  if (!state.cart.length) {
    toast("Agregá al menos un producto");
    return;
  }

  const lines = state.cart
    .map(
      (item) =>
        `- ${item.titulo} x${item.qty}`
    )
    .join("\n");

  const message = `Hola! Quisiera consultar disponibilidad para hacer el siguiente pedido:

${lines}

Total: a confirmar.

¿Me indican disponibilidad y precio final?

Gracias!`;

  const url =
    `https://wa.me/5491150182600?text=` +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

function openModal(src, alt) {
  const image = $("#modalImage");
  const modal = $("#imageModal");

  if (!image || !modal) return;

  image.src = src;
  image.alt = alt;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = $("#imageModal");

  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character])
  );
}

/*
========================================================
 CARGA DE PRODUCTOS
========================================================

Primero intenta cargar:

data/productos.json

Si el navegador bloquea fetch o el archivo no está
disponible, utiliza los productos incluidos directamente
en la página mediante window.LAURA_PRODUCTS.

========================================================
*/

async function loadProducts() {

  /*
  1. Si index.html contiene los productos directamente
  */
  if (
    Array.isArray(window.LAURA_PRODUCTS) &&
    window.LAURA_PRODUCTS.length
  ) {
    return window.LAURA_PRODUCTS;
  }

  /*
  2. Intentar cargar el JSON normalmente
  */
  try {

    const response = await fetch(
      "./data/productos.json",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error(
        "productos.json no contiene un array"
      );
    }

    return products;

  } catch (error) {

    console.warn(
      "No se pudo cargar data/productos.json:",
      error
    );

    /*
    3. Último intento:
       buscar el JSON desde la raíz
    */

    try {

      const response = await fetch(
        "./data_productos.json",
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const products = await response.json();

      if (Array.isArray(products)) {
        return products;
      }

    } catch (secondError) {

      console.warn(
        "Segundo intento de carga fallido:",
        secondError
      );

    }

    throw new Error(
      "No fue posible cargar los productos."
    );
  }
}

async function init() {

  try {

    state.products = await loadProducts();

    console.log(
      `La Cocina de Laura: ${state.products.length} productos cargados.`
    );

    renderProducts();
    renderCart();

  } catch (error) {

    console.error(
      "Error cargando productos:",
      error
    );

    $$(".product-grid").forEach((grid) => {

      grid.innerHTML = `
        <div class="products-error">

          <h3>No se pudieron cargar los productos</h3>

          <p>
            Revisá que el archivo
            <strong>data/productos.json</strong>
            esté dentro del proyecto.
          </p>

        </div>
      `;

    });

  }
}

/* ================================
   EVENTOS
================================ */

document.addEventListener("DOMContentLoaded", () => {

  const openCartButton = $("#openCart");
  const heroCartButton = $("#heroCart");
  const ctaCartButton = $("#ctaCart");
  const closeCartButton = $("#closeCart");
  const backdrop = $("#cartBackdrop");
  const sendButton = $("#sendWhatsApp");
  const clearButton = $("#clearCart");

  if (openCartButton) {
    openCartButton.onclick = openCart;
  }

  if (heroCartButton) {
    heroCartButton.onclick = openCart;
  }

  if (ctaCartButton) {
    ctaCartButton.onclick = openCart;
  }

  if (closeCartButton) {
    closeCartButton.onclick = closeCart;
  }

  if (backdrop) {
    backdrop.onclick = closeCart;
  }

  if (sendButton) {
    sendButton.onclick = sendWhatsApp;
  }

  if (clearButton) {

    clearButton.onclick = () => {

      state.cart = [];

      save();

      toast("Pedido vacío");

    };

  }

  const closeModalButton = $("#closeModal");
  const imageModal = $("#imageModal");

  if (closeModalButton) {
    closeModalButton.onclick = closeModal;
  }

  if (imageModal) {

    imageModal.onclick = (event) => {

      if (
        event.target.id === "imageModal"
      ) {
        closeModal();
      }

    };

  }

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  if (menuToggle && mainNav) {

    menuToggle.onclick = () => {

      const isOpen =
        mainNav.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

    };

    $$("#mainNav a").forEach((link) => {

      link.addEventListener("click", () => {

        mainNav.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        closeCart();
        closeModal();

      }

    }
  );

  init();

});
