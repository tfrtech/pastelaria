import { createClient } from '@supabase/supabase-js';
import './styles.css';

const root = document.querySelector('#app');

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const state = {
  loading: true,
  error: '',
  serviceClosed: false,

  // Fluxo:
  // intro -> menu -> cart -> sent
  step: 'intro',

  table: null,

  storeName: 'Cardápio Digital',
  logoEmoji: '🥟',
  logoUrl: null,

  products: [],
  categories: [],
  cart: [],

  customerName: '',
  customerPhone: '',

  sending: false,

  statusMessage: 'Informe seu nome e celular para continuar.',

  supabase: null,
};

function phoneDigits(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11);
}

function formatPhone(value) {
  const digits = phoneDigits(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readRoute() {
  const fromQuery = new URLSearchParams(window.location.search).get('path');

  const path = (
    fromQuery ||
    window.location.pathname
  ).trim();

  const parts = path
    .split('/')
    .filter(Boolean);

  const mesaIndex = parts.indexOf('mesa');

  if (
    mesaIndex === -1 ||
    parts.length < mesaIndex + 3
  ) {
    return null;
  }

  const tableId = Number(parts[mesaIndex + 1]);
  const tableCode = parts[mesaIndex + 2];

  if (!Number.isInteger(tableId) || !tableCode) {
    return null;
  }

  return {
    tableId,
    tableCode,
  };
}

function cartKey(productId, complements = []) {
  return `${productId}:${complements
    .map((item) => item.id)
    .sort()
    .join(',')}`;
}

function cartCount() {
  return state.cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const compTotal = item.complements.reduce(
      (acc, comp) => acc + Number(comp.price || 0),
      0
    );

    return (
      sum +
      (Number(item.product.price) + compTotal) *
      item.quantity
    );
  }, 0);
}

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.'
    );
  }

  return createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function getSupabaseAuthErrorMessage(error) {
  const message = String(
    error?.message || ''
  ).toLowerCase();

  const status = Number(
    error?.status ||
    error?.context?.status ||
    0
  );

  if (
    status === 401 ||
    message.includes('invalid api key') ||
    message.includes('apikey')
  ) {
    return 'A chave do Supabase configurada na Vercel não corresponde a este banco. Atualize VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.';
  }

  return '';
}

function footerHTML() {
  return `
    <footer class="tfr-footer">
      <div class="tfr-footer-inner">
        <div class="tfr-badge">
          <span class="tfr-badge-icon">⚡</span>
          <span class="tfr-badge-text">Cardápio Digital</span>
        </div>

        <p class="tfr-tagline">
          Tecnologia que faz seu negócio vender mais
        </p>

        <a
          class="tfr-link"
          href="https://www.tfrtech.com.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="tfr-link-logo">TFR<span>Tech</span></span>
          <span class="tfr-link-arrow">↗</span>
        </a>

        <p class="tfr-cta">
          Quer um cardápio digital para o seu restaurante?<br>
          <strong>Acesse www.tfrtech.com.br</strong>
        </p>
      </div>
    </footer>
  `;
}

function render() {
  if (!root) {
    return;
  }

  /*
   * LOADING
   */
  if (state.loading) {
    root.innerHTML = `
      <main class="shell">
        <section class="page">
          <div class="loading card">
            <strong>Carregando cardápio...</strong>

            <p class="muted">
              Estamos validando a mesa e buscando os produtos.
            </p>
          </div>
        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * ERROR
   */
  if (state.error) {
    root.innerHTML = `
      <main class="shell">
        <section class="page">
          <div class="error card">

            <strong>
              Não foi possível abrir a mesa
            </strong>

            <p class="muted">
              ${escapeHtml(state.error)}
            </p>

          </div>
        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * LOJA FECHADA
   */
  if (state.serviceClosed) {
    root.innerHTML = `
      <main class="shell">
        <section class="page">

          <div class="error card">

            <div
              class="store-logo"
              style="margin-bottom: 14px;"
            >
              ${state.logoUrl
        ? `
                    <img
                      src="${escapeHtml(state.logoUrl)}"
                      alt="Logo"
                    >
                  `
        : `
                    <span>
                      ${escapeHtml(state.logoEmoji)}
                    </span>
                  `
      }
            </div>

            <strong>
              Fora de horário de serviço
            </strong>

            <p class="muted">
              A loja está fechada no momento.
              Tente fazer seu pedido novamente
              dentro do horário de atendimento.
            </p>

          </div>

        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * ==========================================
   * TELA DE IDENTIFICAÇÃO
   * ==========================================
   */
  if (state.step === 'intro') {
    root.innerHTML = `
      <main class="shell">
        <section class="page">

          <div class="card login-card">

            <div
              class="store-logo"
              style="margin: 0 auto 16px;"
            >
              ${state.logoUrl
        ? `
                    <img
                      src="${escapeHtml(state.logoUrl)}"
                      alt="Logo"
                    >
                  `
        : `
                    <span>
                      ${escapeHtml(state.logoEmoji)}
                    </span>
                  `
      }
            </div>

            <h1
              class="store-title"
              style="text-align:center;"
            >
              ${escapeHtml(state.storeName)}
            </h1>

            <p
              class="store-subtitle"
              style="text-align:center;"
            >
              ${escapeHtml(
        state.table?.name || 'Mesa'
      )}
            </p>

            <div style="height: 18px;"></div>

            <h2
              class="section-title"
              style="text-align:center;"
            >
              Antes de começar
            </h2>

            <p
              class="card-description"
              style="text-align:center;"

            >
              Informe seus dados para fazer o pedido.
            </p>

            <form
              id="customer-form"
              style="
                display:grid;
                gap:12px;
                margin-top:20px;
              "
            >

              <div style="align-items:center;">
                <label
                  for="customer-name"
                  style="
                    display:block;
                    font-weight:600;
                    margin-bottom:6px;
                    border-radius:4px;
                  "
                >
                  Seu nome
                </label>

                <input
                  id="customer-name"
                  class="text-input"
                  type="text"
                  placeholder="Digite seu nome"
                  value="${escapeHtml(
        state.customerName
      )}"
                  autocomplete="name"
                  maxlength="120"
                  required
                >
              </div>

              <div>
                <label
                  for="customer-phone"
                  style="
                    display:block;
                    font-weight:600;
                    margin-bottom:6px;
                  "
                >
                  Seu celular
                </label>

                <input
                  id="customer-phone"
                  class="text-input"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value="${escapeHtml(
        state.customerPhone
      )}"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="15"
                  required
                >
              </div>

              <button
                class="primary-button"
                type="submit"
                style="margin-top:8px;"
              >
                Ver Cardápio
              </button>

            </form>

            ${state.statusMessage
        ? `
                  <p
                    class="status-message"
                    style="
                      text-align:center;
                      margin-top:14px;
                    "
                  >
                    ${escapeHtml(
          state.statusMessage
        )}
                  </p>
                `
        : ''
      }

          </div>

        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * ==========================================
   * PEDIDO ENVIADO
   * ==========================================
   */
  if (state.step === 'sent') {
    root.innerHTML = `
      <main class="shell">
        <section class="page">

          <div class="sent card">

            <div
              class="store-logo"
              style="margin:0 auto 16px;"
            >
              ${state.logoUrl
        ? `
                    <img
                      src="${escapeHtml(state.logoUrl)}"
                      alt="Logo"
                    >
                  `
        : `
                    <span>
                      ${escapeHtml(state.logoEmoji)}
                    </span>
                  `
      }
            </div>

            <strong>
              Pedido enviado!
            </strong>

            <p class="muted">
              Obrigado,
              ${escapeHtml(state.customerName)}.
              Seu pedido foi registrado e está
              aguardando aprovação.
            </p>

            <p class="muted">
              ${escapeHtml(
        state.table?.name || 'Mesa'
      )}
            </p>

            <div style="margin-top:16px;">

              <button
                class="primary-button"
                data-action="new-order"
                type="button"
              >
                Fazer outro pedido
              </button>

            </div>

          </div>

        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * ==========================================
   * CARRINHO
   * ==========================================
   */
  if (state.step === 'cart') {
    const items = state.cart
      .map((item) => {
        const compTotal =
          item.complements.reduce(
            (sum, comp) =>
              sum + Number(comp.price || 0),
            0
          );

        return `
          <article class="cart-item">

            <div class="cart-image">
              ${item.product.image
            ? `
                    <img
                      src="${escapeHtml(
              item.product.image
            )}"
                      alt="${escapeHtml(
              item.product.name
            )}"
                    >
                  `
            : ''
          }
            </div>

            <div class="cart-main">

              <p class="cart-name">
                ${escapeHtml(
            item.product.name
          )}
              </p>

              ${item.complements.length
            ? `
                    <p class="cart-meta">
                      +
                      ${item.complements
              .map(
                (c) =>
                  escapeHtml(c.name)
              )
              .join(', ')}
                    </p>
                  `
            : ''
          }

              <p class="cart-price">
                ${money(
            (Number(
              item.product.price
            ) + compTotal) *
            item.quantity
          )}
              </p>

            </div>

            <div class="cart-controls">

              <button
                type="button"
                class="mini-button"
                data-action="decrease-cart"
                data-key="${escapeHtml(
            cartKey(
              item.product.id,
              item.complements
            )
          )}"
              >
                -
              </button>

              <span class="mini-count">
                ${item.quantity}
              </span>

              <button
                type="button"
                class="mini-button"
                data-action="increase-cart"
                data-key="${escapeHtml(
            cartKey(
              item.product.id,
              item.complements
            )
          )}"
              >
                +
              </button>

            </div>

          </article>
        `;
      })
      .join('');

    root.innerHTML = `
      <main class="shell">
        <section class="page menu-shell">

          <header class="menu-header">

            <div class="store-brand">

              <div class="store-logo">

                ${state.logoUrl
        ? `
                      <img
                        src="${escapeHtml(
          state.logoUrl
        )}"
                        alt="Logo"
                      >
                    `
        : `
                      <span>
                        ${escapeHtml(
          state.logoEmoji
        )}
                      </span>
                    `
      }

              </div>

              <div>

                <h1 class="store-title">
                  ${escapeHtml(
        state.storeName
      )}
                </h1>

                <p class="store-subtitle">
                  ${escapeHtml(
        state.table?.name || 'Mesa'
      )}
                  •
                  ${escapeHtml(
        state.customerName
      )}
                </p>

              </div>

            </div>

            <button
              type="button"
              class="ghost-button"
              data-action="back-menu"
            >
              ← Cardápio
            </button>

          </header>

          <section class="card">

            <h2 class="section-title">
              Seu carrinho
            </h2>

            <div class="cart-shell">

              ${items ||
      '<div class="empty-box">Carrinho vazio.</div>'
      }

            </div>

            <div
              class="summary"
              style="margin-top:18px;"
            >

              <div class="summary-row">

                <strong>
                  Total
                </strong>

                <span class="summary-total">
                  ${money(cartTotal())}
                </span>

              </div>

              <div
                style="
                  display:grid;
                  gap:12px;
                  margin-top:16px;
                "
              >

                <button
                  type="button"
                  class="primary-button"
                  data-action="send-order"
                  ${state.sending ||
        state.cart.length === 0
        ? 'disabled'
        : ''
      }
                >
                  ${state.sending
        ? 'Enviando...'
        : 'Enviar pedido'
      }
                </button>

                <button
                  type="button"
                  class="secondary-button"
                  data-action="back-menu"
                >
                  Continuar escolhendo
                </button>

              </div>

            </div>

          </section>

          <section class="status-panel">

            <p class="status-label">
              Status
            </p>

            <p class="status-message">
              ${escapeHtml(
        state.statusMessage
      )}
            </p>

          </section>

        </section>

        ${footerHTML()}

      </main>
    `;

    bindActions();
    return;
  }

  /*
   * ==========================================
   * CARDÁPIO
   * ==========================================
   */

  const groups = state.categories
    .map((category) => {
      const products =
        state.products.filter(
          (product) =>
            product.category === category
        );

      if (!products.length) {
        return '';
      }

      return `
        <section class="category">

          <h3 class="category-title">
            ${escapeHtml(category)}
          </h3>

          <div class="products">

            ${products
          .map((product) => {
            const current =
              state.cart.find(
                (item) =>
                  item.product.id ===
                  product.id &&
                  item.complements
                    .length === 0
              );

            const count = current
              ? current.quantity
              : 0;

            const available =
              Number(product.stock) > 0;

            return `
                  <article class="product-card">

                    <div class="product-image">

                      ${product.image
                ? `
                            <img
                              src="${escapeHtml(
                  product.image
                )}"
                              alt="${escapeHtml(
                  product.name
                )}"
                            >
                          `
                : `
                            <span>
                              ${escapeHtml(
                  product.name
                    .slice(0, 1)
                    .toUpperCase()
                )}
                            </span>
                          `
              }

                    </div>

                    <div class="product-main">

                      <p class="product-name">
                        ${escapeHtml(
                product.name
              )}
                      </p>

                      ${product.description
                ? `
                            <p class="product-desc">
                              ${escapeHtml(
                  product.description
                )}
                            </p>
                          `
                : ''
              }

                      <div class="product-price">
                        ${available
                ? money(
                  product.price
                )
                : 'Indisponível'
              }
                      </div>

                    </div>

                    <div class="product-actions">

                      ${available
                ? count > 0
                  ? `
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${escapeHtml(
                    product.id
                  )}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${count}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${escapeHtml(
                    product.id
                  )}"
                              >
                                +
                              </button>
                            `
                  : `
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${escapeHtml(
                    product.id
                  )}"
                              >
                                Adicionar
                              </button>
                            `
                : `
                            <span class="muted">
                              Sem estoque
                            </span>
                          `
              }

                    </div>

                  </article>
                `;
          })
          .join('')}

          </div>

        </section>
      `;
    })
    .join('');

  const uncategorized =
    state.products.filter(
      (product) =>
        !state.categories.includes(
          product.category
        )
    );

  const uncategorizedHtml =
    uncategorized.length
      ? `
        <section class="category">

          <h3 class="category-title">
            Outros
          </h3>

          <div class="products">

            ${uncategorized
        .map((product) => {
          const current =
            state.cart.find(
              (item) =>
                item.product.id ===
                product.id &&
                item.complements
                  .length === 0
            );

          const count = current
            ? current.quantity
            : 0;

          const available =
            Number(product.stock) > 0;

          return `
                  <article class="product-card">

                    <div class="product-image">

                      ${product.image
              ? `
                            <img
                              src="${escapeHtml(
                product.image
              )}"
                              alt="${escapeHtml(
                product.name
              )}"
                            >
                          `
              : `
                            <span>
                              ${escapeHtml(
                product.name
                  .slice(0, 1)
                  .toUpperCase()
              )}
                            </span>
                          `
            }

                    </div>

                    <div class="product-main">

                      <p class="product-name">
                        ${escapeHtml(
              product.name
            )}
                      </p>

                      ${product.description
              ? `
                            <p class="product-desc">
                              ${escapeHtml(
                product.description
              )}
                            </p>
                          `
              : ''
            }

                      <div class="product-price">
                        ${available
              ? money(
                product.price
              )
              : 'Indisponível'
            }
                      </div>

                    </div>

                    <div class="product-actions">

                      ${available
              ? count > 0
                ? `
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${escapeHtml(
                  product.id
                )}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${count}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${escapeHtml(
                  product.id
                )}"
                              >
                                +
                              </button>
                            `
                : `
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${escapeHtml(
                  product.id
                )}"
                              >
                                Adicionar
                              </button>
                            `
              : `
                            <span class="muted">
                              Sem estoque
                            </span>
                          `
            }

                    </div>

                  </article>
                `;
        })
        .join('')}

          </div>

        </section>
      `
      : '';

  root.innerHTML = `
    <main class="shell">

      <section class="page menu-shell">

        <header class="menu-header">

          <div class="store-brand">

            <div class="store-logo">

              ${state.logoUrl
      ? `
                    <img
                      src="${escapeHtml(
        state.logoUrl
      )}"
                      alt="Logo"
                    >
                  `
      : `
                    <span>
                      ${escapeHtml(
        state.logoEmoji
      )}
                    </span>
                  `
    }

            </div>

            <div>

              <h1 class="store-title">
                ${escapeHtml(
      state.storeName
    )}
              </h1>

              <p class="store-subtitle">
                ${escapeHtml(
      state.table?.name || 'Mesa'
    )}
                •
                ${escapeHtml(
      state.customerName
    )}
              </p>

            </div>

          </div>

          <div class="cart-chip">
            Carrinho:
            ${cartCount()}
            itens
          </div>

        </header>

        <section class="card">

          <p class="eyebrow">
            Cardápio
          </p>

          <h2 class="section-title">
            Escolha seus produtos
          </h2>

          <p class="card-description">
            Toque em adicionar para montar o pedido.
          </p>

          <div
            style="
              display:grid;
              gap:16px;
              margin-top:18px;
            "
          >

            ${groups}

            ${uncategorizedHtml}

            ${!groups && !uncategorizedHtml
      ? `
                  <div class="empty-box">
                    Nenhum produto disponível
                    no momento.
                  </div>
                `
      : ''
    }

          </div>

        </section>

        ${cartCount() > 0
      ? `
              <button
                type="button"
                class="floating-cart"
                data-action="open-cart"
              >
                <span>
                  Ver Carrinho
                  (${cartCount()})
                </span>

                <strong>
                  ${money(cartTotal())}
                </strong>
              </button>
            `
      : ''
    }

        <section class="status-panel">

          <p class="status-label">
            Status
          </p>

          <p class="status-message">
            ${escapeHtml(
      state.statusMessage
    )}
          </p>

        </section>

      </section>

      ${footerHTML()}

    </main>
  `;

  bindActions();
}

function bindActions() {
  const nameInput =
    document.querySelector(
      '#customer-name'
    );

  const phoneInput =
    document.querySelector(
      '#customer-phone'
    );

  const introForm =
    document.querySelector(
      '#customer-form'
    );

  /*
   * NOME
   */
  if (nameInput) {
    nameInput.addEventListener(
      'input',
      (event) => {
        state.customerName =
          event.target.value;
      }
    );
  }

  /*
   * TELEFONE
   */
  if (phoneInput) {
    phoneInput.addEventListener(
      'input',
      (event) => {
        state.customerPhone =
          formatPhone(
            event.target.value
          );

        event.target.value =
          state.customerPhone;
      }
    );
  }

  /*
   * FORMULÁRIO DE IDENTIFICAÇÃO
   */
  if (introForm) {
    introForm.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        const name =
          state.customerName.trim();

        const phone =
          phoneDigits(
            state.customerPhone
          );

        if (!name) {
          state.statusMessage =
            'Informe seu nome para continuar.';

          render();
          return;
        }

        if (phone.length < 10) {
          state.statusMessage =
            'Informe um celular válido para continuar.';

          render();
          return;
        }

        state.customerName =
          name;

        state.customerPhone =
          formatPhone(phone);

        state.step =
          'menu';

        state.statusMessage =
          `Olá, ${name}! Escolha seus produtos.`;

        render();
      }
    );
  }

  /*
   * BOTÕES DO SISTEMA
   */
  document
    .querySelectorAll('[data-action]')
    .forEach((element) => {
      element.addEventListener(
        'click',
        handleAction
      );
    });
}

async function handleAction(event) {
  const action =
    event.currentTarget.getAttribute(
      'data-action'
    );

  const productId =
    event.currentTarget.getAttribute(
      'data-product-id'
    );

  const key =
    event.currentTarget.getAttribute(
      'data-key'
    );

  /*
   * NOVO PEDIDO
   */
  if (action === 'new-order') {
    state.cart = [];

    state.step = 'menu';

    state.statusMessage =
      'Escolha seus produtos.';

    render();
    return;
  }

  /*
   * VOLTAR AO CARDÁPIO
   */
  if (action === 'back-menu') {
    state.step = 'menu';

    render();
    return;
  }

  /*
   * ABRIR CARRINHO
   */
  if (action === 'open-cart') {
    state.step = 'cart';

    render();
    return;
  }

  /*
   * ENVIAR PEDIDO
   */
  if (action === 'send-order') {
    await submitOrder();
    return;
  }

  /*
   * ADICIONAR PRODUTO
   */
  if (
    action === 'add-product' ||
    action === 'increase-product'
  ) {
    const product =
      state.products.find(
        (item) =>
          String(item.id) ===
          String(productId)
      );

    if (!product) {
      return;
    }

    const current =
      state.cart.find(
        (item) =>
          String(item.product.id) ===
          String(productId) &&
          item.complements.length === 0
      );

    if (current) {
      if (
        current.quantity >=
        Number(product.stock)
      ) {
        state.statusMessage =
          'Estoque insuficiente para adicionar mais unidades.';

        render();
        return;
      }

      current.quantity += 1;
    } else {
      state.cart.push({
        product,
        quantity: 1,
        complements: [],
      });
    }

    state.statusMessage =
      'Produto adicionado ao carrinho.';

    render();
    return;
  }

  /*
   * DIMINUIR PRODUTO
   */
  if (
    action === 'decrease-product'
  ) {
    const current =
      state.cart.find(
        (item) =>
          String(item.product.id) ===
          String(productId) &&
          item.complements.length === 0
      );

    if (!current) {
      return;
    }

    current.quantity -= 1;

    state.cart =
      state.cart.filter(
        (item) =>
          item.quantity > 0
      );

    render();
    return;
  }

  /*
   * CARRINHO + / -
   */
  if (
    action === 'increase-cart' ||
    action === 'decrease-cart'
  ) {
    const item =
      state.cart.find(
        (entry) =>
          cartKey(
            entry.product.id,
            entry.complements
          ) === key
      );

    if (!item) {
      return;
    }

    if (
      action === 'increase-cart' &&
      item.quantity >=
      Number(item.product.stock)
    ) {
      state.statusMessage =
        'Estoque insuficiente para adicionar mais unidades.';

      render();
      return;
    }

    if (
      action === 'increase-cart'
    ) {
      item.quantity += 1;
    } else {
      item.quantity -= 1;
    }

    state.cart =
      state.cart.filter(
        (entry) =>
          entry.quantity > 0
      );

    render();
  }
}

async function submitOrder() {
  if (
    !state.supabase ||
    !state.table ||
    state.cart.length === 0
  ) {
    return;
  }

  /*
   * VALIDAÇÃO EXTRA
   *
   * Sanitiza nome (remove tags HTML/controle)
   * e impede que o RPC receba nome vazio.
   */
  const customerName = String(state.customerName || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();

  const customerPhone =
    phoneDigits(
      state.customerPhone
    );

  if (!customerName) {
    state.step = 'intro';

    state.statusMessage =
      'Informe seu nome antes de enviar o pedido.';

    render();
    return;
  }

  if (customerPhone.length < 10) {
    state.step = 'intro';

    state.statusMessage =
      'Informe um celular válido antes de enviar o pedido.';

    render();
    return;
  }

  state.sending = true;

  state.statusMessage =
    'Enviando pedido...';

  render();

  const items =
    state.cart.map((item) => ({
      product_id:
        item.product.id,

      quantity:
        item.quantity,

      // O banco Safe4 recalcula nome/preço e valida os complementos.
      // O cliente envia somente os identificadores necessários.
      complements:
        item.complements.map(
          (comp) => ({
            id: comp.id,
          })
        ),
    }));

  console.log(
    'Enviando pedido:',
    {
      tableId:
        state.table.id,

      tableName:
        state.table.name,

      customerName,

      customerPhone,

      items,

      total:
        cartTotal(),
    }
  );

  const {
    data,
    error,
  } =
    await state.supabase.rpc(
      'submit_public_customer_order',
      {
        p_table_id:
          Number(state.table.id),

        p_table_code:
          state.table.code,

        p_table_name:
          state.table.name,

        p_customer_name:
          customerName,

        p_customer_phone:
          customerPhone,

        p_items:
          items,

        p_total:
          cartTotal(),
      }
    );

  state.sending = false;

  if (error) {
    console.error(
      'Erro ao enviar pedido:',
      error
    );

    /*
     * LOJA FECHADA
     */
    if (
      String(
        error.message || ''
      ).includes(
        'ONLINE_ORDERING_CLOSED'
      )
    ) {
      state.serviceClosed = true;

      state.cart = [];

      state.step = 'intro';

      state.statusMessage =
        'Loja fechada no momento.';

      render();
      return;
    }

    /*
     * NOME INVÁLIDO
     */
    if (
      String(
        error.message || ''
      ).includes(
        'INVALID_CUSTOMER_NAME'
      )
    ) {
      state.step = 'intro';

      state.statusMessage =
        'Informe seu nome antes de enviar o pedido.';

      render();
      return;
    }

    if (
      String(error.message || '').includes('INVALID_TABLE_QR') ||
      String(error.message || '').includes('INVALID_TABLE')
    ) {
      state.error =
        'Este QR Code não é válido para esta mesa. Solicite um novo QR Code ao estabelecimento.';
      render();
      return;
    }

    if (String(error.message || '').includes('RATE_LIMITED')) {
      state.statusMessage =
        'Muitos pedidos em pouco tempo. Aguarde um momento e tente novamente.';
      render();
      return;
    }

    if (String(error.message || '').includes('PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK')) {
      state.statusMessage =
        'Um dos produtos ficou indisponível. Atualize o cardápio e tente novamente.';
      render();
      return;
    }

    if (String(error.message || '').includes('INVALID_COMPLEMENT')) {
      state.statusMessage =
        'Um dos complementos selecionados não está mais disponível. Atualize o pedido.';
      render();
      return;
    }

    /*
     * OUTRO ERRO
     */
    state.statusMessage =
      'Erro ao enviar o pedido. Tente novamente.';

    render();
    return;
  }

  console.log(
    'Pedido criado:',
    data
  );

  state.step = 'sent';

  state.cart = [];

  state.statusMessage =
    'Pedido enviado com sucesso.';

  render();
}

async function loadData() {
  const route =
    readRoute();

  if (!route) {
    // ── MODO PREVIEW (sem rota de mesa) ──────────────────────────────
    // Carrega dados fictícios para visualizar o design localmente.
    // Em produção, o QR Code sempre fornece a rota correta.
    state.loading = false;
    state.table = { id: 0, name: 'Mesa 1 (Preview)', code: 'demo' };
    state.storeName = 'Pastelaria Demo';
    state.logoEmoji = '🥟';
    state.logoUrl = null;
    state.categories = ['Pastéis', 'Bebidas', 'Sobremesas'];
    state.products = [
      { id: 'p1', name: 'Pastel de Carne', description: 'Carne moída temperada, ovo e azeitona.', price: 12.9, category: 'Pastéis', stock: 10, image: '' },
      { id: 'p2', name: 'Pastel de Queijo', description: 'Queijo mussarela derretido, crocante e saboroso.', price: 11.5, category: 'Pastéis', stock: 8, image: '' },
      { id: 'p3', name: 'Pastel de Frango', description: 'Frango desfiado com catupiry e milho.', price: 13.5, category: 'Pastéis', stock: 6, image: '' },
      { id: 'p4', name: 'Pastel de Pizza', description: 'Molho de tomate, mussarela e azeitona.', price: 12.0, category: 'Pastéis', stock: 5, image: '' },
      { id: 'p5', name: 'Caldo de Cana', description: 'Fresquinho, natural e gelado.', price: 6.0, category: 'Bebidas', stock: 20, image: '' },
      { id: 'p6', name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná ou Sprite.', price: 5.5, category: 'Bebidas', stock: 15, image: '' },
      { id: 'p7', name: 'Água Mineral', description: '500ml com ou sem gás.', price: 3.0, category: 'Bebidas', stock: 30, image: '' },
      { id: 'p8', name: 'Pastel Doce Nutella', description: 'Recheado com Nutella e morango.', price: 15.0, category: 'Sobremesas', stock: 4, image: '' },
    ];
    state.statusMessage = '🎨 Modo preview — conecte ao Supabase para uso real.';
    state.customerName = 'Visitante';
    state.step = 'menu';
    render();
    return;
    // ────────────────────────────────────────────────────────────────
  }

  try {
    state.supabase =
      getClient();

    const [
      tableResult,
      productsResult,
      categoriesResult,
      settingsResult,
    ] =
      await Promise.all([
        state.supabase.rpc(
          'get_public_table_by_qr',
          {
            p_table_id:
              route.tableId,

            p_table_code:
              route.tableCode,
          }
        ),

        state.supabase.rpc(
          'get_public_menu_products'
        ),

        state.supabase.rpc(
          'get_public_menu_categories'
        ),

        state.supabase.rpc(
          'get_public_store_settings'
        ),
      ]);

    if (tableResult.error) {
      throw tableResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    if (categoriesResult.error) {
      throw categoriesResult.error;
    }

    if (settingsResult.error) {
      throw settingsResult.error;
    }

    const table =
      tableResult.data?.[0];

    if (!table) {
      state.loading = false;

      state.error =
        'Mesa não encontrada. Verifique se o QR Code foi gerado corretamente.';

      render();

      return;
    }

    state.table = {
      id: Number(table.id),
      name: table.name,
      code: route.tableCode,
    };

    state.products =
      (productsResult.data ?? [])
        .map((product) => ({
          id: product.id,

          name: product.name,

          description:
            product.description ?? '',

          price:
            Number(product.price),

          category:
            product.category,

          stock:
            Number(product.stock),

          image:
            product.image ?? '',
        }));

    const sortMap =
      new Map(
        (categoriesResult.data ?? [])
          .map(
            (item) => [
              item.name,
              Number(
                item.sort_order
              ),
            ]
          )
      );

    const categories =
      new Set([
        ...(categoriesResult.data ?? [])
          .map(
            (item) =>
              item.name
          ),

        ...state.products.map(
          (item) =>
            item.category
        ),
      ]);

    state.categories =
      [...categories].sort(
        (a, b) =>
          (sortMap.get(a) ??
            999) -
          (sortMap.get(b) ??
            999)
      );

    const settings =
      settingsResult.data?.[0];

    if (settings) {
      state.storeName =
        settings.store_name ??
        state.storeName;

      state.logoEmoji =
        settings.logo_emoji ??
        state.logoEmoji;

      state.logoUrl =
        settings.logo_url ??
        null;

      /*
       * IMPORTANTE:
       *
       * Se sua função pública não retorna
       * online_ordering_enabled, isso ficará
       * simplesmente como undefined.
       */
      if (
        settings.online_ordering_enabled ===
        false
      ) {
        state.loading = false;

        state.serviceClosed =
          true;

        state.products = [];

        state.categories = [];

        state.cart = [];

        render();

        return;
      }
    }

    state.loading = false;

    /*
     * IMPORTANTE:
     *
     * Agora começa na tela de
     * identificação.
     */
    state.step = 'intro';

    state.statusMessage =
      'Informe seu nome e celular para continuar.';

    render();

  } catch (error) {
    console.error(error);

    state.loading = false;

    const authMessage =
      getSupabaseAuthErrorMessage(
        error
      );

    state.error =
      error instanceof Error &&
        error.message.includes(
          'VITE_SUPABASE'
        )
        ? error.message
        : authMessage ||
        'Não foi possível carregar o cardápio agora. Tente novamente em instantes.';

    render();
  }
}

render();

loadData();

