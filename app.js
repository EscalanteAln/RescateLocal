/**
 * ========================================================
 * RESCATELOCAL - LÓGICA DE NEGOCIO, TEMPORIZADORES Y RESERVAS
 * ========================================================
 */

// 1. Catálogo inicial de comercios y ofertas hiperlocales
const DEFAULT_OFFERS = [
  {
    id: 'off-1',
    title: 'Bolsa Sorpresa de Masa Madre y Croissants',
    store: 'Panadería y Tahona La Espiga',
    category: 'panaderia',
    distance: 'A 180 m',
    address: 'Carrer de Verdi 32, Gràcia',
    originalPrice: 14.50,
    rescuePrice: 3.99,
    isFree: false,
    stock: 3,
    initialStock: 3,
    secondsLeft: 3840, // 1h 4m
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.2,
    badgeText: 'Horno Artesano'
  },
  {
    id: 'off-2',
    title: 'Cajón Mixto de Fruta y Verdura Madura del Día',
    store: 'Frutería y Huerto BioVerde',
    category: 'verduleria',
    distance: 'A 340 m',
    address: 'Torrent de l\'Olla 78, Gràcia',
    originalPrice: 16.00,
    rescuePrice: 4.50,
    isFree: false,
    stock: 4,
    initialStock: 4,
    secondsLeft: 7920, // 2h 12m
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    impactKg: 4.5,
    badgeText: '100% Ecológico'
  },
  {
    id: 'off-3',
    title: 'Pack Cenas Caseras: Guisos y Tortilla Paisana',
    store: 'Rosticería & Fogones de la Abuela',
    category: 'comida',
    distance: 'A 490 m',
    address: 'Travessera de Gràcia 142',
    originalPrice: 18.50,
    rescuePrice: 5.20,
    isFree: false,
    stock: 2,
    initialStock: 2,
    secondsLeft: 2160, // 36 mins (¡Urgente!)
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    impactKg: 3.0,
    badgeText: 'Cocina del Día'
  },
  {
    id: 'off-4',
    title: 'Lote Solidario: Sandwiches y Ensaladas Frescas',
    store: 'Café & Obrador Comunitario El Rincón',
    category: 'gratis',
    distance: 'A 280 m',
    address: 'Carrer de Girona 54',
    originalPrice: 12.00,
    rescuePrice: 0.00,
    isFree: true,
    stock: 5,
    initialStock: 5,
    secondsLeft: 4620, // 1h 17m
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.8,
    badgeText: 'Solidario Gratis'
  },
  {
    id: 'off-5',
    title: 'Caja Degustación: Focaccias y Porciones de Pizza',
    store: 'Pizzería Artesanal Napolitana Bella Ciao',
    category: 'comida',
    distance: 'A 650 m',
    address: 'Plaça del Sol 12',
    originalPrice: 15.00,
    rescuePrice: 4.80,
    isFree: false,
    stock: 1, // ¡Último disponible!
    initialStock: 2,
    secondsLeft: 1620, // 27 mins (< 30 min urgencia)
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.0,
    badgeText: 'Masa Fermentada'
  },
  {
    id: 'off-6',
    title: 'Surtido de Quesos Artesanales y Yogures Naturales',
    store: 'Quesería de Barrio La Colina',
    category: 'lacteos',
    distance: 'A 420 m',
    address: 'Carrer de Bailèn 90',
    originalPrice: 19.00,
    rescuePrice: 5.50,
    isFree: false,
    stock: 3,
    initialStock: 3,
    secondsLeft: 5400, // 1h 30m
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.5,
    badgeText: 'Lácteos Frescos'
  }
];

// 2. Estado Global de la Aplicación
let state = {
  offers: [],
  reservations: [],
  activeCategory: 'all',
  searchQuery: '',
  selectedLocation: 'Barrio de Gràcia, Barcelona',
  currentBookingOfferId: null,
  bookingQuantity: 1,
  activeQRReservationId: null,
  totalSavedKg: 38.4
};

// Inicialización de la aplicación
function initApp() {
  const savedOffers = localStorage.getItem('rl_offers_v2');
  const savedRes = localStorage.getItem('rl_reservations_v2');
  const savedKg = localStorage.getItem('rl_impact_kg');

  state.offers = savedOffers ? JSON.parse(savedOffers) : JSON.parse(JSON.stringify(DEFAULT_OFFERS));
  state.reservations = savedRes ? JSON.parse(savedRes) : [];
  if (savedKg) state.totalSavedKg = parseFloat(savedKg);

  renderOffers();
  updateCartBadge();
  startLiveTimers();
}

function saveState() {
  localStorage.setItem('rl_offers_v2', JSON.stringify(state.offers));
  localStorage.setItem('rl_reservations_v2', JSON.stringify(state.reservations));
  localStorage.setItem('rl_impact_kg', state.totalSavedKg.toString());
}

// 3. Temporizadores en Vivo (JavaScript Puro Sin Deriva)
function startLiveTimers() {
  setInterval(() => {
    let reRenderNeeded = false;

    state.offers.forEach(offer => {
      if (offer.secondsLeft > 0) {
        offer.secondsLeft -= 1;
        
        // Actualización directa del DOM sin parpadeos
        const timerEl = document.getElementById(`timer-${offer.id}`);
        if (timerEl) {
          timerEl.textContent = formatCountdown(offer.secondsLeft);
          
          const badgeEl = document.getElementById(`timer-badge-${offer.id}`);
          if (badgeEl && offer.secondsLeft < 1800) {
            badgeEl.className = "flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-sm animate-urgent";
          }
        }
      } else if (offer.secondsLeft === 0) {
        offer.secondsLeft = 0;
        reRenderNeeded = true;
      }
    });

    if (reRenderNeeded) {
      renderOffers();
    }
  }, 1000);

  // Resincronización al regresar a la pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      renderOffers();
    }
  });
}

function formatCountdown(totalSecs) {
  if (totalSecs <= 0) return '⏰ Expirada';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return `⏳ ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

// 4. Renderizado de Tarjetas de Ofertas
function renderOffers() {
  const container = document.getElementById('offers-grid');
  const emptyState = document.getElementById('empty-offers-state');
  const totalCountEl = document.getElementById('total-active-count');

  if (!container) return;

  const filtered = state.offers.filter(offer => {
    const matchesCategory = state.activeCategory === 'all' || 
      (state.activeCategory === 'gratis' ? offer.isFree : offer.category === state.activeCategory);

    const q = state.searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      offer.title.toLowerCase().includes(q) || 
      offer.store.toLowerCase().includes(q) ||
      offer.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  if (totalCountEl) totalCountEl.textContent = `${filtered.length} ofertas disponibles`;

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(offer => {
    const isExpired = offer.secondsLeft <= 0;
    const isSoldOut = offer.stock <= 0;
    const isUrgent = offer.secondsLeft > 0 && offer.secondsLeft < 1800;
    const discountPct = offer.isFree ? 100 : Math.round((1 - offer.rescuePrice / offer.originalPrice) * 100);

    const cardOpacity = (isExpired || isSoldOut) ? 'opacity-60 grayscale-[30%]' : '';
    const timerBadgeClass = isExpired 
      ? 'bg-slate-200 text-slate-700' 
      : (isUrgent ? 'bg-amber-500 text-slate-950 font-black animate-urgent' : 'bg-slate-900/85 text-emerald-300');

    return `
      <article class="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm card-hover-lift flex flex-col relative group ${cardOpacity}">
        
        <!-- Imagen y Badges Flotantes -->
        <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img src="${offer.image}" alt="${offer.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          <!-- Badges Superiores -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-slate-200/80">
              <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              ${offer.distance}
            </span>

            ${offer.isFree 
              ? `<span class="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                  🎁 100% Solidario
                </span>`
              : `<span class="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  -${discountPct}%
                </span>`
            }
          </div>

          <!-- Temporizador en Vivo -->
          <div class="absolute bottom-3 left-3 flex items-center space-x-2">
            <div id="timer-badge-${offer.id}" class="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${timerBadgeClass}">
              <span id="timer-${offer.id}">${formatCountdown(offer.secondsLeft)}</span>
            </div>
          </div>

          <!-- Stock -->
          <div class="absolute bottom-3 right-3">
            ${isSoldOut 
              ? `<span class="bg-rose-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase">Agotado</span>`
              : `<span class="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border border-slate-200 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full ${offer.stock === 1 ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
                  ${offer.stock === 1 ? '¡Último!' : `Quedan ${offer.stock}`}
                </span>`
            }
          </div>
        </div>

        <!-- Cuerpo de la Tarjeta -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-2 text-[11px] text-slate-500 mb-1">
              <span class="font-bold text-slate-700 truncate max-w-[180px]">${offer.store}</span>
              <span>•</span>
              <span class="text-slate-400 capitalize">${offer.category}</span>
            </div>

            <h3 class="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition">
              ${offer.title}
            </h3>
          </div>

          <!-- Precios y Botón CTA -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              ${offer.isFree 
                ? `<div class="flex flex-col">
                    <span class="text-[10px] font-extrabold text-emerald-700 uppercase">Sin costo</span>
                    <span class="text-base font-black text-emerald-800 leading-none">GRATIS</span>
                  </div>`
                : `<div class="flex items-baseline space-x-1.5">
                    <span class="text-lg font-black text-emerald-700">${offer.rescuePrice.toFixed(2)} €</span>
                    <span class="text-xs text-slate-400 line-through font-medium">${offer.originalPrice.toFixed(2)} €</span>
                  </div>`
              }
              <span class="text-[10px] text-slate-400 block font-medium mt-0.5">🌱 Salva ~${offer.impactKg} kg de comida</span>
            </div>

            ${(isExpired || isSoldOut) 
              ? `<button disabled class="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-bold rounded-2xl cursor-not-allowed">
                  ${isExpired ? 'Expirada' : 'Agotada'}
                </button>`
              : `<button onclick="openBookingModal('${offer.id}')" class="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition flex items-center space-x-1.5">
                  <span>Reservar</span>
                  <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>`
            }
          </div>
        </div>

      </article>
    `;
  }).join('');
}

// 5. Filtros por Categoría y Búsqueda
function filterByCategory(category) {
  state.activeCategory = category;
  
  // Actualizar píldoras activas
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) {
      btn.className = "cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-emerald-700 text-white shadow-sm";
    } else {
      btn.className = "cat-filter-btn px-4 py-2 rounded-full text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 transition-all border border-slate-200";
    }
  });

  renderOffers();
}

function handleSearch(query) {
  state.searchQuery = query;
  renderOffers();
}

function scrollToOffers() {
  const el = document.getElementById('seccion-ofertas');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// 6. Carrito Rápido (Modal Deslizante)
function openBookingModal(offerId) {
  const offer = state.offers.find(o => o.id === offerId);
  if (!offer || offer.stock <= 0 || offer.secondsLeft <= 0) return;

  state.currentBookingOfferId = offerId;
  state.bookingQuantity = 1;

  document.getElementById('modal-offer-title').textContent = offer.title;
  document.getElementById('modal-store-name').textContent = `${offer.store} (${offer.address})`;
  document.getElementById('modal-stock-info').textContent = `${offer.stock} paquetes disponibles en tienda`;
  document.getElementById('modal-category-badge').textContent = offer.category.toUpperCase();

  const now = new Date();
  now.setSeconds(now.getSeconds() + offer.secondsLeft);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('modal-pickup-deadline').textContent = `Hoy antes de las ${timeStr} h`;

  updateModalPrice(offer);

  const modal = document.getElementById('booking-modal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  const dialog = modal.querySelector('.modal-dialog-smooth');
  dialog.classList.remove('translate-y-8', 'opacity-0');
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  const dialog = modal.querySelector('.modal-dialog-smooth');
  dialog.classList.add('translate-y-8', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    state.currentBookingOfferId = null;
  }, 200);
}

function adjustModalQty(delta) {
  const offer = state.offers.find(o => o.id === state.currentBookingOfferId);
  if (!offer) return;

  const newQty = state.bookingQuantity + delta;
  if (newQty >= 1 && newQty <= offer.stock) {
    state.bookingQuantity = newQty;
    updateModalPrice(offer);
  }
}

function updateModalPrice(offer) {
  document.getElementById('modal-qty-display').textContent = state.bookingQuantity;

  if (offer.isFree) {
    document.getElementById('modal-original-price').textContent = `${(offer.originalPrice * state.bookingQuantity).toFixed(2)} €`;
    document.getElementById('modal-total-price').textContent = '0.00 € (GRATIS)';
    document.getElementById('modal-savings-tag').textContent = '100% Solidario';
  } else {
    const totalOriginal = offer.originalPrice * state.bookingQuantity;
    const totalRescue = offer.rescuePrice * state.bookingQuantity;
    const saved = totalOriginal - totalRescue;

    document.getElementById('modal-original-price').textContent = `${totalOriginal.toFixed(2)} €`;
    document.getElementById('modal-total-price').textContent = `${totalRescue.toFixed(2)} €`;
    document.getElementById('modal-savings-tag').textContent = `Ahorras ${saved.toFixed(2)} €`;
  }
}

function confirmReservation() {
  const offer = state.offers.find(o => o.id === state.currentBookingOfferId);
  if (!offer) return;

  // 1. Descontar stock
  offer.stock -= state.bookingQuantity;

  // 2. Crear reserva
  const reservationId = 'RL-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  now.setSeconds(now.getSeconds() + offer.secondsLeft);
  const deadlineStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newRes = {
    id: reservationId,
    offerId: offer.id,
    title: offer.title,
    store: offer.store,
    address: offer.address,
    quantity: state.bookingQuantity,
    totalPrice: offer.isFree ? 0 : (offer.rescuePrice * state.bookingQuantity),
    isFree: offer.isFree,
    deadline: deadlineStr,
    status: 'active', // 'active' | 'completed' | 'cancelled'
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  state.reservations.unshift(newRes);
  state.totalSavedKg += (offer.impactKg * state.bookingQuantity);

  saveState();
  renderOffers();
  updateCartBadge();
  closeBookingModal();

  showToast(`🎉 ¡Reserva #${reservationId} confirmada con éxito!`);

  // Mostrar código QR de entrega
  setTimeout(() => {
    openQRModal(newRes.id);
  }, 350);
}

// 7. Modal de Código QR
function openQRModal(resId) {
  const res = state.reservations.find(r => r.id === resId);
  if (!res) return;

  state.activeQRReservationId = resId;
  document.getElementById('qr-title').textContent = res.title;
  document.getElementById('qr-store').textContent = `${res.store} • ${res.address}`;
  document.getElementById('qr-code-text').textContent = `#${res.id}`;
  document.getElementById('qr-deadline').textContent = `Recoger hoy antes de las ${res.deadline} h`;

  const modal = document.getElementById('qr-modal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeQRModal() {
  document.getElementById('qr-modal').classList.add('opacity-0', 'pointer-events-none');
  state.activeQRReservationId = null;
}

function simulateStorePickup() {
  const res = state.reservations.find(r => r.id === state.activeQRReservationId);
  if (!res) return;

  res.status = 'completed';
  saveState();
  updateCartBadge();
  closeQRModal();
  showToast('✅ ¡Paquete entregado con éxito en el local! Buen provecho 🍲');
}

// 8. Drawer de Carrito / Mis Reservas
function toggleReservationsDrawer() {
  const drawer = document.getElementById('reservations-drawer');
  const isHidden = drawer.classList.contains('translate-x-full');

  if (isHidden) {
    renderDrawerList();
    drawer.classList.remove('translate-x-full');
    document.getElementById('drawer-backdrop').classList.remove('opacity-0', 'pointer-events-none');
  } else {
    drawer.classList.add('translate-x-full');
    document.getElementById('drawer-backdrop').classList.add('opacity-0', 'pointer-events-none');
  }
}

function renderDrawerList() {
  const container = document.getElementById('drawer-items-list');
  const emptyState = document.getElementById('drawer-empty-state');

  const activeRes = state.reservations.filter(r => r.status === 'active');

  if (activeRes.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = activeRes.map(res => `
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-black font-mono text-emerald-800">#${res.id}</span>
        <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Listo para recoger</span>
      </div>
      <h4 class="font-bold text-sm text-slate-900">${res.title}</h4>
      <p class="text-xs text-slate-500">${res.store} • ${res.address}</p>
      
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span class="font-medium text-slate-500">Límite: <strong>${res.deadline} h</strong></span>
        <span class="font-black text-emerald-700">${res.isFree ? 'GRATIS' : res.totalPrice.toFixed(2) + ' €'}</span>
      </div>

      <button onclick="toggleReservationsDrawer(); openQRModal('${res.id}')" class="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 mt-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3"/></svg>
        <span>Ver Código QR</span>
      </button>
    </div>
  `).join('');
}

function updateCartBadge() {
  const activeCount = state.reservations.filter(r => r.status === 'active').length;
  const badge = document.getElementById('nav-cart-badge');
  if (badge) {
    badge.textContent = activeCount;
    if (activeCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// 9. Feedback Visual (Toast)
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  document.getElementById('toast-msg').textContent = msg;
  toast.classList.remove('-translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-20', 'opacity-0');
  }, 3200);
}

// 10. Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
