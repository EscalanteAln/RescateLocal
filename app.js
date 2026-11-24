/**
 * ========================================================
 * RESCATELOCAL IQUITOS, PERÚ - LÓGICA DE NEGOCIO Y COMERCIOS
 * ========================================================
 */

// 1. Catálogo de Ofertas en Soles Peruanos (S/) en Iquitos
const DEFAULT_OFFERS_IQUITOS = [
  {
    id: 'off-iq-1',
    title: 'Pack Cena Selvática: Juane de Gallina Criolla con Cecina y Patacones',
    store: 'Huarique Amazónico El Rincón del Juane',
    category: 'selvatico',
    landmark: 'Plaza de Armas (A 200 m)',
    address: 'Jr. Arica 342, Cercado de Iquitos',
    originalPrice: 25.00,
    rescuePrice: 7.50,
    isFree: false,
    stock: 3,
    initialStock: 3,
    secondsLeft: 3720, // 1h 2m
    image: 'hero-lomo-saltado.png',
    impactKg: 1.9,
    badgeText: 'Juane Tradicional'
  },
  {
    id: 'off-iq-2',
    title: 'Bolsa de Pan Regional: Pan de Piso, Ciabattas y Rosquitas de Almidón',
    store: 'Panadería & Pastelería La Loretana',
    category: 'panaderia',
    landmark: 'Plaza 28 de Julio (A 150 m)',
    address: 'Av. Grau 520, frente a Plaza 28 de Julio',
    originalPrice: 16.00,
    rescuePrice: 4.50,
    isFree: false,
    stock: 4,
    initialStock: 4,
    secondsLeft: 7800, // 2h 10m
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.3,
    badgeText: 'Horno Loretano'
  },
  {
    id: 'off-iq-3',
    title: 'Combo Amazónico: Tacacho con Cecina Ahumada y Ensalada de Chonta',
    store: 'Restaurante El Maleconero',
    category: 'selvatico',
    landmark: 'Malecón Tarapacá · Río Itaya',
    address: 'Malecón Tarapacá 180, Iquitos',
    originalPrice: 28.00,
    rescuePrice: 8.50,
    isFree: false,
    stock: 2,
    initialStock: 2,
    secondsLeft: 1800, // 30 mins (¡Urgente!)
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.6,
    badgeText: 'Cecina Ahumada'
  },
  {
    id: 'off-iq-4',
    title: 'Raciones Solidarias: Guiso de Pescado Paiche con Yuca y Arroz',
    store: 'Olla Común San Pedro / Comedor Comunitario Belén',
    category: 'gratis',
    landmark: 'Zona Bajo Belén (Iquitos)',
    address: 'Sector Venecia, Bajo Belén, Iquitos',
    originalPrice: 14.00,
    rescuePrice: 0.00,
    isFree: true,
    stock: 5,
    initialStock: 5,
    secondsLeft: 4620, // 1h 17m
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=700&q=80',
    impactKg: 3.2,
    badgeText: '100% Solidario S/ 0.00'
  },
  {
    id: 'off-iq-5',
    title: 'Caja Huerto Amazónico: Aguajes Seleccionados, Cocona y Plátanos Bellacos',
    store: 'Mercado Central de Iquitos - Puesto Doña Maritza',
    category: 'mercado',
    landmark: 'Mercado Central (Jr. San Martín)',
    address: 'Jr. San Martín cuadra 6, Puesto 28, Iquitos',
    originalPrice: 18.00,
    rescuePrice: 5.00,
    isFree: false,
    stock: 3,
    initialStock: 3,
    secondsLeft: 5400, // 1h 30m
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    impactKg: 4.5,
    badgeText: 'Fruta Amazónica'
  },
  {
    id: 'off-iq-6',
    title: 'Botellón 2L Camu Camu Puro + Maduro Frito con Queso Regional',
    store: 'Juguería Selva Fresca & Frutas Exóticas',
    category: 'jugos',
    landmark: 'Av. Abelardo Quiñones Km 1.5',
    address: 'Av. Abelardo Quiñones 1450, Iquitos',
    originalPrice: 15.00,
    rescuePrice: 4.00,
    isFree: false,
    stock: 2,
    initialStock: 2,
    secondsLeft: 1680, // 28 mins (< 30 min urgencia)
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
    impactKg: 2.0,
    badgeText: 'Camu Camu Puro'
  }
];

// 2. Estado Global de la Plataforma Iquitos
let state = {
  offers: [],
  reservations: [],
  registeredMerchants: [],
  activeCategory: 'all',
  searchQuery: '',
  selectedLandmark: 'Plaza de Armas, Iquitos',
  currentBookingOfferId: null,
  bookingQuantity: 1,
  activeQRReservationId: null,
  totalSavedKg: 48.2
};

function initApp() {
  const savedOffers = localStorage.getItem('rl_iquitos_offers');
  const savedRes = localStorage.getItem('rl_iquitos_reservations');
  const savedMerchants = localStorage.getItem('rl_iquitos_merchants');
  const savedKg = localStorage.getItem('rl_iquitos_kg');

  state.offers = savedOffers ? JSON.parse(savedOffers) : JSON.parse(JSON.stringify(DEFAULT_OFFERS_IQUITOS));
  state.reservations = savedRes ? JSON.parse(savedRes) : [];
  state.registeredMerchants = savedMerchants ? JSON.parse(savedMerchants) : [
    { name: 'Huarique Amazónico El Rincón del Juane', landmark: 'Plaza de Armas', ruc: '10458291021' },
    { name: 'Panadería & Pastelería La Loretana', landmark: 'Plaza 28 de Julio', ruc: '20601928374' }
  ];
  if (savedKg) state.totalSavedKg = parseFloat(savedKg);

  renderOffers();
  updateCartBadge();
  startLiveTimers();
}

function saveState() {
  localStorage.setItem('rl_iquitos_offers', JSON.stringify(state.offers));
  localStorage.setItem('rl_iquitos_reservations', JSON.stringify(state.reservations));
  localStorage.setItem('rl_iquitos_merchants', JSON.stringify(state.registeredMerchants));
  localStorage.setItem('rl_iquitos_kg', state.totalSavedKg.toString());
}

// 3. Temporizadores en Vivo (JavaScript Puro Sin Deriva)
function startLiveTimers() {
  setInterval(() => {
    let reRenderNeeded = false;

    state.offers.forEach(offer => {
      if (offer.secondsLeft > 0) {
        offer.secondsLeft -= 1;
        
        const timerEl = document.getElementById(`timer-${offer.id}`);
        if (timerEl) {
          timerEl.textContent = formatCountdown(offer.secondsLeft);
          
          const badgeEl = document.getElementById(`timer-badge-${offer.id}`);
          if (badgeEl && offer.secondsLeft < 1800) {
            badgeEl.className = "flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md animate-urgent";
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

// 4. Renderizado de Tarjetas de Ofertas en Iquitos (CERO Fondo Blanco)
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
      offer.landmark.toLowerCase().includes(q) ||
      offer.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  if (totalCountEl) totalCountEl.textContent = `${filtered.length} ofertas activas hoy en Iquitos`;

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

    const cardOpacity = (isExpired || isSoldOut) ? 'opacity-50 grayscale-[40%]' : '';
    const timerBadgeClass = isExpired 
      ? 'bg-slate-800 text-slate-400 border border-slate-700' 
      : (isUrgent ? 'bg-amber-500 text-slate-950 font-black animate-urgent shadow-lg' : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40');

    return `
      <article class="jade-card overflow-hidden flex flex-col relative group ${cardOpacity}">
        
        <!-- Imagen y Badges Flotantes -->
        <div class="relative h-48 w-full bg-slate-900 overflow-hidden">
          <img src="${offer.image}" alt="${offer.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-[#062016] via-[#062016]/40 to-transparent"></div>

          <!-- Badges Superiores con Punto de Referencia en Iquitos -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="bg-[#062016]/90 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-emerald-500/40">
              <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              ${offer.landmark}
            </span>

            ${offer.isFree 
              ? `<span class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider border border-emerald-300/40">
                  🎁 S/ 0.00 Olla Común
                </span>`
              : `<span class="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
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
              ? `<span class="bg-rose-900/90 border border-rose-500 text-rose-200 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase">Agotado</span>`
              : `<span class="bg-[#062016]/90 backdrop-blur-md text-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full ${offer.stock === 1 ? 'bg-rose-400' : 'bg-emerald-400'}"></span>
                  ${offer.stock === 1 ? '¡Último!' : `Quedan ${offer.stock}`}
                </span>`
            }
          </div>
        </div>

        <!-- Cuerpo de la Tarjeta en Jade Oscuro -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-2 text-[11px] text-emerald-300/80 mb-1">
              <span class="font-bold text-emerald-200 truncate max-w-[200px]">${offer.store}</span>
              <span>•</span>
              <span class="text-emerald-400/90 capitalize">${offer.category}</span>
            </div>

            <h3 class="font-extrabold text-sm text-white leading-snug group-hover:text-emerald-300 transition">
              ${offer.title}
            </h3>
            <p class="text-[11px] text-emerald-200/60 mt-1">${offer.address}</p>
          </div>

          <!-- Precios en Soles (S/) y Botón CTA -->
          <div class="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
            <div>
              ${offer.isFree 
                ? `<div class="flex flex-col">
                    <span class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Donación</span>
                    <span class="text-base font-black text-emerald-300 leading-none">S/ 0.00 GRATIS</span>
                  </div>`
                : `<div class="flex items-baseline space-x-2">
                    <span class="text-lg font-black text-emerald-300">S/ ${offer.rescuePrice.toFixed(2)}</span>
                    <span class="text-xs text-emerald-100/50 line-through font-medium">S/ ${offer.originalPrice.toFixed(2)}</span>
                  </div>`
              }
              <span class="text-[10px] text-emerald-300/60 block font-medium mt-0.5">🌱 Salva ~${offer.impactKg} kg en Iquitos</span>
            </div>

            ${(isExpired || isSoldOut) 
              ? `<button disabled class="px-4 py-2 bg-emerald-950/60 text-emerald-400/50 text-xs font-bold rounded-2xl cursor-not-allowed border border-emerald-800/40">
                  ${isExpired ? 'Expirada' : 'Agotada'}
                </button>`
              : `<button onclick="openBookingModal('${offer.id}')" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-2xl shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition flex items-center space-x-1.5 border border-emerald-300/40">
                  <span>Reservar</span>
                  <svg class="w-3.5 h-3.5 text-slate-950" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>`
            }
          </div>
        </div>

      </article>
    `;
  }).join('');
}

// 5. Filtros por Categoría y Puntos de Referencia
function filterByCategory(category) {
  state.activeCategory = category;
  
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) {
      btn.className = "cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-emerald-500 text-slate-950 shadow-md border border-emerald-300";
    } else {
      btn.className = "cat-filter-btn px-4 py-2 rounded-full text-xs font-semibold text-emerald-100/80 bg-[#0A2D20] hover:bg-[#0E3A2A] transition-all border border-emerald-500/30";
    }
  });

  renderOffers();
}

function handleSearch(query) {
  state.searchQuery = query;
  renderOffers();
}

function filterByLandmark(landmark) {
  state.searchQuery = landmark;
  const input = document.getElementById('hero-location-input');
  if (input) input.value = landmark;
  renderOffers();
  scrollToOffers();
  showToast(`📍 Mostrando ofertas cerca de: ${landmark}`);
}

function scrollToOffers() {
  const el = document.getElementById('seccion-ofertas');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// 6. Carrito Rápido (Modal en Jade Oscuro con Precios en S/)
function openBookingModal(offerId) {
  const offer = state.offers.find(o => o.id === offerId);
  if (!offer || offer.stock <= 0 || offer.secondsLeft <= 0) return;

  state.currentBookingOfferId = offerId;
  state.bookingQuantity = 1;

  document.getElementById('modal-offer-title').textContent = offer.title;
  document.getElementById('modal-store-name').textContent = `${offer.store} • ${offer.landmark}`;
  document.getElementById('modal-address-info').textContent = offer.address;
  document.getElementById('modal-stock-info').textContent = `${offer.stock} paquetes disponibles en Iquitos`;
  document.getElementById('modal-category-badge').textContent = offer.category.toUpperCase();

  const now = new Date();
  now.setSeconds(now.getSeconds() + offer.secondsLeft);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('modal-pickup-deadline').textContent = `Hoy antes de las ${timeStr} h (Hora de Iquitos)`;

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
    document.getElementById('modal-original-price').textContent = `S/ ${(offer.originalPrice * state.bookingQuantity).toFixed(2)}`;
    document.getElementById('modal-total-price').textContent = 'S/ 0.00 GRATIS';
    document.getElementById('modal-savings-tag').textContent = '100% Solidario para Olla Común Belén';
  } else {
    const totalOriginal = offer.originalPrice * state.bookingQuantity;
    const totalRescue = offer.rescuePrice * state.bookingQuantity;
    const saved = totalOriginal - totalRescue;

    document.getElementById('modal-original-price').textContent = `S/ ${totalOriginal.toFixed(2)}`;
    document.getElementById('modal-total-price').textContent = `S/ ${totalRescue.toFixed(2)}`;
    document.getElementById('modal-savings-tag').textContent = `Ahorras S/ ${saved.toFixed(2)}`;
  }
}

function confirmReservation() {
  const offer = state.offers.find(o => o.id === state.currentBookingOfferId);
  if (!offer) return;

  offer.stock -= state.bookingQuantity;

  const reservationId = 'IQT-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  now.setSeconds(now.getSeconds() + offer.secondsLeft);
  const deadlineStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newRes = {
    id: reservationId,
    offerId: offer.id,
    title: offer.title,
    store: offer.store,
    landmark: offer.landmark,
    address: offer.address,
    quantity: state.bookingQuantity,
    totalPrice: offer.isFree ? 0 : (offer.rescuePrice * state.bookingQuantity),
    isFree: offer.isFree,
    deadline: deadlineStr,
    status: 'active',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  state.reservations.unshift(newRes);
  state.totalSavedKg += (offer.impactKg * state.bookingQuantity);

  saveState();
  renderOffers();
  updateCartBadge();
  closeBookingModal();

  showToast(`🎉 ¡Reserva #${reservationId} confirmada en Iquitos!`);

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
  document.getElementById('qr-store').textContent = `${res.store} • ${res.landmark}`;
  document.getElementById('qr-address').textContent = res.address;
  document.getElementById('qr-code-text').textContent = `#${res.id}`;
  document.getElementById('qr-deadline').textContent = `Recoger hoy antes de las ${res.deadline} h en Iquitos`;

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
  showToast('✅ ¡Comida rescatada con éxito en el local de Iquitos! ¡Buen provecho! 🌴');
}

// 8. Drawer de Carrito en Soles S/
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
    <div class="bg-[#092B1F] p-4 rounded-2xl border border-emerald-500/30 shadow-md space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-black font-mono text-emerald-300">#${res.id}</span>
        <span class="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">Listo para recoger</span>
      </div>
      <h4 class="font-bold text-sm text-white">${res.title}</h4>
      <p class="text-xs text-emerald-200/70">${res.store} • ${res.landmark}</p>
      
      <div class="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs">
        <span class="text-emerald-300/80">Límite: <strong>${res.deadline} h</strong></span>
        <span class="font-black text-emerald-300 text-sm">${res.isFree ? 'GRATIS' : 'S/ ' + res.totalPrice.toFixed(2)}</span>
      </div>

      <button onclick="toggleReservationsDrawer(); openQRModal('${res.id}')" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 mt-1 shadow-sm">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3"/></svg>
        <span>Ver Código QR de Retiro</span>
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

// 9. MÓDULO DE COMERCIO: REGISTRO Y PUBLICACIÓN EN IQUITOS
function openMerchantModal() {
  const modal = document.getElementById('merchant-modal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeMerchantModal() {
  const modal = document.getElementById('merchant-modal');
  modal.classList.add('opacity-0', 'pointer-events-none');
}

function switchMerchantTab(tab) {
  const regForm = document.getElementById('merchant-register-form');
  const pubForm = document.getElementById('merchant-publish-form');
  const tabBtnReg = document.getElementById('tab-btn-register');
  const tabBtnPub = document.getElementById('tab-btn-publish');

  if (tab === 'register') {
    regForm.classList.remove('hidden');
    pubForm.classList.add('hidden');
    tabBtnReg.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md transition";
    tabBtnPub.className = "flex-1 py-2 text-xs font-bold rounded-xl text-emerald-200 hover:text-white transition";
  } else {
    regForm.classList.add('hidden');
    pubForm.classList.remove('hidden');
    tabBtnReg.className = "flex-1 py-2 text-xs font-bold rounded-xl text-emerald-200 hover:text-white transition";
    tabBtnPub.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md transition";
  }
}

function registerNewMerchant(e) {
  e.preventDefault();
  const name = document.getElementById('reg-store-name').value.trim();
  const ruc = document.getElementById('reg-store-ruc').value.trim();
  const landmark = document.getElementById('reg-store-landmark').value;
  const address = document.getElementById('reg-store-address').value.trim();

  if (!name || !ruc) {
    showToast('⚠️ Completa el RUC y el nombre comercial');
    return;
  }

  state.registeredMerchants.push({ name, ruc, landmark, address });
  saveState();

  // Actualizar selector de comercios en el formulario de publicación
  const selectEl = document.getElementById('pub-store-select');
  if (selectEl) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name} (${landmark})`;
    selectEl.appendChild(opt);
    selectEl.value = name;
  }

  showToast(`🏢 ¡Comercio "${name}" registrado en Iquitos con éxito!`);
  switchMerchantTab('publish');
}

function publishNewOffer(e) {
  e.preventDefault();
  const store = document.getElementById('pub-store-select').value;
  const title = document.getElementById('pub-offer-title').value.trim();
  const category = document.getElementById('pub-offer-cat').value;
  const origPrice = parseFloat(document.getElementById('pub-orig-price').value) || 15.00;
  const isFree = document.getElementById('pub-is-free').checked;
  const rescuePrice = isFree ? 0 : (parseFloat(document.getElementById('pub-rescue-price').value) || 4.50);
  const stock = parseInt(document.getElementById('pub-stock').value) || 3;
  const minutes = parseInt(document.getElementById('pub-duration-mins').value) || 75;
  const landmark = document.getElementById('pub-store-landmark').value;

  if (!title) {
    showToast('⚠️ Ingresa el nombre del alimento a rescatar');
    return;
  }

  const categoryImages = {
    selvatico: 'hero-lomo-saltado.png',
    panaderia: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    mercado: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    jugos: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
    gratis: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80'
  };

  const newOffer = {
    id: 'off-iq-' + Date.now(),
    title: title,
    store: store,
    category: category,
    landmark: landmark,
    address: 'Iquitos, Loreto',
    originalPrice: origPrice,
    rescuePrice: rescuePrice,
    isFree: isFree,
    stock: stock,
    initialStock: stock,
    secondsLeft: minutes * 60,
    image: categoryImages[category] || categoryImages.selvatico,
    impactKg: (stock * 1.5).toFixed(1),
    badgeText: 'Publicación Reciente'
  };

  state.offers.unshift(newOffer);
  saveState();
  renderOffers();
  closeMerchantModal();

  showToast(`🚀 ¡Oferta "${title}" publicada en Iquitos con temporizador activo!`);
  scrollToOffers();
}

function togglePriceInput(isFree) {
  const container = document.getElementById('pub-price-container');
  if (isFree) {
    container.classList.add('opacity-40', 'pointer-events-none');
  } else {
    container.classList.remove('opacity-40', 'pointer-events-none');
  }
}

// 10. Toast Notificación
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

// 11. Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
