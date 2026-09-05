(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function c(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=c(n);fetch(n.href,s)}})();const b=document.querySelector("#app"),e={loading:!0,error:"",serviceClosed:!1,step:"intro",table:null,storeName:"Cardápio Digital",logoEmoji:"🥟",logoUrl:null,products:[],categories:[],cart:[],selectedProductId:null,selectedComplementIds:new Set,productComplements:{},customerName:"",customerPhone:"",sending:!1,statusMessage:"Informe seu nome e celular para continuar.",supabase:null};function C(a){return String(a||"").replace(/\D/g,"").slice(0,11)}function I(a){const t=C(a);return t.length<=2?t:t.length<=6?`(${t.slice(0,2)}) ${t.slice(2)}`:t.length<=10?`(${t.slice(0,2)}) ${t.slice(2,6)}-${t.slice(6)}`:`(${t.slice(0,2)}) ${t.slice(2,7)}-${t.slice(7)}`}function h(a){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(a)||0)}function o(a){return String(a??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function A(){const c=(new URLSearchParams(window.location.search).get("path")||window.location.pathname).trim().split("/").filter(Boolean),r=c.indexOf("mesa");if(r===-1||c.length<r+3)return null;const n=Number(c[r+1]),s=c[r+2];return!Number.isInteger(n)||!s?null:{tableId:n,tableCode:s}}function y(a,t=[]){return`${a}:${t.map(c=>c.id).sort().join(",")}`}function _(){return e.cart.reduce((a,t)=>a+t.quantity,0)}function S(){return e.cart.reduce((a,t)=>{const c=t.complements.reduce((r,n)=>r+Number(n.price||0),0);return a+(Number(t.product.price)+c)*t.quantity},0)}function P(a){return(e.productComplements[String(a)]||[]).filter(c=>e.selectedComplementIds.has(String(c.id)))}function L(a){return e.cart.reduce((t,c)=>String(c.product.id)===String(a)?t+c.quantity:t,0)}async function E(a){const t=String(a);if(e.productComplements[t])return e.productComplements[t];if(!e.supabase)return e.productComplements[t]=[],[];const{data:c,error:r}=await e.supabase.rpc("get_public_product_complements",{p_product_id:a});if(r)throw r;return e.productComplements[t]=(c||[]).map(n=>({id:n.id,name:n.name,price:Number(n.price||0)})),e.productComplements[t]}function M(a,t=[]){if(L(a.id)>=Number(a.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",l();return}const r=y(a.id,t),n=e.cart.find(s=>y(s.product.id,s.complements)===r);n?n.quantity+=1:e.cart.push({product:a,quantity:1,complements:t}),e.statusMessage=t.length>0?"Produto com complementos adicionado ao carrinho.":"Produto adicionado ao carrinho.",e.selectedProductId=null,e.selectedComplementIds=new Set,l()}function w(){throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.")}function x(a){var r;const t=String((a==null?void 0:a.message)||"").toLowerCase();return Number((a==null?void 0:a.status)||((r=a==null?void 0:a.context)==null?void 0:r.status)||0)===401||t.includes("invalid api key")||t.includes("apikey")?"A chave do Supabase configurada na Vercel não corresponde a este banco. Atualize VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.":""}function f(){return`
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
  `}function T(){if(!e.selectedProductId)return"";const a=e.products.find(i=>String(i.id)===String(e.selectedProductId));if(!a)return"";const t=Number(a.stock)>0,c=e.productComplements[String(a.id)]||[],n=P(a.id).reduce((i,u)=>i+Number(u.price||0),0),s=Number(a.maxComplements||0),d=s>0;return`
    <div class="product-modal-backdrop" data-action="close-product">
      <section
        class="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label="${o(a.name)}"
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
          ${a.image?`
              <img
                src="${o(a.image)}"
                alt="${o(a.name)}"
              >
            `:`
              <span>
                ${o(a.name.slice(0,1).toUpperCase())}
              </span>
            `}
        </div>

        <div class="product-modal-body">
          <p class="eyebrow">Detalhes do produto</p>

          <h2 class="product-modal-title">
            ${o(a.name)}
          </h2>

          ${a.description?`
              <p class="product-modal-description">
                ${o(a.description)}
              </p>
            `:""}

          ${c.length?`
              <div class="complements-box">
                <p class="complements-title">
                  Complementos
                </p>

                ${d?`
                    <p class="complements-limit">
                      Escolha ate ${s}
                    </p>
                  `:""}

                <div class="complements-list">
                  ${c.map(i=>{const u=e.selectedComplementIds.has(String(i.id)),p=d&&!u&&e.selectedComplementIds.size>=s;return`
                      <label class="complement-option ${p?"is-disabled":""}">
                        <input
                          type="checkbox"
                          data-action="toggle-complement"
                          data-complement-id="${o(i.id)}"
                          ${u?"checked":""}
                          ${p?"disabled":""}
                        >
                        <span>${o(i.name)}</span>
                        <strong>+ ${h(i.price)}</strong>
                      </label>
                    `}).join("")}
                </div>
              </div>
            `:""}

          <div class="product-modal-total">
            <span>Total unitario</span>
            <strong>${h(Number(a.price)+n)}</strong>
          </div>

          ${t?`
              <button
                type="button"
                class="primary-button"
                data-action="confirm-product-add"
                data-product-id="${o(a.id)}"
              >
                Adicionar ao carrinho
              </button>
            `:""}
        </div>
      </section>
    </div>
  `}function l(){var r,n,s,d;if(!b)return;if(e.loading){b.innerHTML=`
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
              ${o(e.error)}
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
                      src="${o(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${o(e.logoEmoji)}
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
                      src="${o(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${o(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <h1
              class="store-title"
              style="text-align:center;"
            >
              ${o(e.storeName)}
            </h1>

            <p
              class="store-subtitle"
              style="text-align:center;"
            >
              ${o(((r=e.table)==null?void 0:r.name)||"Mesa")}
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
                  value="${o(e.customerName)}"
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
                  value="${o(e.customerPhone)}"
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
                    ${o(e.statusMessage)}
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
                      src="${o(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${o(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <strong>
              Pedido enviado!
            </strong>

            <p class="muted">
              Obrigado,
              ${o(e.customerName)}.
              Seu pedido foi registrado e está
              aguardando aprovação.
            </p>

            <p class="muted">
              ${o(((n=e.table)==null?void 0:n.name)||"Mesa")}
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
    `,v();return}if(e.step==="cart"){const i=e.cart.map(u=>{const p=u.complements.reduce((g,m)=>g+Number(m.price||0),0);return`
          <article class="cart-item">

            <div class="cart-image">
              ${u.product.image?`
                    <img
                      src="${o(u.product.image)}"
                      alt="${o(u.product.name)}"
                    >
                  `:""}
            </div>

            <div class="cart-main">

              <p class="cart-name">
                ${o(u.product.name)}
              </p>

              ${u.complements.length?`
                    <p class="cart-meta">
                      +
                      ${u.complements.map(g=>o(g.name)).join(", ")}
                    </p>
                  `:""}

              <p class="cart-price">
                ${h((Number(u.product.price)+p)*u.quantity)}
              </p>

            </div>

            <div class="cart-controls">

              <button
                type="button"
                class="mini-button"
                data-action="decrease-cart"
                data-key="${o(y(u.product.id,u.complements))}"
              >
                -
              </button>

              <span class="mini-count">
                ${u.quantity}
              </span>

              <button
                type="button"
                class="mini-button"
                data-action="increase-cart"
                data-key="${o(y(u.product.id,u.complements))}"
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
                        src="${o(e.logoUrl)}"
                        alt="Logo"
                      >
                    `:`
                      <span>
                        ${o(e.logoEmoji)}
                      </span>
                    `}

              </div>

              <div>

                <h1 class="store-title">
                  ${o(e.storeName)}
                </h1>

                <p class="store-subtitle">
                  ${o(((s=e.table)==null?void 0:s.name)||"Mesa")}
                  •
                  ${o(e.customerName)}
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

              ${i||'<div class="empty-box">Carrinho vazio.</div>'}

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
                  ${h(S())}
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
              ${o(e.statusMessage)}
            </p>

          </section>

        </section>

        ${f()}

      </main>
    `,v();return}const a=e.categories.map(i=>{const u=e.products.filter(p=>p.category===i);return u.length?`
        <section class="category">

          <h3 class="category-title">
            ${o(i)}
          </h3>

          <div class="products">

            ${u.map(p=>{const g=e.cart.find(N=>N.product.id===p.id&&N.complements.length===0),m=g?g.quantity:0,$=Number(p.stock)>0;return`
                  <article class="product-card">

                    <button
                      type="button"
                      class="product-image product-image-button"
                      data-action="open-product"
                      data-product-id="${o(p.id)}"
                      aria-label="Ver detalhes de ${o(p.name)}"
                    >

                      ${p.image?`
                            <img
                              src="${o(p.image)}"
                              alt="${o(p.name)}"
                            >
                          `:`
                            <span>
                              ${o(p.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </button>

                    <div class="product-main">

                      <p class="product-name">
                        ${o(p.name)}
                      </p>

                      ${p.description?`
                            <p class="product-desc">
                              ${o(p.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${$?h(p.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${$?m>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${o(p.id)}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${m}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${o(p.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${o(p.id)}"
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
      `:""}).join(""),t=e.products.filter(i=>!e.categories.includes(i.category)),c=t.length?`
        <section class="category">

          <h3 class="category-title">
            Outros
          </h3>

          <div class="products">

            ${t.map(i=>{const u=e.cart.find(m=>m.product.id===i.id&&m.complements.length===0),p=u?u.quantity:0,g=Number(i.stock)>0;return`
                  <article class="product-card">

                    <button
                      type="button"
                      class="product-image product-image-button"
                      data-action="open-product"
                      data-product-id="${o(i.id)}"
                      aria-label="Ver detalhes de ${o(i.name)}"
                    >

                      ${i.image?`
                            <img
                              src="${o(i.image)}"
                              alt="${o(i.name)}"
                            >
                          `:`
                            <span>
                              ${o(i.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </button>

                    <div class="product-main">

                      <p class="product-name">
                        ${o(i.name)}
                      </p>

                      ${i.description?`
                            <p class="product-desc">
                              ${o(i.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${g?h(i.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${g?p>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${o(i.id)}"
                              >
                                -
                              </button>

                              <span class="mini-count">
                                ${p}
                              </span>

                              <button
                                type="button"
                                class="mini-button"
                                data-action="increase-product"
                                data-product-id="${o(i.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${o(i.id)}"
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
                      src="${o(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${o(e.logoEmoji)}
                    </span>
                  `}

            </div>

            <div>

              <h1 class="store-title">
                ${o(e.storeName)}
              </h1>

              <p class="store-subtitle">
                ${o(((d=e.table)==null?void 0:d.name)||"Mesa")}
                •
                ${o(e.customerName)}
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

            ${a}

            ${c}

            ${!a&&!c?`
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
                  ${h(S())}
                </strong>
              </button>
            `:""}

        <section class="status-panel">

          <p class="status-label">
            Status
          </p>

          <p class="status-message">
            ${o(e.statusMessage)}
          </p>

        </section>

      </section>

      ${T()}

      ${f()}

    </main>
  `,v()}function v(){const a=document.querySelector("#customer-name"),t=document.querySelector("#customer-phone"),c=document.querySelector("#customer-form");document.querySelectorAll(".product-modal").forEach(r=>{r.addEventListener("click",n=>n.stopPropagation())}),a&&a.addEventListener("input",r=>{e.customerName=r.target.value}),t&&t.addEventListener("input",r=>{e.customerPhone=I(r.target.value),r.target.value=e.customerPhone}),c&&c.addEventListener("submit",r=>{r.preventDefault();const n=e.customerName.trim(),s=C(e.customerPhone);if(!n){e.statusMessage="Informe seu nome para continuar.",l();return}if(s.length<10){e.statusMessage="Informe um celular válido para continuar.",l();return}e.customerName=n,e.customerPhone=I(s),e.step="menu",e.statusMessage=`Olá, ${n}! Escolha seus produtos.`,l()}),document.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",q)})}async function q(a){const t=a.currentTarget.getAttribute("data-action"),c=a.currentTarget.getAttribute("data-product-id"),r=a.currentTarget.getAttribute("data-key"),n=a.currentTarget.getAttribute("data-complement-id");if(t==="new-order"){e.cart=[],e.step="menu",e.statusMessage="Escolha seus produtos.",l();return}if(t==="back-menu"){e.step="menu",l();return}if(t==="open-cart"){e.selectedProductId=null,e.selectedComplementIds=new Set,e.step="cart",l();return}if(t==="open-product"){const s=e.products.find(d=>String(d.id)===String(c));if(s){try{await E(s.id)}catch{e.statusMessage="Nao foi possivel carregar os complementos deste produto."}e.selectedComplementIds=new Set,e.selectedProductId=s.id,l()}return}if(t==="close-product"){e.selectedProductId=null,e.selectedComplementIds=new Set,l();return}if(t==="toggle-complement"){if(!n||!e.selectedProductId)return;const s=e.products.find(u=>String(u.id)===String(e.selectedProductId)),d=Number((s==null?void 0:s.maxComplements)||0),i=new Set(e.selectedComplementIds);i.has(String(n))?i.delete(String(n)):(d===0||i.size<d)&&i.add(String(n)),e.selectedComplementIds=i,l();return}if(t==="send-order"){await k();return}if(t==="add-product"||t==="increase-product"){const s=e.products.find(d=>String(d.id)===String(c));if(!s)return;if(t==="add-product")try{if((await E(s.id)).length>0){e.selectedComplementIds=new Set,e.selectedProductId=s.id,l();return}}catch{e.statusMessage="Nao foi possivel carregar os complementos deste produto.",l();return}M(s,[]);return}if(t==="confirm-product-add"){const s=e.products.find(d=>String(d.id)===String(c));if(!s)return;M(s,P(s.id));return}if(t==="decrease-product"){const s=e.cart.find(d=>String(d.product.id)===String(c)&&d.complements.length===0);if(!s)return;s.quantity-=1,e.cart=e.cart.filter(d=>d.quantity>0),l();return}if(t==="increase-cart"||t==="decrease-cart"){const s=e.cart.find(d=>y(d.product.id,d.complements)===r);if(!s)return;if(t==="increase-cart"&&s.quantity>=Number(s.product.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",l();return}t==="increase-cart"?s.quantity+=1:s.quantity-=1,e.cart=e.cart.filter(d=>d.quantity>0),l()}}async function k(){if(!e.supabase||!e.table||e.cart.length===0)return;const a=String(e.customerName||"").replace(/<[^>]*>/g,"").replace(/[\x00-\x1F\x7F]/g,"").trim(),t=C(e.customerPhone);if(!a){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",l();return}if(t.length<10){e.step="intro",e.statusMessage="Informe um celular válido antes de enviar o pedido.",l();return}e.sending=!0,e.statusMessage="Enviando pedido...",l();const c=e.cart.map(s=>({product_id:s.product.id,quantity:s.quantity,complements:s.complements.map(d=>({id:d.id}))}));console.log("Enviando pedido:",{tableId:e.table.id,tableName:e.table.name,customerName:a,customerPhone:t,items:c,total:S()});const{data:r,error:n}=await e.supabase.rpc("submit_public_customer_order",{p_table_id:Number(e.table.id),p_table_code:e.table.code,p_table_name:e.table.name,p_customer_name:a,p_customer_phone:t,p_items:c,p_total:S()});if(e.sending=!1,n){if(console.error("Erro ao enviar pedido:",n),String(n.message||"").includes("ONLINE_ORDERING_CLOSED")){e.serviceClosed=!0,e.cart=[],e.step="intro",e.statusMessage="Loja fechada no momento.",l();return}if(String(n.message||"").includes("INVALID_CUSTOMER_NAME")){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",l();return}if(String(n.message||"").includes("INVALID_TABLE_QR")||String(n.message||"").includes("INVALID_TABLE")){e.error="Este QR Code não é válido para esta mesa. Solicite um novo QR Code ao estabelecimento.",l();return}if(String(n.message||"").includes("RATE_LIMITED")){e.statusMessage="Muitos pedidos em pouco tempo. Aguarde um momento e tente novamente.",l();return}if(String(n.message||"").includes("PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK")){e.statusMessage="Um dos produtos ficou indisponível. Atualize o cardápio e tente novamente.",l();return}if(String(n.message||"").includes("TOO_MANY_COMPLEMENTS")){e.statusMessage="Este produto permite menos complementos do que foi selecionado. Revise os complementos e tente novamente.",l();return}if(String(n.message||"").includes("INVALID_COMPLEMENT")){e.statusMessage="Um dos complementos selecionados não está mais disponível. Atualize o pedido.",l();return}e.statusMessage="Erro ao enviar o pedido. Tente novamente.",l();return}console.log("Pedido criado:",r),e.step="sent",e.cart=[],e.statusMessage="Pedido enviado com sucesso.",l()}async function U(){var t,c;const a=A();if(!a){e.loading=!1,e.table={id:0,name:"Mesa 1 (Preview)",code:"demo"},e.storeName="Pastelaria Demo",e.logoEmoji="🥟",e.logoUrl=null,e.categories=["Pastéis","Bebidas","Sobremesas"],e.products=[{id:"p1",name:"Pastel de Carne",description:"Carne moída temperada, ovo e azeitona.",price:12.9,category:"Pastéis",stock:10,image:""},{id:"p2",name:"Pastel de Queijo",description:"Queijo mussarela derretido, crocante e saboroso.",price:11.5,category:"Pastéis",stock:8,image:""},{id:"p3",name:"Pastel de Frango",description:"Frango desfiado com catupiry e milho.",price:13.5,category:"Pastéis",stock:6,image:""},{id:"p4",name:"Pastel de Pizza",description:"Molho de tomate, mussarela e azeitona.",price:12,category:"Pastéis",stock:5,image:""},{id:"p5",name:"Caldo de Cana",description:"Fresquinho, natural e gelado.",price:6,category:"Bebidas",stock:20,image:""},{id:"p6",name:"Refrigerante Lata",description:"Coca-Cola, Guaraná ou Sprite.",price:5.5,category:"Bebidas",stock:15,image:""},{id:"p7",name:"Água Mineral",description:"500ml com ou sem gás.",price:3,category:"Bebidas",stock:30,image:""},{id:"p8",name:"Pastel Doce Nutella",description:"Recheado com Nutella e morango.",price:15,category:"Sobremesas",stock:4,image:""}],e.statusMessage="🎨 Modo preview — conecte ao Supabase para uso real.",e.customerName="Visitante",e.step="menu",l();return}try{e.supabase=w();const[r,n,s,d]=await Promise.all([e.supabase.rpc("get_public_table_by_qr",{p_table_id:a.tableId,p_table_code:a.tableCode}),e.supabase.rpc("get_public_menu_products"),e.supabase.rpc("get_public_menu_categories"),e.supabase.rpc("get_public_store_settings")]);if(r.error)throw r.error;if(n.error)throw n.error;if(s.error)throw s.error;if(d.error)throw d.error;const i=(t=r.data)==null?void 0:t[0];if(!i){e.loading=!1,e.error="Mesa não encontrada. Verifique se o QR Code foi gerado corretamente.",l();return}e.table={id:Number(i.id),name:i.name,code:a.tableCode},e.products=(n.data??[]).map(m=>({id:m.id,name:m.name,description:m.description??"",price:Number(m.price),category:m.category,stock:Number(m.stock),image:m.image??"",maxComplements:Number(m.max_complements??0)}));const u=new Map((s.data??[]).map(m=>[m.name,Number(m.sort_order)])),p=new Set([...(s.data??[]).map(m=>m.name),...e.products.map(m=>m.category)]);e.categories=[...p].sort((m,$)=>(u.get(m)??999)-(u.get($)??999));const g=(c=d.data)==null?void 0:c[0];if(g&&(e.storeName=g.store_name??e.storeName,e.logoEmoji=g.logo_emoji??e.logoEmoji,e.logoUrl=g.logo_url??null,g.online_ordering_enabled===!1)){e.loading=!1,e.serviceClosed=!0,e.products=[],e.categories=[],e.cart=[],l();return}e.loading=!1,e.step="intro",e.statusMessage="Informe seu nome e celular para continuar.",l()}catch(r){console.error(r),e.loading=!1;const n=x(r);e.error=r instanceof Error&&r.message.includes("VITE_SUPABASE")?r.message:n||"Não foi possível carregar o cardápio agora. Tente novamente em instantes.",l()}}l();U();
