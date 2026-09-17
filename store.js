/**
 * store.js
 * Lógica principal del catálogo de e-commerce "SITIO-WEB-DEXTER-TIENDA"
 * Conexión viva a Supabase y catálogo offline de respaldo ultra premium
 */

// Configuración protegida (ofuscada)
const _dc = (c) => c.map(p => atob(p)).join('');
const SUPABASE_URL = _dc(["aHR0cHM6Ly8=", "cWxpbmZnc3E=", "cHp5aGlvcXk=", "Z2V2di5zdXA=", "YWJhc2UuY28="]);
const SUPABASE_KEY = _dc(["ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFg=", "VkNKOS5leUpwYzNNaU9pSnpkWEJoWW1GelpTSXNJbko=", "bFppSTZJbkZzYVc1bVozTnhjSHA1YUdsdmNYbG5aWFo=", "Mklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakU=", "M056Y3hOVFkxTnpjc0ltVjRjQ0k2TWpBNU1qY3pNalU=", "M04zMC40QWl0akN0cVZWTnVyOEFWN0ZvQTdEcDFtUG8=", "bG44Q2Vhem00Z3BkSnhUMA=="]);
const WHATSAPP_PHONE = _dc(["NTI3MzQx", "NDM5Nzc5"]);

let supabaseClient = null;
let allProducts = [];
let filteredProducts = [];
let cart = [];
let activeCategory = 'TODAS';
let searchQuery = '';
let selectedCardSizes = {};

// Respaldo de productos Premium si no conecta a Supabase o no hay datos
const FALLBACK_PRODUCTS = [
    {
        id: 9901,
        created_at: new Date().toISOString(),
        nombre: "Chaqueta Bomber Terracota",
        descripcion: "Chaqueta acolchada impermeable con detalles premium en color terracota de temporada. Forro interno térmico.",
        precioVenta: 89.99,
        categoria: "ROPA",
        stock: 24,
        imagen_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 901, talla: "S", color: "Terracota", stock: 5 },
            { id: 902, talla: "M", color: "Terracota", stock: 8 },
            { id: 903, talla: "L", color: "Terracota", stock: 7 },
            { id: 904, talla: "XL", color: "Terracota", stock: 4 }
        ]
    },
    {
        id: 9902,
        nombre: "Tenis Nike Air Max Retro",
        descripcion: "Tenis de colección con suela amortiguadora de aire de alto confort y diseño vintage urbano premium.",
        precioVenta: 139.99,
        categoria: "CALZADO",
        stock: 15,
        imagen_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 905, talla: "US 8", color: "Rojo/Negro", stock: 3 },
            { id: 906, talla: "US 9", color: "Rojo/Negro", stock: 5 },
            { id: 907, talla: "US 10", color: "Rojo/Negro", stock: 4 },
            { id: 908, talla: "US 11", color: "Rojo/Negro", stock: 3 }
        ]
    },
    {
        id: 9903,
        nombre: "Gorra Mora Classic",
        descripcion: "Gorra de béisbol con logo Mora bordado en relieve dorado. Ajustable y ultra resistente.",
        precioVenta: 29.99,
        categoria: "ACCESORIOS",
        stock: 45,
        imagen_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 909, talla: "Única", color: "Negro/Oro", stock: 25 },
            { id: 910, talla: "Única", color: "Blanco/Oro", stock: 20 }
        ]
    },
    {
        id: 9904,
        nombre: "Camiseta Algodón Orgánico",
        descripcion: "Camiseta básica de algodón orgánico hilado en anillo de máxima frescura y tacto súper suave.",
        precioVenta: 24.99,
        categoria: "ROPA",
        stock: 50,
        imagen_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 911, talla: "M", color: "Negro Carbono", stock: 15 },
            { id: 912, talla: "L", color: "Negro Carbono", stock: 20 },
            { id: 913, talla: "M", color: "Blanco Crudo", stock: 10 },
            { id: 914, talla: "L", color: "Blanco Crudo", stock: 5 }
        ]
    },
    {
        id: 9905,
        nombre: "Botas de Piel Clásicas",
        descripcion: "Botas artesanales de piel genuina curtida al aceite con costuras reforzadas y suela todoterreno.",
        precioVenta: 159.99,
        categoria: "CALZADO",
        stock: 12,
        imagen_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 915, talla: "US 8.5", color: "Marrón Hojarasca", stock: 4 },
            { id: 916, talla: "US 9.5", color: "Marrón Hojarasca", stock: 5 },
            { id: 917, talla: "US 10.5", color: "Marrón Hojarasca", stock: 3 }
        ]
    },
    {
        id: 9906,
        nombre: "Reloj Minimalista Mora",
        descripcion: "Reloj analógico de cuarzo con correa de cuero italiano y carátula minimalista negra en caja dorada.",
        precioVenta: 99.99,
        categoria: "ACCESORIOS",
        stock: 8,
        imagen_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
        variantes: [
            { id: 918, talla: "Única", color: "Negro/Oro", stock: 8 }
        ]
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Iniciar animación de Splash Screen (2 segundos de intro)
    initSplashScreen();

    // 1. Inicializar Hero Slider (Portadas estilo New Era)
    renderHeroSlider();

    // 2. Inicializar Supabase si está disponible
    initSupabase();

    // 3. Cargar productos
    await fetchProducts();

    // 4. Configurar Eventos UI
    setupEvents();

    // 5. Renderizar Interfaz
    renderCategories();
    renderNewProducts();
    filterCatalog();
    updateCartUI();
    updateUserDropdownUI();
    updateFavoritesBadge();
});

// Actualizar información del menú desplegable del usuario y sincronizar la nube en tiempo real
async function updateUserDropdownUI() {
    const nameEl = document.getElementById('dropdownUserName');
    const emailEl = document.getElementById('dropdownUserEmail');
    const logoutBtn = document.getElementById('dropdownLogoutBtn');

    if (supabaseClient && supabaseClient.auth) {
        try {
            // Usar getUser() para consultar el servidor de Supabase en tiempo real (Celular / Laptop)
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                const fullName = user.user_metadata?.nombre_completo || 'Cliente';
                const firstName = fullName.trim().split(' ')[0];
                if (nameEl) nameEl.textContent = `Hola, ${firstName} 👋`;
                if (emailEl) emailEl.textContent = user.email || 'Sesión Activa';
                if (logoutBtn) logoutBtn.style.display = 'flex';

                // Sincronizar Favoritos Nube <-> Local
                const userKey = `imperial_favs_${user.id}`;
                const cloudFavs = user.user_metadata?.favoritos || [];
                let localFavs = [];
                try { localFavs = JSON.parse(localStorage.getItem(userKey)) || []; } catch (e) { }
                const guestFavs = JSON.parse(localStorage.getItem('imperial_favs_guest')) || [];

                const combinedFavs = [...new Set([...cloudFavs, ...localFavs, ...guestFavs])];
                localStorage.setItem(userKey, JSON.stringify(combinedFavs));
                if (guestFavs.length > 0) {
                    localStorage.removeItem('imperial_favs_guest');
                }

                if (JSON.stringify(combinedFavs) !== JSON.stringify(cloudFavs)) {
                    await supabaseClient.auth.updateUser({ data: { favoritos: combinedFavs } });
                }

                updateFavoritesBadge();
                return;
            }
        } catch (e) { }
    }

    if (nameEl) nameEl.textContent = 'Mi Cuenta';
    if (emailEl) emailEl.textContent = 'Iniciar Sesión / Registro';
    if (logoutBtn) logoutBtn.style.display = 'none';
    updateFavoritesBadge();
}

window.handleGlobalLogout = async () => {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('imperial_favs_guest');
    window.location.reload();
};

// ==========================================
// PORTADAS / SLIDES DEL BANNER PRINCIPAL (HERO)
// ==========================================
// Puedes configurar la alineación de texto y botón con 'alineacion': "right", "left" o "center".
const HERO_SLIDES = [
    {
        id: 1,
        imagen: "portada_playeras.jpg",
        imagenFallback: "portada_playeras.jpg",
        tag: "NUEVA COLECCIÓN",
        titulo: "PLAYERAS IMPERIAL DESIGN",
        descripcion: "Diseño urbano exclusivo, algodón premium y estampado de alta definición.",
        botonTexto: "COMPRAR AHORA",
        categoria: "PLAYERA",
        alineacion: "right" // Alineado a la derecha para dejar visible el estampado de la playera
    },
    {
        id: 2,
        imagen: "PORTADA_SUDADERA.jpg",
        imagenFallback: "PORTADA_SUDADERA.jpg",
        tag: "HOODIES & SWEATERS",
        titulo: "SUDADERAS & OVERSHIRT",
        descripcion: "Máxima presencia y comodidad con nuestro corte oversized de temporada.",
        botonTexto: "VER SUDADERAS",
        categoria: "SUDADERAS",
        alineacion: "left"
    },
    {
        id: 3,
        imagen: "portada_gorras.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1600&auto=format&fit=crop",
        tag: "EDICIÓN LIMITADA",
        titulo: "GORRAS & SNAPBACKS",
        descripcion: "Bordados con relieve en hilo de oro y siluetas oficiales.",
        botonTexto: "VER GORRAS",
        categoria: "GORRA",
        alineacion: "center"
    },
    {
        id: 4,
        imagen: "PORTADA_SNKRS.jpg",
        imagenFallback: "PORTADA_SNKRS.jpg",
        tag: "STREETWEAR SNEAKERS",
        titulo: "CALZADO & TENIS",
        descripcion: "Pisa fuerte con la selección de calzado urbano y sneakers exclusivos.",
        botonTexto: "VER CALZADO",
        categoria: "SNKRS",
        alineacion: "right"
    }
];

let currentHeroSlide = 0;
let heroSlideTimer = null;

function renderHeroSlider() {
    const wrapper = document.getElementById('heroSlidesWrapper');
    const pagination = document.getElementById('sliderPagination');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const sliderSection = document.getElementById('heroSlider');

    if (!wrapper || !pagination) return;

    // Renderizar Slides con alineación dinámica (derecha, izquierda, centro)
    wrapper.innerHTML = HERO_SLIDES.map((slide, i) => {
        const alignClass = slide.alineacion === 'right' ? 'align-right' : (slide.alineacion === 'left' ? 'align-left' : 'align-center');
        return `
        <div class="hero-slide ${alignClass} ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${slide.imagen}" 
                 onerror="if('${slide.imagenFallback}' && this.src !== '${slide.imagenFallback}') this.src='${slide.imagenFallback}';" 
                 alt="${slide.titulo}" 
                 class="hero-slide-bg">
            <div class="hero-slide-overlay"></div>
            <div class="hero-slide-content">
                <span class="hero-slide-tag">${slide.tag}</span>
                <h2 class="hero-slide-title">${slide.titulo}</h2>
                <p class="hero-slide-desc">${slide.descripcion}</p>
                <button class="hero-slide-btn" onclick="handleHeroCTAClick('${slide.categoria}')">
                    ${slide.botonTexto} <i class="fa-solid fa-arrow-right" style="margin-left:8px; font-size:12px;"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Renderizar Paginación (Puntos)
    pagination.innerHTML = HERO_SLIDES.map((_, i) => `
        <button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');

    // Eventos de Puntos
    pagination.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            goToHeroSlide(idx);
            resetHeroTimer();
        });
    });

    // Eventos Flechas
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToHeroSlide((currentHeroSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
            resetHeroTimer();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToHeroSlide((currentHeroSlide + 1) % HERO_SLIDES.length);
            resetHeroTimer();
        });
    }

    // Touch Swipe en Móviles
    let touchStartX = 0;
    let touchEndX = 0;

    if (sliderSection) {
        sliderSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 45;
            if (touchStartX - touchEndX > threshold) {
                // Swipe Izquierda -> Siguiente
                goToHeroSlide((currentHeroSlide + 1) % HERO_SLIDES.length);
                resetHeroTimer();
            } else if (touchEndX - touchStartX > threshold) {
                // Swipe Derecha -> Anterior
                goToHeroSlide((currentHeroSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                resetHeroTimer();
            }
        }, { passive: true });

        // Pausar en hover (desktop)
        sliderSection.addEventListener('mouseenter', () => clearInterval(heroSlideTimer));
        sliderSection.addEventListener('mouseleave', () => startHeroTimer());
    }

    // Iniciar temporizador automático (cada 5 segundos)
    startHeroTimer();
}

function goToHeroSlide(index) {
    currentHeroSlide = index;
    const wrapper = document.getElementById('heroSlidesWrapper');
    const dots = document.querySelectorAll('.slider-dot');
    const slides = document.querySelectorAll('.hero-slide');

    if (wrapper) {
        wrapper.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
    }

    dots.forEach((d, i) => {
        if (i === currentHeroSlide) d.classList.add('active');
        else d.classList.remove('active');
    });

    slides.forEach((s, i) => {
        if (i === currentHeroSlide) s.classList.add('active');
        else s.classList.remove('active');
    });
}

function startHeroTimer() {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
        goToHeroSlide((currentHeroSlide + 1) % HERO_SLIDES.length);
    }, 5000);
}

function resetHeroTimer() {
    startHeroTimer();
}

// Helper para desplazamiento suave sin que el header/buscador tape el contenido
function scrollToWithHeaderOffset(elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    const header = document.getElementById('storeHeader');
    const headerHeight = header ? header.offsetHeight : 140;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - headerHeight - 16);

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Acción al hacer clic en el botón de compra del slide
window.handleHeroCTAClick = (categoria) => {
    if (categoria) {
        selectCategory(categoria.toUpperCase());
    }
    const catalogHeader = document.getElementById('catalogHeaderBar') || document.getElementById('catalogGrid') || document.querySelector('main');
    if (catalogHeader) {
        scrollToWithHeaderOffset(catalogHeader);
    }
};

// Splash Screen / Preloader intro timer
function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    // Mostrar durante 2 segundos (2000 ms) antes del fade-out
    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 700);
    }, 2000);
}

// Inicializar cliente Supabase
function initSupabase() {
    try {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase inicializado correctamente.");
        } else {
            console.log("Supabase CDN no disponible. Cargando en modo local/offline de demostración.");
        }
    } catch (e) {
        console.error("Error inicializando Supabase:", e);
    }
}

// Cargar productos de base de datos o fallback
async function fetchProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('store') || urlParams.get('comercio') || '105';

    try {
        let data = null;

        // 1. Intentar por cliente oficial de Supabase
        if (supabaseClient) {
            try {
                const { data: resData, error } = await supabaseClient.from('productos').select('*, variantes(*)').eq('comercio_id', parseInt(storeId));
                if (!error && resData && resData.length > 0) {
                    data = resData;
                }
            } catch (err) {
                console.log("Consulta cliente Supabase aviso:", err);
            }
        }

        // 2. Respaldo por REST directo si la consulta cliente no trajo datos
        if (!data || data.length === 0) {
            const restRes = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*,variantes(*)&comercio_id=eq.${storeId}`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            if (restRes.ok) {
                const restData = await restRes.json();
                if (restData && restData.length > 0) {
                    data = restData;
                }
            }
        }

        // 3. Procesar y mapear productos reales
        if (data && data.length > 0) {
            allProducts = data.map(p => {
                const stockFromVar = (p.variantes || []).reduce((sum, v) => sum + (v.stock || 0), 0);
                const directStock = p.stock || 0;
                // El stock total proviene de las variantes si las hay, o del stock directo
                const stockTotal = (p.variantes && p.variantes.length > 0) ? stockFromVar : directStock;

                return {
                    id: p.id,
                    created_at: p.created_at || p.fecha_creacion || new Date().toISOString(),
                    nombre: p.nombre,
                    descripcion: p.descripcion || 'Sin descripción disponible.',
                    precioVenta: p.precio_venta || p.precioVenta || 0,
                    categoria: (p.categoria || 'GENERAL').toUpperCase(),
                    stock: stockTotal,
                    imagen_url: p.imagen_url || null,
                    imagen_url_2: p.imagen_url_2 || null,
                    imagen_url_3: p.imagen_url_3 || null,
                    imagen_url_4: p.imagen_url_4 || null,
                    variantes: p.variantes || []
                };
            });

            // Filtrado de stock activo
            allProducts = allProducts.filter(p => p.stock > 0);
            console.log(`Cargados ${allProducts.length} productos reales desde Supabase.`);
            return;
        }
    } catch (e) {
        console.error("Error leyendo Supabase, usando respaldo:", e);
    }

    // Carga de respaldo offline únicamente si falla la red
    allProducts = [...FALLBACK_PRODUCTS].filter(p => p.stock > 0);
    console.log("Cargado catálogo de respaldo offline.");
}

// Configurar los eventos interactivos
function setupEvents() {
    // Transición de barra superior al hacer scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Abrir/Cerrar carrito
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');

    const openCart = () => {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
    };

    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
    };

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // ==========================================
    // MENÚ LATERAL MÓVIL (DRAWER)
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileDrawerBtn = document.getElementById('closeMobileDrawerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');

    const openMobileDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.add('active');
        if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
    };

    const closeMobileDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.remove('active');
        if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
    if (closeMobileDrawerBtn) closeMobileDrawerBtn.addEventListener('click', closeMobileDrawer);
    if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

    const drawerNovedadesLink = document.getElementById('drawerNovedadesLink');
    if (drawerNovedadesLink) {
        drawerNovedadesLink.addEventListener('click', () => {
            closeMobileDrawer();
        });
    }

    const drawerContactoLink = document.getElementById('drawerContactoLink');
    if (drawerContactoLink) {
        drawerContactoLink.addEventListener('click', () => {
            closeMobileDrawer();
        });
    }

    // ==========================================
    // BUSCADOR FLOTANTE / EXPANDIBLE
    // ==========================================
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const desktopSearchBtn = document.getElementById('desktopSearchBtn');
    const headerSearchBar = document.getElementById('headerSearchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    const toggleSearchBar = () => {
        if (headerSearchBar) {
            headerSearchBar.classList.toggle('active');
            if (headerSearchBar.classList.contains('active')) {
                setTimeout(() => searchInput && searchInput.focus(), 150);
            }
        }
    };

    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', toggleSearchBar);
    if (desktopSearchBtn) desktopSearchBtn.addEventListener('click', toggleSearchBar);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            if (searchClearBtn) {
                if (searchQuery.length > 0) {
                    searchClearBtn.classList.add('visible');
                } else {
                    searchClearBtn.classList.remove('visible');
                }
            }
            filterCatalog();
        });
    }

    if (searchClearBtn && searchInput) {
        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClearBtn.classList.remove('visible');
            filterCatalog();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            searchInput.focus();
        });
    }

    // ==========================================
    // BOTÓN DE FAVORITOS Y PERFIL/CONTACTO
    // ==========================================
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            window.location.href = 'perfil.html?tab=favoritos';
        });
    }

    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', async () => {
            if (supabaseClient) {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session && session.user) {
                        window.location.href = 'perfil.html';
                        return;
                    }
                } catch (e) { }
            }
            window.location.href = 'login.html';
        });
    }

    // Cerrar Selector de Variantes Modal
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeVariantModal);
    const variantModalOverlay = document.getElementById('variantModalOverlay');
    if (variantModalOverlay) {
        variantModalOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'variantModalOverlay') closeVariantModal();
        });
    }

    // Cerrar Modal de Detalles
    const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', closeDetailModal);
    const detailModalOverlay = document.getElementById('detailModalOverlay');
    if (detailModalOverlay) {
        detailModalOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'detailModalOverlay') closeDetailModal();
        });
    }

    // Checkout -> Redirección a la interfaz completa de Checkout (checkout.html)
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast("Carrito Vacío", "Agrega al menos una prenda antes de proceder al pago.", "error");
                return;
            }
            localStorage.setItem('imperial_cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
    }
}

// Renderizar dinámicamente las pestañas de categorías (Desktop y Móvil)
function renderCategories() {
    const desktopContainer = document.getElementById('categoriesContainer');
    const mobileContainer = document.getElementById('mobileCategoriesList');

    const dbCategories = allProducts.map(p => (p.categoria || '').trim().toUpperCase()).filter(Boolean);
    const categories = ['TODAS', ...new Set(dbCategories)];

    // 1. Renderizar en Desktop (Barra central)
    if (desktopContainer) {
        desktopContainer.innerHTML = categories.map(cat => `
            <button class="category-tab ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        desktopContainer.querySelectorAll('.category-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = e.currentTarget.getAttribute('data-category');
                selectCategory(selected);
            });
        });
    }

    // 2. Renderizar en Mobile Drawer
    if (mobileContainer) {
        mobileContainer.innerHTML = categories.map(cat => `
            <button class="mobile-drawer-cat-btn ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
                <span>${cat}</span>
                <i class="fa-solid fa-chevron-right" style="font-size:11px; opacity:0.6;"></i>
            </button>
        `).join('');

        mobileContainer.querySelectorAll('.mobile-drawer-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = e.currentTarget.getAttribute('data-category');
                selectCategory(selected);

                // Cerrar drawer al elegir categoría
                const mobileDrawer = document.getElementById('mobileDrawer');
                const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
                if (mobileDrawer) mobileDrawer.classList.remove('active');
                if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');

                // Scroll suave al catálogo
                const catalogHeader = document.getElementById('catalogHeaderBar');
                if (catalogHeader) {
                    catalogHeader.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Evento para botón Specials / Novedades
    const specialsTab = document.getElementById('specialsTab');
    if (specialsTab && !specialsTab.dataset.bound) {
        specialsTab.dataset.bound = "true";
        specialsTab.addEventListener('click', () => {
            const newSec = document.getElementById('newProductsSection');
            if (newSec) {
                newSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// Función unificada para seleccionar categoría y sincronizar interfaces
function selectCategory(categoryName) {
    activeCategory = categoryName;

    // Sincronizar desktop tabs
    const desktopContainer = document.getElementById('categoriesContainer');
    if (desktopContainer) {
        desktopContainer.querySelectorAll('.category-tab').forEach(btn => {
            if (btn.getAttribute('data-category') === categoryName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Sincronizar mobile tabs
    const mobileContainer = document.getElementById('mobileCategoriesList');
    if (mobileContainer) {
        mobileContainer.querySelectorAll('.mobile-drawer-cat-btn').forEach(btn => {
            if (btn.getAttribute('data-category') === categoryName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    filterCatalog();
}

// Filtrar catálogo por búsqueda y categoría
function filterCatalog() {
    filteredProducts = allProducts;

    if (activeCategory !== 'TODAS') {
        filteredProducts = filteredProducts.filter(p => {
            const cat = (p.categoria || '').toUpperCase();
            if (cat === activeCategory) return true;

            // Filtro dinámico si la categoría seleccionada es PLAYERAS o SUDADERAS
            if (activeCategory === 'PLAYERAS' && (cat === 'ROPA' || cat === 'GENERAL')) {
                const name = (p.nombre || '').toLowerCase();
                const desc = (p.descripcion || '').toLowerCase();
                return name.includes('playera') || name.includes('camiseta') || name.includes('t-shirt') || desc.includes('playera') || desc.includes('camiseta');
            }

            if (activeCategory === 'SUDADERAS' && (cat === 'ROPA' || cat === 'GENERAL')) {
                const name = (p.nombre || '').toLowerCase();
                const desc = (p.descripcion || '').toLowerCase();
                return name.includes('sudadera') || name.includes('hoodie') || name.includes('overshirt') || desc.includes('sudadera') || desc.includes('hoodie');
            }

            return false;
        });
    }

    const heroSliderSection = document.getElementById('heroSliderSection');
    const newProductsSection = document.getElementById('newProductsSection');

    if (searchQuery && searchQuery.length > 0) {
        // Al buscar: Ocultar el banner de portada y la sección de productos destacados
        if (heroSliderSection) heroSliderSection.style.display = 'none';
        if (newProductsSection) newProductsSection.style.display = 'none';

        filteredProducts = filteredProducts.filter(p => {
            const matchNombre = p.nombre && p.nombre.toLowerCase().includes(searchQuery);
            const matchDesc = p.descripcion && p.descripcion.toLowerCase().includes(searchQuery);
            const matchVariante = p.variantes && p.variantes.some(v =>
                (v.talla && v.talla.toLowerCase().includes(searchQuery)) ||
                (v.color && v.color.toLowerCase().includes(searchQuery))
            );
            return matchNombre || matchDesc || matchVariante;
        });

        // Subir automáticamente a los productos encontrados sin tapar con la barra
        const catalogGrid = document.getElementById('catalogGrid') || document.querySelector('main');
        if (catalogGrid) {
            scrollToWithHeaderOffset(catalogGrid);
        }
    } else {
        // Al limpiar la búsqueda: Volver a mostrar el banner de portada y productos destacados
        if (heroSliderSection) heroSliderSection.style.display = 'block';
        if (newProductsSection) newProductsSection.style.display = 'block';
    }

    // Actualizar indicador de productos encontrados
    const badge = document.getElementById('catalogResultsCount');
    if (badge) {
        const count = filteredProducts.length;
        if (searchQuery) {
            badge.textContent = `${count} resultado${count !== 1 ? 's' : ''} para "${searchQuery}"`;
        } else if (activeCategory !== 'TODAS') {
            badge.textContent = `${count} producto${count !== 1 ? 's' : ''} en ${activeCategory}`;
        } else {
            badge.textContent = `${count} producto${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}`;
        }
    }

    renderCatalog();
}

// ==================================================
// GESTIÓN DE FAVORITOS (PERSISTENTE POR CUENTA)
// ==================================================
function getFavoritesStorageKey() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.includes('auth-token') || k.includes('supabase.auth'))) {
                const val = localStorage.getItem(k);
                if (val && val.includes('"id"')) {
                    const parsed = JSON.parse(val);
                    const uid = parsed?.user?.id || parsed?.currentSession?.user?.id || parsed?.user?.email;
                    if (uid) return `imperial_favs_${uid}`;
                }
            }
        }
    } catch (e) { }
    return 'imperial_favs_guest';
}

function getFavorites() {
    const key = getFavoritesStorageKey();
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) { }
    return [];
}

async function saveFavorites(favs) {
    const key = getFavoritesStorageKey();
    localStorage.setItem(key, JSON.stringify(favs));
    updateFavoritesBadge();

    if (key !== 'imperial_favs_guest' && supabaseClient && supabaseClient.auth) {
        try {
            await supabaseClient.auth.updateUser({
                data: { favoritos: favs }
            });
        } catch (e) {
            console.log("Aviso guardando favoritos en Supabase:", e);
        }
    }
}

function isFavorite(productId) {
    return getFavorites().some(fid => String(fid) === String(productId));
}

function toggleFavorite(event, productId) {
    if (event) event.stopPropagation();
    let favs = getFavorites();
    const index = favs.findIndex(fid => String(fid) === String(productId));

    if (index > -1) {
        favs.splice(index, 1);
        showToast("Favoritos", "Producto eliminado de tus favoritos.", "info");
    } else {
        favs.push(productId);
        showToast("Favoritos", "¡Producto guardado en tus favoritos! ❤️", "success");
    }

    saveFavorites(favs);
    renderCatalog();
    renderNewProducts();
}

function updateFavoritesBadge() {
    const favs = getFavorites();
    const badge = document.getElementById('wishlistCount');
    if (badge) {
        badge.textContent = favs.length;
        badge.style.display = favs.length > 0 ? 'inline-flex' : 'none';
    }
}

// Generar HTML de la tarjeta de producto
function generateProductCardHTML(p) {
    const hasStock = p.stock > 0;
    const isFav = isFavorite(p.id);

    const mainImg = p.imagen_url
        ? `<img src="${p.imagen_url}" alt="${p.nombre}" class="product-image">`
        : `<div class="product-image-fallback"><i class="fa-solid fa-layer-group"></i></div>`;

    const badge = hasStock
        ? `<span class="product-badge badge-tag">${p.categoria}</span>`
        : `<span class="product-badge badge-out-of-stock">Agotado</span>`;

    const favBtn = `
        <button class="favorite-card-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${p.id})" title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
    `;

    // Extraer tallas únicas de las variantes en stock
    const uniqueSizes = p.variantes && p.variantes.length > 0
        ? [...new Set(p.variantes.filter(v => v.stock > 0).map(v => v.talla).filter(Boolean))]
        : [];

    let sizesHTML = '';
    if (uniqueSizes.length > 0) {
        sizesHTML = `
            <div style="margin-top: 12px; margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Tallas Disponibles:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${uniqueSizes.map(size => {
            const isActive = selectedCardSizes[p.id] === size;
            return `
                            <button class="size-pill-btn ${isActive ? 'active' : ''}" onclick="selectCardSize(event, ${p.id}, '${size}')" data-product-id="${p.id}" data-size="${size}">
                                ${size}
                            </button>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="product-card">
            <div class="product-image-container product-clickable" onclick="openDetailModal(${p.id})">
                ${badge}
                ${favBtn}
                ${mainImg}
            </div>
            <div class="product-info">
                <div class="product-category">${p.categoria}</div>
                <div class="product-title product-clickable" onclick="openDetailModal(${p.id})" title="${p.nombre}">${p.nombre}</div>
                <div class="product-desc product-clickable" onclick="openDetailModal(${p.id})">${p.descripcion}</div>
                
                ${sizesHTML}
                
                <button class="btn-detail-link" onclick="openDetailModal(${p.id})">
                    <i class="fa-solid fa-eye"></i> Ver Detalle
                </button>
                
                <div class="product-footer">
                    <div class="product-price">$${p.precioVenta.toFixed(2)}</div>
                    <button class="btn-add-cart" onclick="handleAddToCart(${p.id})" ${!hasStock ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar nuevos productos
function renderNewProducts() {
    const grid = document.getElementById('newProductsGrid');
    const section = document.getElementById('newProductsSection');
    if (!grid) return;

    // Cambiado temporalmente a 365 días para forzar que se muestre algo
    const newProducts = [...allProducts].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fecha_creacion || 0);
        const dateB = new Date(b.created_at || b.fecha_creacion || 0);
        return dateB - dateA;
    }).slice(0, 8); // Mostrar los 8 productos más recientes o destacados

    console.log("Nuevos productos encontrados:", newProducts.length);

    if (newProducts.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    if (section) section.style.display = 'block';

    grid.innerHTML = newProducts.map(p => generateProductCardHTML(p)).join('');
}

// Renderizar cuadrícula del catálogo
function renderCatalog() {
    const grid = document.getElementById('catalogGrid');

    const targets = searchQuery || activeCategory !== 'TODAS' ? filteredProducts : allProducts;

    if (targets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-face-frown" style="font-size: 40px; margin-bottom: 12px; color: var(--accent);"></i>
                <p>No se encontraron productos disponibles en esta sección.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = targets.map(p => generateProductCardHTML(p)).join('');
}

// Manejar clic en "Añadir a carrito" desde la tarjeta principal
window.handleAddToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.variantes && product.variantes.length > 0) {
        const selectedSize = selectedCardSizes[productId];
        if (!selectedSize) {
            showToast("Elige una talla", "Por favor, selecciona una talla antes de añadir al carrito.", "error");

            // Animación de vibración en las píldoras de talla de este producto
            document.querySelectorAll(`.size-pill-btn[data-product-id="${productId}"]`).forEach(btn => {
                btn.classList.add('shake-animation');
                setTimeout(() => btn.classList.remove('shake-animation'), 500);
            });
            return;
        }

        // Buscar variante disponible que coincida con la talla seleccionada
        const matchedVariant = product.variantes.find(v => v.talla === selectedSize && v.stock > 0);
        if (matchedVariant) {
            addToCart(product, matchedVariant);
        } else {
            showToast("Agotado", "La talla seleccionada no tiene stock disponible.", "error");
        }
    } else {
        // Si no tiene variantes, agregar directamente
        addToCart(product, null);
    }
};

// Seleccionar talla desde la tarjeta de producto
window.selectCardSize = (event, productId, size) => {
    event.stopPropagation(); // Prevenir que el clic en la talla abra el modal de detalles

    selectedCardSizes[productId] = size;

    // Desactivar otros botones de talla en esta tarjeta
    document.querySelectorAll(`.size-pill-btn[data-product-id="${productId}"]`).forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar el botón clicado
    event.target.classList.add('active');
};

// Abrir modal de selección de variantes
function openVariantModal(product) {
    const overlay = document.getElementById('variantModalOverlay');
    const title = document.getElementById('variantModalTitle');
    const tbody = document.getElementById('variantModalBody');

    title.textContent = `Variantes de ${product.nombre}`;

    const stockVariants = product.variantes.filter(v => v.stock > 0);

    if (stockVariants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--danger);">Sin unidades en stock</td></tr>';
    } else {
        tbody.innerHTML = stockVariants.map(v => `
            <tr>
                <td style="font-weight:700; color:var(--text-primary);">${v.talla || 'N/A'}</td>
                <td>${v.color || 'N/A'}</td>
                <td><span style="font-size:12px; font-weight:600; padding:2px 8px; border-radius:4px; background:var(--success-glow); color:var(--success);">${v.stock} un.</span></td>
                <td>
                    <button class="btn btn-primary btn-small" style="padding: 4px 10px; border-radius: 6px; font-size:11px;" onclick="addToCartFromModal(${product.id}, ${v.id})">
                        <i class="fa-solid fa-plus"></i> Seleccionar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    overlay.classList.add('active');
}

function closeVariantModal() {
    document.getElementById('variantModalOverlay').classList.remove('active');
}

// Añadir al carrito desde el modal
window.addToCartFromModal = (productId, variantId) => {
    const product = allProducts.find(p => p.id === productId);
    const variant = product.variantes.find(v => v.id === variantId);
    if (product && variant) {
        addToCart(product, variant);
        closeVariantModal();
    }
};

// Añadir al carrito core
function addToCart(product, variant = null) {
    const variantKey = variant ? variant.id : 'default';
    const existingItem = cart.find(item => item.product_id === product.id && item.variant_id === variantKey);

    const maxStock = variant ? variant.stock : product.stock;

    if (existingItem) {
        if (existingItem.cantidad < maxStock) {
            existingItem.cantidad++;
            showToast("Añadido", `Se aumentó la cantidad de ${product.nombre} en el carrito.`);
        } else {
            showToast("Sin Stock", `Alcanzaste el límite de unidades disponibles para este producto.`, "error");
            return;
        }
    } else {
        cart.push({
            product_id: product.id,
            variant_id: variantKey,
            nombre: product.nombre,
            descripcion: product.descripcion,
            talla: variant ? variant.talla : '',
            color: variant ? variant.color : '',
            precioUnitario: product.precioVenta,
            cantidad: 1,
            max_stock: maxStock,
            imagen_url: product.imagen_url
        });
        showToast("Carrito", `${product.nombre} se agregó a tus compras.`);
    }

    updateCartUI();
}

// Actualizar cantidad en carrito
window.updateCartQty = (index, delta) => {
    const item = cart[index];
    const newQty = item.cantidad + delta;

    if (newQty <= 0) {
        cart.splice(index, 1);
        showToast("Eliminado", `${item.nombre} eliminado del carrito.`);
    } else if (newQty > item.max_stock) {
        showToast("Límite de Stock", "No hay más existencias de esta variante.", "error");
    } else {
        item.cantidad = newQty;
    }

    updateCartUI();
};

// Remover completamente del carrito
window.removeFromCart = (index) => {
    const item = cart[index];
    cart.splice(index, 1);
    showToast("Eliminado", `${item.nombre} removido del carrito.`);
    updateCartUI();
};

// Sincronizar UI del carrito
function updateCartUI() {
    const cartList = document.getElementById('cartItemsList');
    const totalCountEl = document.getElementById('cartTotalCount');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');

    // Contador total del trigger
    const totalQty = cart.reduce((sum, item) => sum + item.cantidad, 0);
    totalCountEl.textContent = totalQty;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-basket-shopping cart-empty-icon"></i>
                <p>Tu carrito está completamente vacío.</p>
            </div>
        `;
        summarySubtotal.textContent = "$0.00";
        summaryTotal.textContent = "$0.00";
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map((item, index) => {
        const itemTotal = item.cantidad * item.precioUnitario;
        total += itemTotal;

        const imgHtml = item.imagen_url
            ? `<img src="${item.imagen_url}" alt="${item.nombre}" class="cart-item-image">`
            : `<div class="cart-item-image" style="display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.1);"><i class="fa-solid fa-image" style="color:var(--text-muted);"></i></div>`;

        const variantText = item.talla || item.color
            ? `${item.talla ? 'Talla: ' + item.talla : ''} ${item.color ? '| Color: ' + item.color : ''}`
            : 'Estándar';

        return `
            <div class="cart-drawer-item">
                ${imgHtml}
                <div class="cart-item-info">
                    <div class="cart-item-name" title="${item.nombre}">${item.nombre}</div>
                    <div class="cart-item-variant">${variantText}</div>
                    <div class="cart-item-controls">
                        <button class="qty-control-btn" onclick="updateCartQty(${index}, -1)">-</button>
                        <div class="qty-display">${item.cantidad}</div>
                        <button class="qty-control-btn" onclick="updateCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-price-block">
                    <div class="cart-item-total-price">$${itemTotal.toFixed(2)}</div>
                    <div style="font-size:10px; color:var(--text-muted);">$${item.precioUnitario.toFixed(2)} c/u</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Quitar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');

    summarySubtotal.textContent = `$${total.toFixed(2)}`;
    summaryTotal.textContent = `$${total.toFixed(2)}`;
}

// Procesar pedido y enviar a WhatsApp
async function processOrder() {
    if (cart.length === 0) {
        showToast("Carrito vacío", "Añade productos antes de finalizar.", "error");
        return;
    }

    // Preguntar nombre del cliente de manera interactiva
    const clientName = prompt("Ingresa tu nombre completo para el pedido:") || "Cliente Web";

    let total = 0;
    let orderDetail = "";

    cart.forEach(item => {
        const itemTotal = item.cantidad * item.precioUnitario;
        total += itemTotal;

        const variantText = item.talla || item.color
            ? `(${item.talla ? 'Talla: ' + item.talla : ''} ${item.color ? '| Color: ' + item.color : ''})`
            : '';

        orderDetail += `• *${item.cantidad}x ${item.nombre}* ${variantText} - _$${itemTotal.toFixed(2)}_\n`;
    });

    // Compilar el mensaje de WhatsApp altamente premium
    const message =
        `*NUEVO PEDIDO DESDE DEXTER TIENDA* 🛒
----------------------------------
👤 *Cliente:* ${clientName}
📅 *Fecha:* ${new Date().toLocaleDateString()}

📦 *Resumen de Compra:*
${orderDetail}
----------------------------------
💰 *Total Neto a Pagar:* *$${total.toFixed(2)}*

*Instrucciones de Compra:*
_Por favor, confírmame el stock disponible y los métodos de pago (transferencia, efectivo o depósito). Gracias._`;

    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(waLink, '_blank');

    // Feedback visual y limpiar carrito
    showToast("Procesando...", "Registrando tu pedido...", "info");

    // Construir detalles del pedido para la base de datos
    const detalles_pedido = cart.map(item => ({
        producto_id: item.product_id,
        variante_id: item.variant_id,
        nombre: item.nombre,
        variante: (item.talla || item.color) ? `${item.talla} ${item.color}` : '',
        cantidad: item.cantidad,
        precio: item.precioUnitario,
        imagen_url: item.imagen_url
    }));

    // Insertar en Supabase si está disponible
    if (supabaseClient) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const storeId = urlParams.get('store') || urlParams.get('comercio') || '105';

            let userEmail = null;
            let userId = null;
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session && session.user) {
                    userEmail = session.user.email;
                    userId = session.user.id;
                }
            } catch (e) { }

            const { error } = await supabaseClient.from('pedidos_web').insert([{
                cliente_nombre: clientName,
                email: userEmail,
                cliente_id: userId,
                detalles_pedido: detalles_pedido,
                total: total,
                estado: 'pendiente',
                comercio_id: parseInt(storeId)
            }]);

            if (error) {
                console.error("Error guardando pedido en DB:", error);
            } else {
                console.log("Pedido guardado en Supabase correctamente.");
            }
        } catch (err) {
            console.error("Error en petición a Supabase:", err);
        }
    }

    showToast("¡Pedido Enviado!", "Redireccionando a WhatsApp con el desglose de tu carrito...", "success");

    cart = [];
    updateCartUI();

    // Cerrar carrito
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartDrawer').classList.remove('active');
}

// Crear Toasts dinámicos y bonitos
function showToast(title, message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==================================================
// LÓGICA DE DETALLES DEL PRODUCTO Y GALERÍA (VER DETALLE)
// ==================================================

// Abrir Modal de Detalles con Galería de Imágenes
window.openDetailModal = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const overlay = document.getElementById('detailModalOverlay');
    document.getElementById('detailModalTitle').textContent = `Detalles de ${product.nombre}`;
    document.getElementById('detailProductName').textContent = product.nombre;
    document.getElementById('detailCategory').textContent = product.categoria;
    document.getElementById('detailProductPrice').textContent = `$${product.precioVenta.toFixed(2)}`;
    document.getElementById('detailDescription').textContent = product.descripcion;

    // Cargar Imágenes en la Galería
    const mainImg = document.getElementById('detailMainImage');
    mainImg.src = product.imagen_url || 'https://via.placeholder.com/600';

    const thumbsContainer = document.getElementById('detailThumbnails');
    const imagesArray = [product.imagen_url, product.imagen_url_2, product.imagen_url_3, product.imagen_url_4].filter(url => url);

    if (imagesArray.length <= 1) {
        thumbsContainer.innerHTML = '';
        thumbsContainer.style.display = 'none';
    } else {
        thumbsContainer.style.display = 'flex';
        thumbsContainer.innerHTML = imagesArray.map((url, i) => `
            <button class="thumbnail-btn ${i === 0 ? 'active' : ''}" onclick="changeDetailMainImage(this, '${url}')">
                <img src="${url}" alt="Thumbnail ${i + 1}" class="thumbnail-img">
            </button>
        `).join('');
    }

    // Cargar Variantes en el Modal de Detalles
    const tbody = document.getElementById('detailVariantBody');
    const stockVariants = product.variantes.filter(v => v.stock > 0);

    if (stockVariants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--danger);">Sin stock disponible</td></tr>';
    } else {
        tbody.innerHTML = stockVariants.map(v => `
            <tr>
                <td style="font-weight:700; color:var(--text-primary);">${v.talla || 'N/A'}</td>
                <td>${v.color || 'N/A'}</td>
                <td><span style="font-size:12px; font-weight:600; padding:2px 8px; border-radius:4px; background:var(--success-glow); color:var(--success);">${v.stock} un.</span></td>
                <td>
                    <button class="btn btn-primary btn-small" style="padding: 4px 10px; border-radius: 6px; font-size:11px;" onclick="addToCartFromDetails(${product.id}, ${v.id})">
                        <i class="fa-solid fa-plus"></i> Añadir
                    </button>
                </td>
            </tr>
        `).join('');
    }

    overlay.classList.add('active');
};

// Cambiar Imagen Principal
window.changeDetailMainImage = (btn, url) => {
    document.querySelectorAll('.thumbnail-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('detailMainImage').src = url;
};

// Cerrar Modal de Detalles
window.closeDetailModal = () => {
    document.getElementById('detailModalOverlay').classList.remove('active');
};

// Agregar al carrito desde detalles
window.addToCartFromDetails = (productId, variantId) => {
    const product = allProducts.find(p => p.id === productId);
    const variant = product.variantes.find(v => v.id === variantId);
    if (product && variant) {
        addToCart(product, variant);
        // Opcional: no cerrar detalles para permitir seguir viendo, solo dar feedback
    }
};
