(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&n(m)}).observe(document,{childList:!0,subtree:!0});function i(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(t){if(t.ep)return;t.ep=!0;const r=i(t);fetch(t.href,r)}})();const b=document.querySelector("#app"),e={loading:!0,error:"",serviceClosed:!1,step:"intro",table:null,storeName:"Cardápio Digital",logoEmoji:"🥟",logoUrl:null,products:[],categories:[],cart:[],selectedProductId:null,customerName:"",customerPhone:"",sending:!1,statusMessage:"Informe seu nome e celular para continuar.",supabase:null};function E(o){return String(o||"").replace(/\D/g,"").slice(0,11)}function M(o){const s=E(o);return s.length<=2?s:s.length<=6?`(${s.slice(0,2)}) ${s.slice(2)}`:s.length<=10?`(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`:`(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`}function h(o){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(o)||0)}function a(o){return String(o??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function P(){const i=(new URLSearchParams(window.location.search).get("path")||window.location.pathname).trim().split("/").filter(Boolean),n=i.indexOf("mesa");if(n===-1||i.length<n+3)return null;const t=Number(i[n+1]),r=i[n+2];return!Number.isInteger(t)||!r?null:{tableId:t,tableCode:r}}function S(o,s=[]){return`${o}:${s.map(i=>i.id).sort().join(",")}`}function _(){return e.cart.reduce((o,s)=>o+s.quantity,0)}function $(){return e.cart.reduce((o,s)=>{const i=s.complements.reduce((n,t)=>n+Number(t.price||0),0);return o+(Number(s.product.price)+i)*s.quantity},0)}function I(){throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.")}function A(o){var n;const s=String((o==null?void 0:o.message)||"").toLowerCase();return Number((o==null?void 0:o.status)||((n=o==null?void 0:o.context)==null?void 0:n.status)||0)===401||s.includes("invalid api key")||s.includes("apikey")?"A chave do Supabase configurada na Vercel não corresponde a este banco. Atualize VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.":""}function f(){return`
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
  `}function L(){if(!e.selectedProductId)return"";const o=e.products.find(i=>String(i.id)===String(e.selectedProductId));if(!o)return"";const s=Number(o.stock)>0;return`
    <div class="product-modal-backdrop" data-action="close-product">
      <section
        class="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label="${a(o.name)}"
      >
        <button
          type="button"
          class="product-modal-close"
          data-action="close-product"
          aria-label="Fechar detalhes do produto"
        >
          ×
        </button>

        <div class="product-modal-image">
          ${o.image?`
              <img
                src="${a(o.image)}"
                alt="${a(o.name)}"
              >
            `:`
              <span>
                ${a(o.name.slice(0,1).toUpperCase())}
              </span>
            `}
        </div>

        <div class="product-modal-body">
          <p class="eyebrow">Detalhes do produto</p>

          <h2 class="product-modal-title">
            ${a(o.name)}
          </h2>

          ${o.description?`
              <p class="product-modal-description">
                ${a(o.description)}
              </p>
            `:""}
            </span>
          </div>

          ${s?`
              <button
                type="button"
                class="primary-button"
                data-action="add-product"
                data-product-id="${a(o.id)}"
              >
                Adicionar ao carrinho
              </button>
            `:""}
        </div>
      </section>
    </div>
  `}function c(){var n,t,r,m;if(!b)return;if(e.loading){b.innerHTML=`
      <main class="shell">
        <section class="page">
          <div class="loading card">
            <strong>Carregando cardápio...</strong>

            <p class="muted">
              Estamos validando a mesa e buscando os produtos.
            </p>
          </div>
        </section>

        ${f()}

      </main>
    `,v();return}if(e.error){b.innerHTML=`
      <main class="shell">
        <section class="page">
          <div class="error card">

            <strong>
              Não foi possível abrir a mesa
            </strong>

            <p class="muted">
              ${a(e.error)}
            </p>

          </div>
        </section>

        ${f()}

      </main>
    `,v();return}if(e.serviceClosed){b.innerHTML=`
      <main class="shell">
        <section class="page">

          <div class="error card">

            <div
              class="store-logo"
              style="margin-bottom: 14px;"
            >
              ${e.logoUrl?`
                    <img
                      src="${a(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${a(e.logoEmoji)}
                    </span>
                  `}
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

        ${f()}

      </main>
    `,v();return}if(e.step==="intro"){b.innerHTML=`
      <main class="shell">
        <section class="page">

          <div class="card login-card">

            <div
              class="store-logo"
              style="margin: 0 auto 16px;"
            >
              ${e.logoUrl?`
                    <img
                      src="${a(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${a(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <h1
              class="store-title"
              style="text-align:center;"
            >
              ${a(e.storeName)}
            </h1>

            <p
              class="store-subtitle"
              style="text-align:center;"
            >
              ${a(((n=e.table)==null?void 0:n.name)||"Mesa")}
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
                  value="${a(e.customerName)}"
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
                  value="${a(e.customerPhone)}"
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

            ${e.statusMessage?`
                  <p
                    class="status-message"
                    style="
                      text-align:center;
                      margin-top:14px;
                    "
                  >
                    ${a(e.statusMessage)}
                  </p>
                `:""}

          </div>

        </section>

        ${f()}

      </main>
    `,v();return}if(e.step==="sent"){b.innerHTML=`
      <main class="shell">
        <section class="page">

          <div class="sent card">

            <div
              class="store-logo"
              style="margin:0 auto 16px;"
            >
              ${e.logoUrl?`
                    <img
                      src="${a(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${a(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <strong>
              Pedido enviado!
            </strong>

            <p class="muted">
              Obrigado,
              ${a(e.customerName)}.
              Seu pedido foi registrado e está
              aguardando aprovação.
            </p>

            <p class="muted">
              ${a(((t=e.table)==null?void 0:t.name)||"Mesa")}
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

        ${f()}

      </main>
    `,v();return}if(e.step==="cart"){const l=e.cart.map(p=>{const d=p.complements.reduce((g,u)=>g+Number(u.price||0),0);return`
          <article class="cart-item">

            <div class="cart-image">
              ${p.product.image?`
                    <img
                      src="${a(p.product.image)}"
                      alt="${a(p.product.name)}"
                    >
                  `:""}
            </div>

            <div class="cart-main">

              <p class="cart-name">
                ${a(p.product.name)}
              </p>

              ${p.complements.length?`
                    <p class="cart-meta">
                      +
                      ${p.complements.map(g=>a(g.name)).join(", ")}
                    </p>
                  `:""}

              <p class="cart-price">
                ${h((Number(p.product.price)+d)*p.quantity)}
              </p>

            </div>

            <div class="cart-controls">

              <button
                type="button"
                class="mini-button"
                data-action="decrease-cart"
                data-key="${a(S(p.product.id,p.complements))}"
              >
                -
              </button>

              <span class="mini-count">
                ${p.quantity}
              </span>

              <button
                type="button"
                class="mini-button"
                data-action="increase-cart"
                data-key="${a(S(p.product.id,p.complements))}"
              >
                +
              </button>

            </div>

          </article>
        `}).join("");b.innerHTML=`
      <main class="shell">
        <section class="page menu-shell">

          <header class="menu-header">

            <div class="store-brand">

              <div class="store-logo">

                ${e.logoUrl?`
                      <img
                        src="${a(e.logoUrl)}"
                        alt="Logo"
                      >
                    `:`
                      <span>
                        ${a(e.logoEmoji)}
                      </span>
                    `}

              </div>

              <div>

                <h1 class="store-title">
                  ${a(e.storeName)}
                </h1>

                <p class="store-subtitle">
                  ${a(((r=e.table)==null?void 0:r.name)||"Mesa")}
                  •
                  ${a(e.customerName)}
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

              ${l||'<div class="empty-box">Carrinho vazio.</div>'}

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
                  ${h($())}
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
                  ${e.sending||e.cart.length===0?"disabled":""}
                >
                  ${e.sending?"Enviando...":"Enviar pedido"}
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
              ${a(e.statusMessage)}
            </p>

          </section>

        </section>

        ${f()}

      </main>
    `,v();return}const o=e.categories.map(l=>{const p=e.products.filter(d=>d.category===l);return p.length?`
        <section class="category">

          <h3 class="category-title">
            ${a(l)}
          </h3>

          <div class="products">

            ${p.map(d=>{const g=e.cart.find(N=>N.product.id===d.id&&N.complements.length===0),u=g?g.quantity:0,y=Number(d.stock)>0;return`
                  <article class="product-card">

                    <button
                      type="button"
                      class="product-image product-image-button"
                      data-action="open-product"
                      data-product-id="${a(d.id)}"
                      aria-label="Ver detalhes de ${a(d.name)}"
                    >

                      ${d.image?`
                            <img
                              src="${a(d.image)}"
                              alt="${a(d.name)}"
                            >
                          `:`
                            <span>
                              ${a(d.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </button>

                    <div class="product-main">

                      <p class="product-name">
                        ${a(d.name)}
                      </p>

                      ${d.description?`
                            <p class="product-desc">
                              ${a(d.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${y?h(d.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${y?u>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${a(d.id)}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${u}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${a(d.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${a(d.id)}"
                              >
                                Adicionar
                              </button>
                            `:`
                            <span class="muted">
                              Sem estoque
                            </span>
                          `}

                    </div>

                  </article>
                `}).join("")}

          </div>

        </section>
      `:""}).join(""),s=e.products.filter(l=>!e.categories.includes(l.category)),i=s.length?`
        <section class="category">

          <h3 class="category-title">
            Outros
          </h3>

          <div class="products">

            ${s.map(l=>{const p=e.cart.find(u=>u.product.id===l.id&&u.complements.length===0),d=p?p.quantity:0,g=Number(l.stock)>0;return`
                  <article class="product-card">

                    <button
                      type="button"
                      class="product-image product-image-button"
                      data-action="open-product"
                      data-product-id="${a(l.id)}"
                      aria-label="Ver detalhes de ${a(l.name)}"
                    >

                      ${l.image?`
                            <img
                              src="${a(l.image)}"
                              alt="${a(l.name)}"
                            >
                          `:`
                            <span>
                              ${a(l.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </button>

                    <div class="product-main">

                      <p class="product-name">
                        ${a(l.name)}
                      </p>

                      ${l.description?`
                            <p class="product-desc">
                              ${a(l.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${g?h(l.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${g?d>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${a(l.id)}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${d}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${a(l.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${a(l.id)}"
                              >
                                Adicionar
                              </button>
                            `:`
                            <span class="muted">
                              Sem estoque
                            </span>
                          `}

                    </div>

                  </article>
                `}).join("")}

          </div>

        </section>
      `:"";b.innerHTML=`
    <main class="shell">

      <section class="page menu-shell">

        <header class="menu-header">

          <div class="store-brand">

            <div class="store-logo">

              ${e.logoUrl?`
                    <img
                      src="${a(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${a(e.logoEmoji)}
                    </span>
                  `}

            </div>

            <div>

              <h1 class="store-title">
                ${a(e.storeName)}
              </h1>

              <p class="store-subtitle">
                ${a(((m=e.table)==null?void 0:m.name)||"Mesa")}
                •
                ${a(e.customerName)}
              </p>

            </div>

          </div>

          <div class="cart-chip">
            Carrinho:
            ${_()}
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

            ${o}

            ${i}

            ${!o&&!i?`
                  <div class="empty-box">
                    Nenhum produto disponível
                    no momento.
                  </div>
                `:""}

          </div>

        </section>

        ${_()>0?`
              <button
                type="button"
                class="floating-cart"
                data-action="open-cart"
              >
                <span>
                  Ver Carrinho
                  (${_()})
                </span>

                <strong>
                  ${h($())}
                </strong>
              </button>
            `:""}

        <section class="status-panel">

          <p class="status-label">
            Status
          </p>

          <p class="status-message">
            ${a(e.statusMessage)}
          </p>

        </section>

      </section>

      ${L()}

      ${f()}

    </main>
  `,v()}function v(){const o=document.querySelector("#customer-name"),s=document.querySelector("#customer-phone"),i=document.querySelector("#customer-form");document.querySelectorAll(".product-modal").forEach(n=>{n.addEventListener("click",t=>t.stopPropagation())}),o&&o.addEventListener("input",n=>{e.customerName=n.target.value}),s&&s.addEventListener("input",n=>{e.customerPhone=M(n.target.value),n.target.value=e.customerPhone}),i&&i.addEventListener("submit",n=>{n.preventDefault();const t=e.customerName.trim(),r=E(e.customerPhone);if(!t){e.statusMessage="Informe seu nome para continuar.",c();return}if(r.length<10){e.statusMessage="Informe um celular válido para continuar.",c();return}e.customerName=t,e.customerPhone=M(r),e.step="menu",e.statusMessage=`Olá, ${t}! Escolha seus produtos.`,c()}),document.querySelectorAll("[data-action]").forEach(n=>{n.addEventListener("click",T)})}async function T(o){const s=o.currentTarget.getAttribute("data-action"),i=o.currentTarget.getAttribute("data-product-id"),n=o.currentTarget.getAttribute("data-key");if(s==="new-order"){e.cart=[],e.step="menu",e.statusMessage="Escolha seus produtos.",c();return}if(s==="back-menu"){e.step="menu",c();return}if(s==="open-cart"){e.selectedProductId=null,e.step="cart",c();return}if(s==="open-product"){const t=e.products.find(r=>String(r.id)===String(i));t&&(e.selectedProductId=t.id,c());return}if(s==="close-product"){e.selectedProductId=null,c();return}if(s==="send-order"){await C();return}if(s==="add-product"||s==="increase-product"){const t=e.products.find(m=>String(m.id)===String(i));if(!t)return;const r=e.cart.find(m=>String(m.product.id)===String(i)&&m.complements.length===0);if(r){if(r.quantity>=Number(t.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",c();return}r.quantity+=1}else e.cart.push({product:t,quantity:1,complements:[]});e.statusMessage="Produto adicionado ao carrinho.",e.selectedProductId=null,c();return}if(s==="decrease-product"){const t=e.cart.find(r=>String(r.product.id)===String(i)&&r.complements.length===0);if(!t)return;t.quantity-=1,e.cart=e.cart.filter(r=>r.quantity>0),c();return}if(s==="increase-cart"||s==="decrease-cart"){const t=e.cart.find(r=>S(r.product.id,r.complements)===n);if(!t)return;if(s==="increase-cart"&&t.quantity>=Number(t.product.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",c();return}s==="increase-cart"?t.quantity+=1:t.quantity-=1,e.cart=e.cart.filter(r=>r.quantity>0),c()}}async function C(){if(!e.supabase||!e.table||e.cart.length===0)return;const o=String(e.customerName||"").replace(/<[^>]*>/g,"").replace(/[\x00-\x1F\x7F]/g,"").trim(),s=E(e.customerPhone);if(!o){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",c();return}if(s.length<10){e.step="intro",e.statusMessage="Informe um celular válido antes de enviar o pedido.",c();return}e.sending=!0,e.statusMessage="Enviando pedido...",c();const i=e.cart.map(r=>({product_id:r.product.id,quantity:r.quantity,complements:r.complements.map(m=>({id:m.id}))}));console.log("Enviando pedido:",{tableId:e.table.id,tableName:e.table.name,customerName:o,customerPhone:s,items:i,total:$()});const{data:n,error:t}=await e.supabase.rpc("submit_public_customer_order",{p_table_id:Number(e.table.id),p_table_code:e.table.code,p_table_name:e.table.name,p_customer_name:o,p_customer_phone:s,p_items:i,p_total:$()});if(e.sending=!1,t){if(console.error("Erro ao enviar pedido:",t),String(t.message||"").includes("ONLINE_ORDERING_CLOSED")){e.serviceClosed=!0,e.cart=[],e.step="intro",e.statusMessage="Loja fechada no momento.",c();return}if(String(t.message||"").includes("INVALID_CUSTOMER_NAME")){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",c();return}if(String(t.message||"").includes("INVALID_TABLE_QR")||String(t.message||"").includes("INVALID_TABLE")){e.error="Este QR Code não é válido para esta mesa. Solicite um novo QR Code ao estabelecimento.",c();return}if(String(t.message||"").includes("RATE_LIMITED")){e.statusMessage="Muitos pedidos em pouco tempo. Aguarde um momento e tente novamente.",c();return}if(String(t.message||"").includes("PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK")){e.statusMessage="Um dos produtos ficou indisponível. Atualize o cardápio e tente novamente.",c();return}if(String(t.message||"").includes("INVALID_COMPLEMENT")){e.statusMessage="Um dos complementos selecionados não está mais disponível. Atualize o pedido.",c();return}e.statusMessage="Erro ao enviar o pedido. Tente novamente.",c();return}console.log("Pedido criado:",n),e.step="sent",e.cart=[],e.statusMessage="Pedido enviado com sucesso.",c()}async function q(){var s,i;const o=P();if(!o){e.loading=!1,e.table={id:0,name:"Mesa 1 (Preview)",code:"demo"},e.storeName="Pastelaria Demo",e.logoEmoji="🥟",e.logoUrl=null,e.categories=["Pastéis","Bebidas","Sobremesas"],e.products=[{id:"p1",name:"Pastel de Carne",description:"Carne moída temperada, ovo e azeitona.",price:12.9,category:"Pastéis",stock:10,image:""},{id:"p2",name:"Pastel de Queijo",description:"Queijo mussarela derretido, crocante e saboroso.",price:11.5,category:"Pastéis",stock:8,image:""},{id:"p3",name:"Pastel de Frango",description:"Frango desfiado com catupiry e milho.",price:13.5,category:"Pastéis",stock:6,image:""},{id:"p4",name:"Pastel de Pizza",description:"Molho de tomate, mussarela e azeitona.",price:12,category:"Pastéis",stock:5,image:""},{id:"p5",name:"Caldo de Cana",description:"Fresquinho, natural e gelado.",price:6,category:"Bebidas",stock:20,image:""},{id:"p6",name:"Refrigerante Lata",description:"Coca-Cola, Guaraná ou Sprite.",price:5.5,category:"Bebidas",stock:15,image:""},{id:"p7",name:"Água Mineral",description:"500ml com ou sem gás.",price:3,category:"Bebidas",stock:30,image:""},{id:"p8",name:"Pastel Doce Nutella",description:"Recheado com Nutella e morango.",price:15,category:"Sobremesas",stock:4,image:""}],e.statusMessage="🎨 Modo preview — conecte ao Supabase para uso real.",e.customerName="Visitante",e.step="menu",c();return}try{e.supabase=I();const[n,t,r,m]=await Promise.all([e.supabase.rpc("get_public_table_by_qr",{p_table_id:o.tableId,p_table_code:o.tableCode}),e.supabase.rpc("get_public_menu_products"),e.supabase.rpc("get_public_menu_categories"),e.supabase.rpc("get_public_store_settings")]);if(n.error)throw n.error;if(t.error)throw t.error;if(r.error)throw r.error;if(m.error)throw m.error;const l=(s=n.data)==null?void 0:s[0];if(!l){e.loading=!1,e.error="Mesa não encontrada. Verifique se o QR Code foi gerado corretamente.",c();return}e.table={id:Number(l.id),name:l.name,code:o.tableCode},e.products=(t.data??[]).map(u=>({id:u.id,name:u.name,description:u.description??"",price:Number(u.price),category:u.category,stock:Number(u.stock),image:u.image??""}));const p=new Map((r.data??[]).map(u=>[u.name,Number(u.sort_order)])),d=new Set([...(r.data??[]).map(u=>u.name),...e.products.map(u=>u.category)]);e.categories=[...d].sort((u,y)=>(p.get(u)??999)-(p.get(y)??999));const g=(i=m.data)==null?void 0:i[0];if(g&&(e.storeName=g.store_name??e.storeName,e.logoEmoji=g.logo_emoji??e.logoEmoji,e.logoUrl=g.logo_url??null,g.online_ordering_enabled===!1)){e.loading=!1,e.serviceClosed=!0,e.products=[],e.categories=[],e.cart=[],c();return}e.loading=!1,e.step="intro",e.statusMessage="Informe seu nome e celular para continuar.",c()}catch(n){console.error(n),e.loading=!1;const t=A(n);e.error=n instanceof Error&&n.message.includes("VITE_SUPABASE")?n.message:t||"Não foi possível carregar o cardápio agora. Tente novamente em instantes.",c()}}c();q();
