(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&n(m)}).observe(document,{childList:!0,subtree:!0});function c(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(t){if(t.ep)return;t.ep=!0;const r=c(t);fetch(t.href,r)}})();const b=document.querySelector("#app"),e={loading:!0,error:"",serviceClosed:!1,step:"intro",table:null,storeName:"Cardápio Digital",logoEmoji:"🥟",logoUrl:null,products:[],categories:[],cart:[],customerName:"",customerPhone:"",sending:!1,statusMessage:"Informe seu nome e celular para continuar.",supabase:null};function N(o){return String(o||"").replace(/\D/g,"").slice(0,11)}function M(o){const a=N(o);return a.length<=2?a:a.length<=6?`(${a.slice(0,2)}) ${a.slice(2)}`:a.length<=10?`(${a.slice(0,2)}) ${a.slice(2,6)}-${a.slice(6)}`:`(${a.slice(0,2)}) ${a.slice(2,7)}-${a.slice(7)}`}function h(o){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(o)||0)}function s(o){return String(o??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function A(){const c=(new URLSearchParams(window.location.search).get("path")||window.location.pathname).trim().split("/").filter(Boolean),n=c.indexOf("mesa");if(n===-1||c.length<n+3)return null;const t=Number(c[n+1]),r=c[n+2];return!Number.isInteger(t)||!r?null:{tableId:t,tableCode:r}}function E(o,a=[]){return`${o}:${a.map(c=>c.id).sort().join(",")}`}function _(){return e.cart.reduce((o,a)=>o+a.quantity,0)}function $(){return e.cart.reduce((o,a)=>{const c=a.complements.reduce((n,t)=>n+Number(t.price||0),0);return o+(Number(a.product.price)+c)*a.quantity},0)}function L(){throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.")}function P(o){var n;const a=String((o==null?void 0:o.message)||"").toLowerCase();return Number((o==null?void 0:o.status)||((n=o==null?void 0:o.context)==null?void 0:n.status)||0)===401||a.includes("invalid api key")||a.includes("apikey")?"A chave do Supabase configurada na Vercel não corresponde a este banco. Atualize VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.":""}function f(){return`
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
  `}function i(){var n,t,r,m;if(!b)return;if(e.loading){b.innerHTML=`
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
              ${s(e.error)}
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
                      src="${s(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${s(e.logoEmoji)}
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
                      src="${s(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${s(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <h1
              class="store-title"
              style="text-align:center;"
            >
              ${s(e.storeName)}
            </h1>

            <p
              class="store-subtitle"
              style="text-align:center;"
            >
              ${s(((n=e.table)==null?void 0:n.name)||"Mesa")}
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
                  value="${s(e.customerName)}"
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
                  value="${s(e.customerPhone)}"
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
                    ${s(e.statusMessage)}
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
                      src="${s(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${s(e.logoEmoji)}
                    </span>
                  `}
            </div>

            <strong>
              Pedido enviado!
            </strong>

            <p class="muted">
              Obrigado,
              ${s(e.customerName)}.
              Seu pedido foi registrado e está
              aguardando aprovação.
            </p>

            <p class="muted">
              ${s(((t=e.table)==null?void 0:t.name)||"Mesa")}
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
    `,v();return}if(e.step==="cart"){const l=e.cart.map(u=>{const p=u.complements.reduce((g,d)=>g+Number(d.price||0),0);return`
          <article class="cart-item">

            <div class="cart-image">
              ${u.product.image?`
                    <img
                      src="${s(u.product.image)}"
                      alt="${s(u.product.name)}"
                    >
                  `:""}
            </div>

            <div class="cart-main">

              <p class="cart-name">
                ${s(u.product.name)}
              </p>

              ${u.complements.length?`
                    <p class="cart-meta">
                      +
                      ${u.complements.map(g=>s(g.name)).join(", ")}
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
                data-key="${s(E(u.product.id,u.complements))}"
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
                data-key="${s(E(u.product.id,u.complements))}"
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
                        src="${s(e.logoUrl)}"
                        alt="Logo"
                      >
                    `:`
                      <span>
                        ${s(e.logoEmoji)}
                      </span>
                    `}

              </div>

              <div>

                <h1 class="store-title">
                  ${s(e.storeName)}
                </h1>

                <p class="store-subtitle">
                  ${s(((r=e.table)==null?void 0:r.name)||"Mesa")}
                  •
                  ${s(e.customerName)}
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
              ${s(e.statusMessage)}
            </p>

          </section>

        </section>

        ${f()}

      </main>
    `,v();return}const o=e.categories.map(l=>{const u=e.products.filter(p=>p.category===l);return u.length?`
        <section class="category">

          <h3 class="category-title">
            ${s(l)}
          </h3>

          <div class="products">

            ${u.map(p=>{const g=e.cart.find(S=>S.product.id===p.id&&S.complements.length===0),d=g?g.quantity:0,y=Number(p.stock)>0;return`
                  <article class="product-card">

                    <div class="product-image">

                      ${p.image?`
                            <img
                              src="${s(p.image)}"
                              alt="${s(p.name)}"
                            >
                          `:`
                            <span>
                              ${s(p.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </div>

                    <div class="product-main">

                      <p class="product-name">
                        ${s(p.name)}
                      </p>

                      ${p.description?`
                            <p class="product-desc">
                              ${s(p.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${y?h(p.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${y?d>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${s(p.id)}"
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
                                data-product-id="${s(p.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${s(p.id)}"
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
      `:""}).join(""),a=e.products.filter(l=>!e.categories.includes(l.category)),c=a.length?`
        <section class="category">

          <h3 class="category-title">
            Outros
          </h3>

          <div class="products">

            ${a.map(l=>{const u=e.cart.find(d=>d.product.id===l.id&&d.complements.length===0),p=u?u.quantity:0,g=Number(l.stock)>0;return`
                  <article class="product-card">

                    <div class="product-image">

                      ${l.image?`
                            <img
                              src="${s(l.image)}"
                              alt="${s(l.name)}"
                            >
                          `:`
                            <span>
                              ${s(l.name.slice(0,1).toUpperCase())}
                            </span>
                          `}

                    </div>

                    <div class="product-main">

                      <p class="product-name">
                        ${s(l.name)}
                      </p>

                      ${l.description?`
                            <p class="product-desc">
                              ${s(l.description)}
                            </p>
                          `:""}

                      <div class="product-price">
                        ${g?h(l.price):"Indisponível"}
                      </div>

                    </div>

                    <div class="product-actions">

                      ${g?p>0?`
                              <button
                                type="button"
                                class="mini-button"
                                data-action="decrease-product"
                                data-product-id="${s(l.id)}"
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
                                data-product-id="${s(l.id)}"
                              >
                                +
                              </button>
                            `:`
                              <button
                                type="button"
                                class="secondary-button"
                                data-action="add-product"
                                data-product-id="${s(l.id)}"
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
                      src="${s(e.logoUrl)}"
                      alt="Logo"
                    >
                  `:`
                    <span>
                      ${s(e.logoEmoji)}
                    </span>
                  `}

            </div>

            <div>

              <h1 class="store-title">
                ${s(e.storeName)}
              </h1>

              <p class="store-subtitle">
                ${s(((m=e.table)==null?void 0:m.name)||"Mesa")}
                •
                ${s(e.customerName)}
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

            ${c}

            ${!o&&!c?`
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
            ${s(e.statusMessage)}
          </p>

        </section>

      </section>

      ${f()}

    </main>
  `,v()}function v(){const o=document.querySelector("#customer-name"),a=document.querySelector("#customer-phone"),c=document.querySelector("#customer-form");o&&o.addEventListener("input",n=>{e.customerName=n.target.value}),a&&a.addEventListener("input",n=>{e.customerPhone=M(n.target.value),n.target.value=e.customerPhone}),c&&c.addEventListener("submit",n=>{n.preventDefault();const t=e.customerName.trim(),r=N(e.customerPhone);if(!t){e.statusMessage="Informe seu nome para continuar.",i();return}if(r.length<10){e.statusMessage="Informe um celular válido para continuar.",i();return}e.customerName=t,e.customerPhone=M(r),e.step="menu",e.statusMessage=`Olá, ${t}! Escolha seus produtos.`,i()}),document.querySelectorAll("[data-action]").forEach(n=>{n.addEventListener("click",I)})}async function I(o){const a=o.currentTarget.getAttribute("data-action"),c=o.currentTarget.getAttribute("data-product-id"),n=o.currentTarget.getAttribute("data-key");if(a==="new-order"){e.cart=[],e.step="menu",e.statusMessage="Escolha seus produtos.",i();return}if(a==="back-menu"){e.step="menu",i();return}if(a==="open-cart"){e.step="cart",i();return}if(a==="send-order"){await T();return}if(a==="add-product"||a==="increase-product"){const t=e.products.find(m=>String(m.id)===String(c));if(!t)return;const r=e.cart.find(m=>String(m.product.id)===String(c)&&m.complements.length===0);if(r){if(r.quantity>=Number(t.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",i();return}r.quantity+=1}else e.cart.push({product:t,quantity:1,complements:[]});e.statusMessage="Produto adicionado ao carrinho.",i();return}if(a==="decrease-product"){const t=e.cart.find(r=>String(r.product.id)===String(c)&&r.complements.length===0);if(!t)return;t.quantity-=1,e.cart=e.cart.filter(r=>r.quantity>0),i();return}if(a==="increase-cart"||a==="decrease-cart"){const t=e.cart.find(r=>E(r.product.id,r.complements)===n);if(!t)return;if(a==="increase-cart"&&t.quantity>=Number(t.product.stock)){e.statusMessage="Estoque insuficiente para adicionar mais unidades.",i();return}a==="increase-cart"?t.quantity+=1:t.quantity-=1,e.cart=e.cart.filter(r=>r.quantity>0),i()}}async function T(){if(!e.supabase||!e.table||e.cart.length===0)return;const o=String(e.customerName||"").replace(/<[^>]*>/g,"").replace(/[\x00-\x1F\x7F]/g,"").trim(),a=N(e.customerPhone);if(!o){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",i();return}if(a.length<10){e.step="intro",e.statusMessage="Informe um celular válido antes de enviar o pedido.",i();return}e.sending=!0,e.statusMessage="Enviando pedido...",i();const c=e.cart.map(r=>({product_id:r.product.id,quantity:r.quantity,complements:r.complements.map(m=>({id:m.id}))}));console.log("Enviando pedido:",{tableId:e.table.id,tableName:e.table.name,customerName:o,customerPhone:a,items:c,total:$()});const{data:n,error:t}=await e.supabase.rpc("submit_public_customer_order",{p_table_id:Number(e.table.id),p_table_code:e.table.code,p_table_name:e.table.name,p_customer_name:o,p_customer_phone:a,p_items:c,p_total:$()});if(e.sending=!1,t){if(console.error("Erro ao enviar pedido:",t),String(t.message||"").includes("ONLINE_ORDERING_CLOSED")){e.serviceClosed=!0,e.cart=[],e.step="intro",e.statusMessage="Loja fechada no momento.",i();return}if(String(t.message||"").includes("INVALID_CUSTOMER_NAME")){e.step="intro",e.statusMessage="Informe seu nome antes de enviar o pedido.",i();return}if(String(t.message||"").includes("INVALID_TABLE_QR")||String(t.message||"").includes("INVALID_TABLE")){e.error="Este QR Code não é válido para esta mesa. Solicite um novo QR Code ao estabelecimento.",i();return}if(String(t.message||"").includes("RATE_LIMITED")){e.statusMessage="Muitos pedidos em pouco tempo. Aguarde um momento e tente novamente.",i();return}if(String(t.message||"").includes("PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK")){e.statusMessage="Um dos produtos ficou indisponível. Atualize o cardápio e tente novamente.",i();return}if(String(t.message||"").includes("INVALID_COMPLEMENT")){e.statusMessage="Um dos complementos selecionados não está mais disponível. Atualize o pedido.",i();return}e.statusMessage="Erro ao enviar o pedido. Tente novamente.",i();return}console.log("Pedido criado:",n),e.step="sent",e.cart=[],e.statusMessage="Pedido enviado com sucesso.",i()}async function x(){var a,c;const o=A();if(!o){e.loading=!1,e.table={id:0,name:"Mesa 1 (Preview)",code:"demo"},e.storeName="Pastelaria Demo",e.logoEmoji="🥟",e.logoUrl=null,e.categories=["Pastéis","Bebidas","Sobremesas"],e.products=[{id:"p1",name:"Pastel de Carne",description:"Carne moída temperada, ovo e azeitona.",price:12.9,category:"Pastéis",stock:10,image:""},{id:"p2",name:"Pastel de Queijo",description:"Queijo mussarela derretido, crocante e saboroso.",price:11.5,category:"Pastéis",stock:8,image:""},{id:"p3",name:"Pastel de Frango",description:"Frango desfiado com catupiry e milho.",price:13.5,category:"Pastéis",stock:6,image:""},{id:"p4",name:"Pastel de Pizza",description:"Molho de tomate, mussarela e azeitona.",price:12,category:"Pastéis",stock:5,image:""},{id:"p5",name:"Caldo de Cana",description:"Fresquinho, natural e gelado.",price:6,category:"Bebidas",stock:20,image:""},{id:"p6",name:"Refrigerante Lata",description:"Coca-Cola, Guaraná ou Sprite.",price:5.5,category:"Bebidas",stock:15,image:""},{id:"p7",name:"Água Mineral",description:"500ml com ou sem gás.",price:3,category:"Bebidas",stock:30,image:""},{id:"p8",name:"Pastel Doce Nutella",description:"Recheado com Nutella e morango.",price:15,category:"Sobremesas",stock:4,image:""}],e.statusMessage="🎨 Modo preview — conecte ao Supabase para uso real.",e.customerName="Visitante",e.step="menu",i();return}try{e.supabase=L();const[n,t,r,m]=await Promise.all([e.supabase.rpc("get_public_table_by_qr",{p_table_id:o.tableId,p_table_code:o.tableCode}),e.supabase.rpc("get_public_menu_products"),e.supabase.rpc("get_public_menu_categories"),e.supabase.rpc("get_public_store_settings")]);if(n.error)throw n.error;if(t.error)throw t.error;if(r.error)throw r.error;if(m.error)throw m.error;const l=(a=n.data)==null?void 0:a[0];if(!l){e.loading=!1,e.error="Mesa não encontrada. Verifique se o QR Code foi gerado corretamente.",i();return}e.table={id:Number(l.id),name:l.name,code:o.tableCode},e.products=(t.data??[]).map(d=>({id:d.id,name:d.name,description:d.description??"",price:Number(d.price),category:d.category,stock:Number(d.stock),image:d.image??""}));const u=new Map((r.data??[]).map(d=>[d.name,Number(d.sort_order)])),p=new Set([...(r.data??[]).map(d=>d.name),...e.products.map(d=>d.category)]);e.categories=[...p].sort((d,y)=>(u.get(d)??999)-(u.get(y)??999));const g=(c=m.data)==null?void 0:c[0];if(g&&(e.storeName=g.store_name??e.storeName,e.logoEmoji=g.logo_emoji??e.logoEmoji,e.logoUrl=g.logo_url??null,g.online_ordering_enabled===!1)){e.loading=!1,e.serviceClosed=!0,e.products=[],e.categories=[],e.cart=[],i();return}e.loading=!1,e.step="intro",e.statusMessage="Informe seu nome e celular para continuar.",i()}catch(n){console.error(n),e.loading=!1;const t=P(n);e.error=n instanceof Error&&n.message.includes("VITE_SUPABASE")?n.message:t||"Não foi possível carregar o cardápio agora. Tente novamente em instantes.",i()}}i();x();
