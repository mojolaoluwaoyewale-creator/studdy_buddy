/* ============================================================
   MARA — main.js
   Handles: Cart state, Cart drawer, Mobile menu, Wishlist,
            Scroll effects, Scroll reveal
   ============================================================ */

'use strict';

/* ---------- State ---------- */
const cart = []; // [{ id, name, price, qty, colorClass }]

/* ---------- DOM refs ---------- */
const overlay       = document.getElementById('overlay');
const hamburger     = document.getElementById('hamburger');
const mobileMenu    = document.getElementById('mobileMenu');
const closeMenu     = document.getElementById('closeMenu');
const cartDrawer    = document.getElementById('cartDrawer');
const cartBtn       = document.getElementById('cartBtn');
const closeCart     = document.getElementById('closeCart');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const cartItemsEl   = document.getElementById('cartItems');
const cartEmptyEl   = document.getElementById('cartEmpty');
const cartFooterEl  = document.getElementById('cartFooter');
const cartShopLink  = document.getElementById('cartShopLink');
const totalPriceEl  = document.getElementById('totalPrice');
const toastEl       = document.getElementById('toast');
const toastMsgEl    = document.getElementById('toastMsg');
const siteHeader    = document.getElementById('siteHeader');

/* ---------- Helpers ---------- */
function formatPrice(n) {
  return '\u20a6' + n.toLocaleString('en-NG');
}
function totalItems() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}
function totalCost() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ---------- Count badges ---------- */
function updateCountBadges() {
  const count = totalItems();
  document.querySelectorAll('.cart-count, .cart-count-mobile').forEach(el => {
    el.textContent = count;
  });
  document.querySelector('.cart-drawer-count').textContent = '(' + count + ')';
}

/* ---------- Cart badge bump ---------- */
function bumpCartBadge() {
  const badge = document.querySelector('.cart-count');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  toastMsgEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ---------- Render cart ---------- */
function renderCart() {
  cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'flex';
    cartFooterEl.classList.remove('visible');
    updateCountBadges();
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartFooterEl.classList.add('visible');

  cart.forEach(function(item) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.id = item.id;

    const thumb = document.createElement('div');
    thumb.className = 'cart-item-thumb ' + item.colorClass;

    const info = document.createElement('div');
    info.className = 'cart-item-info';
    info.innerHTML =
      '<p class="cart-item-name">' + item.name + '</p>' +
      '<p class="cart-item-price">' + formatPrice(item.price) + '</p>';

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const qtyControls = document.createElement('div');
    qtyControls.className = 'qty-controls';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '\u2212';
    minusBtn.setAttribute('aria-label', 'Decrease quantity');
    minusBtn.addEventListener('click', function() { changeQty(item.id, -1); });

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'qty-display';
    qtyDisplay.textContent = item.qty;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', 'Increase quantity');
    plusBtn.addEventListener('click', function() { changeQty(item.id, 1); });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-item';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function() { removeItem(item.id); });

    qtyControls.appendChild(minusBtn);
    qtyControls.appendChild(qtyDisplay);
    qtyControls.appendChild(plusBtn);
    controls.appendChild(qtyControls);
    controls.appendChild(removeBtn);
    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(controls);
    cartItemsEl.appendChild(row);
  });

  totalPriceEl.textContent = formatPrice(totalCost());
  updateCountBadges();
}

/* ---------- Add to cart ---------- */
function addToCart(productCard, btn) {
  const id    = productCard.dataset.id;
  const name  = productCard.dataset.name;
  const price = parseInt(productCard.dataset.price, 10);

  const placeholder = productCard.querySelector('.product-img-placeholder');
  const classes = placeholder ? placeholder.className.split(' ') : [];
  const colorClass = classes.find(function(c) { return /^p\d$/.test(c); }) || 'p1';

  const existing = cart.find(function(i) { return i.id === id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1, colorClass: colorClass });
  }

  btn.textContent = '\u2713 Added';
  btn.classList.add('added');
  setTimeout(function() {
    btn.textContent = 'Add to cart';
    btn.classList.remove('added');
  }, 2000);

  bumpCartBadge();
  renderCart();
  showToast('\u201c' + name + '\u201d added to cart');
}

/* ---------- Change quantity ---------- */
function changeQty(id, delta) {
  const item = cart.find(function(i) { return i.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeItem(id); return; }
  renderCart();
}

/* ---------- Remove item ---------- */
function removeItem(id) {
  const idx = cart.findIndex(function(i) { return i.id === id; });
  if (idx !== -1) cart.splice(idx, 1);
  renderCart();
  showToast('Item removed from cart');
}

/* ---------- Drawer helpers ---------- */
function openDrawer(el) {
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');
  document.body.classList.add('drawer-open');
}

function closeDrawer(el) {
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  if (!cartDrawer.classList.contains('open') && !mobileMenu.classList.contains('open')) {
    overlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

function openCart() {
  closeDrawer(mobileMenu);
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  renderCart();
  openDrawer(cartDrawer);
}

function openMenu() {
  closeDrawer(cartDrawer);
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  openDrawer(mobileMenu);
}

function closeAll() {
  closeDrawer(cartDrawer);
  closeDrawer(mobileMenu);
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ---------- Event listeners ---------- */

// Cart
cartBtn.addEventListener('click', openCart);
mobileCartBtn.addEventListener('click', function() { closeAll(); openCart(); });
closeCart.addEventListener('click', function() { closeDrawer(cartDrawer); });

// Mobile menu
hamburger.addEventListener('click', function() {
  if (mobileMenu.classList.contains('open')) {
    closeAll();
  } else {
    openMenu();
  }
});
closeMenu.addEventListener('click', closeAll);

// Overlay
overlay.addEventListener('click', closeAll);

// "Start Shopping" button in empty cart
cartShopLink.addEventListener('click', function() {
  closeAll();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

// Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAll();
});

// Add-to-cart buttons
document.querySelectorAll('.product-card').forEach(function(card) {
  const btn = card.querySelector('.add-to-cart');
  if (btn) {
    btn.addEventListener('click', function() { addToCart(card, btn); });
  }
});

// Wishlist toggle
document.querySelectorAll('.wishlist').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const isActive = btn.classList.toggle('active');
    btn.textContent = isActive ? '\u2665' : '\u2661';
    showToast(isActive ? 'Added to wishlist' : 'Removed from wishlist');
  });
});

/* ---------- Header scroll shadow ---------- */
window.addEventListener('scroll', function() {
  siteHeader.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.product-card, .cat-card').forEach(function(el) {
  revealObserver.observe(el);
});

/* ---------- Init ---------- */
updateCountBadges();