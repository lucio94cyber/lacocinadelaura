const state={products:[],cart:JSON.parse(localStorage.getItem('laura-cart')||'[]')};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const money=n=>n==null?'A confirmar':new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
function save(){localStorage.setItem('laura-cart',JSON.stringify(state.cart));renderCart();}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.remove('show'),2200)}
function add(product){const item=state.cart.find(x=>x.id===product.id);if(item)item.qty++;else state.cart.push({id:product.id,nombre:product.nombre,titulo:product.titulo,imagen:product.imagen,precio:product.precio,qty:1});save();toast(`“${product.titulo}” agregado al pedido`)}
function change(id,delta){const item=state.cart.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)state.cart=state.cart.filter(x=>x.id!==id);save()}
function remove(id){state.cart=state.cart.filter(x=>x.id!==id);save()}
function renderProducts(){
  $$('.product-grid').forEach(grid=>{const cat=grid.dataset.category;const products=state.products.filter(p=>p.categoria===cat);const count=document.querySelector(`[data-count="${cat}"]`);if(count)count.textContent=`${products.length} opciones`;
    grid.innerHTML=products.map(p=>`<article class="product-card"><div class="product-image"><img src="${p.imagen}" alt="${escapeHtml(p.titulo)}" loading="lazy" data-zoom="${p.imagen}"><span class="zoom-badge">⌕</span></div><div class="product-info"><h3>${escapeHtml(p.titulo)}</h3><div class="price-placeholder">Precio: consultar</div><button class="add-button" data-add="${p.id}">🛒 Agregar al pedido</button></div></article>`).join('')});
  $$('[data-add]').forEach(b=>b.addEventListener('click',()=>{const p=state.products.find(x=>x.id===b.dataset.add);if(p)add(p)}));
  $$('[data-zoom]').forEach(img=>img.addEventListener('click',()=>openModal(img.dataset.zoom,img.alt)));
}
function renderCart(){const items=$('#cartItems');const totalQty=state.cart.reduce((s,x)=>s+x.qty,0);$('#cartCount').textContent=totalQty;$('#heroCount').textContent=totalQty;
  if(!state.cart.length){items.innerHTML='<div class="empty-cart"><div class="empty-icon">🧺</div><h3>Tu pedido está vacío</h3><p>Elegí tus productos y aparecerán acá.</p></div>';$('#cartTotal').textContent='A confirmar';return}
  items.innerHTML=state.cart.map(x=>`<div class="cart-item"><img src="${x.imagen}" alt="${escapeHtml(x.titulo)}"><div><h3>${escapeHtml(x.titulo)}</h3><div class="qty-controls"><button data-minus="${x.id}">−</button><span>${x.qty}</span><button data-plus="${x.id}">+</button></div></div><button class="remove-item" data-remove="${x.id}" aria-label="Eliminar">✕</button></div>`).join('');
  $('#cartTotal').textContent='A confirmar';$$('[data-minus]').forEach(b=>b.onclick=()=>change(b.dataset.minus,-1));$$('[data-plus]').forEach(b=>b.onclick=()=>change(b.dataset.plus,1));$$('[data-remove]').forEach(b=>b.onclick=()=>remove(b.dataset.remove));
}
function openCart(){const d=$('#cartDrawer');d.classList.add('open');$('#cartBackdrop').classList.add('open');d.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeCart(){const d=$('#cartDrawer');d.classList.remove('open');$('#cartBackdrop').classList.remove('open');d.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function sendWhatsApp(){if(!state.cart.length){toast('Agregá al menos un producto');return}const lines=state.cart.map(x=>`- ${x.titulo} x${x.qty}`).join('\n');const msg=`Hola! Quisiera consultar disponibilidad para hacer el siguiente pedido:\n\n${lines}\n\nTotal: a confirmar.\n\n¿Me indican disponibilidad y precio final?\nGracias!`;window.open(`https://wa.me/5491150182600?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer')}
function openModal(src,alt){$('#modalImage').src=src;$('#modalImage').alt=alt;$('#imageModal').classList.add('open');$('#imageModal').setAttribute('aria-hidden','false')}
function closeModal(){$('#imageModal').classList.remove('open');$('#imageModal').setAttribute('aria-hidden','true')}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function init(){try{const r=await fetch('data/productos.json');state.products=await r.json();renderProducts();renderCart()}catch(e){console.error('No se pudo cargar productos.json',e);$$('.product-grid').forEach(g=>g.innerHTML='<p>No se pudieron cargar los productos.</p>')}}
$('#openCart').onclick=openCart;$('#heroCart').onclick=openCart;$('#ctaCart').onclick=openCart;$('#closeCart').onclick=closeCart;$('#cartBackdrop').onclick=closeCart;$('#sendWhatsApp').onclick=sendWhatsApp;$('#clearCart').onclick=()=>{state.cart=[];save();toast('Pedido vacío')};$('#closeModal').onclick=closeModal;$('#imageModal').onclick=e=>{if(e.target.id==='imageModal')closeModal()};
$('#menuToggle').onclick=()=>{const n=$('#mainNav');const open=n.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',open)};$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeModal()}});init();
