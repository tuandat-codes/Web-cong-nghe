// --- 1. DARK MODE THEME ---
const themeToggleBtn = document.getElementById('theme-toggle');
const rootHtml = document.documentElement;

if(localStorage.getItem('theme') === 'dark') {
    rootHtml.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    if(rootHtml.getAttribute('data-theme') === 'dark') {
        rootHtml.setAttribute('data-theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        rootHtml.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// --- 2. MODAL LOGIC (LOGIN & REGISTER) ---
const loginBtn = document.getElementById('login-btn-toggle');
const loginModal = document.getElementById('login-modal');
const loginOverlay = document.getElementById('login-overlay');
const closeModals = document.querySelectorAll('.close-modal, #close-cart');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTitle = document.getElementById('auth-modal-title');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    authTitle.textContent = "Đăng ký tài khoản";
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    authTitle.textContent = "Đăng nhập";
});

const openModal = (modal, overlay) => {
    modal.classList.add('active');
    overlay.classList.add('active');
};
const closeModal = () => {
    document.querySelectorAll('.modal, .cart-modal').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
};

loginBtn.addEventListener('click', () => openModal(loginModal, loginOverlay));
closeModals.forEach(btn => btn.addEventListener('click', closeModal));
document.querySelectorAll('.overlay').forEach(overlay => overlay.addEventListener('click', closeModal));

// --- 3. CAROUSEL LOGIC ---
const track = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
let slideIndex = 0;

const updateCarousel = () => { track.style.transform = `translateX(-${slideIndex * 100}%)`; }
nextBtn.addEventListener('click', () => { slideIndex = slideIndex === 1 ? 0 : 1; updateCarousel(); });
prevBtn.addEventListener('click', () => { slideIndex = slideIndex === 0 ? 1 : 0; updateCarousel(); });
setInterval(() => { slideIndex = slideIndex === 1 ? 0 : 1; updateCarousel(); }, 5000); 

// --- 4. GIỎ HÀNG KHÁNG LỖI (ANTI-CRASH) ---
let cart =[];
try {
    const cartData = localStorage.getItem('technova_cart');
    if (cartData) {
        const parsed = JSON.parse(cartData);
        if (Array.isArray(parsed)) {
            // Lọc bỏ rác và tự động ép giá tiền về kiểu Số (Number) để tránh lỗi toLocaleString
            cart = parsed.filter(item => item && item.id).map(item => ({
                ...item,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1
            }));
        }
    }
} catch (e) {
    // Nếu localStorage hỏng nặng, reset giỏ hàng
    cart =[];
    localStorage.removeItem('technova_cart');
}

const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

document.querySelector('.cart-btn').addEventListener('click', (e) => {
    e.preventDefault(); openModal(cartModal, cartOverlay); renderCart();
});

function updateCartCount() { 
    const count = cart.reduce((sum, item) => sum + item.quantity, 0); 
    cartCountEl.textContent = count;
    
    if(count > 0) {
        cartCountEl.classList.add('show-badge');
    } else {
        cartCountEl.classList.remove('show-badge');
    }
}

function saveCart() { 
    localStorage.setItem('technova_cart', JSON.stringify(cart)); 
    updateCartCount(); 
    renderCart(); 
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart" style="text-align:center; color: var(--text-muted); padding: 40px 0;"><i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 10px;"></i><p>Giỏ hàng đang trống</p></div>';
        cartTotalPrice.textContent = '0₫'; 
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    try {
        cart.forEach((item, index) => {
            const itemPrice = Number(item.price);
            total += itemPrice * item.quantity;
            
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" alt="img" onerror="this.src='https://placehold.co/80x80/f1f5f9/1e293b?text=Image'">
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">${itemPrice.toLocaleString('vi-VN')}₫</div>
                        <div class="cart-item-actions">
                            <div class="cart-qty-control">
                                <button onclick="changeQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                                <span>${item.quantity}</span>
                                <button onclick="changeQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <button class="btn-remove-item" onclick="removeItem(${index})"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>`;
        });
        cartTotalPrice.textContent = total.toLocaleString('vi-VN') + '₫';
    } catch (error) {
        console.error("Dữ liệu giỏ hàng bị lỗi:", error);
        cartItemsContainer.innerHTML = '<p style="color: red; text-align: center;">Dữ liệu giỏ hàng lỗi. Vui lòng thêm lại sản phẩm.</p>';
        cart =[]; // Reset giỏ hàng nếu lỗi không thể hiển thị
        localStorage.removeItem('technova_cart');
        updateCartCount();
    }
}

window.changeQty = (index, amount) => { cart[index].quantity += amount; if (cart[index].quantity <= 0) cart.splice(index, 1); saveCart(); }
window.removeItem = (index) => { cart.splice(index, 1); saveCart(); }

// --- 5. SO SÁNH SẢN PHẨM ---
let compareList =[];
const compareBtnFloat = document.getElementById('floating-compare-btn');
const compareCountEl = document.getElementById('compare-count');
const compareModal = document.getElementById('compare-modal');
const compareOverlay = document.getElementById('compare-overlay');
const compareTable = document.getElementById('compare-table');

compareBtnFloat.addEventListener('click', () => { openModal(compareModal, compareOverlay); renderCompare(); });

function updateCompareCount() {
    compareCountEl.textContent = compareList.length;
    compareBtnFloat.classList.toggle('show', compareList.length > 0);
}

function renderCompare() {
    if(compareList.length === 0) {
        compareTable.innerHTML = '<tr><td>Chưa có sản phẩm nào để so sánh.</td></tr>';
        return;
    }
    
    let html = `
        <tr>
            <th>Sản phẩm</th>
            ${compareList.map((item, idx) => `
                <td>
                    <button class="remove-compare-btn" onclick="removeCompare(${idx})"><i class="fa-solid fa-xmark"></i></button>
                    <img src="${item.img}" alt="img">
                    <h4>${item.name}</h4>
                </td>
            `).join('')}
        </tr>
        <tr>
            <th>Giá bán</th>
            ${compareList.map(item => `<td class="text-primary"><span class="font-bold">${item.price.toLocaleString('vi-VN')}₫</span></td>`).join('')}
        </tr>
        <tr>
            <th>Mô tả</th>
            ${compareList.map(item => `<td><p class="desc-text">${item.desc}</p></td>`).join('')}
        </tr>
    `;
    compareTable.innerHTML = html;
}

window.removeCompare = (index) => {
    compareList.splice(index, 1);
    updateCompareCount();
    renderCompare();
    if(compareList.length === 0) closeModal();
}

function attachCardEvents() {
    // Add Cart Event
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        const newBtn = btn.cloneNode(true); btn.replaceWith(newBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const id = card.dataset.masp;
            const name = card.querySelector('.product-name').textContent;
            const img = card.querySelector('.product-image img').src;
            const price = parseInt(card.querySelector('.product-price').textContent.replace(/\D/g, '')) || 0;
            
            const existing = cart.find(i => i.id === id);
            existing ? existing.quantity++ : cart.push({ id, name, img, price, quantity: 1 });
            
            saveCart(); 
            showToast('Đã thêm: ' + name);

            cartCountEl.classList.remove('bounce');
            void cartCountEl.offsetWidth; 
            cartCountEl.classList.add('bounce');
        });
    });

    // Compare Event
    document.querySelectorAll('.btn-compare').forEach(btn => {
        const newBtn = btn.cloneNode(true); btn.replaceWith(newBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const id = card.dataset.masp;
            if(compareList.find(i => i.id === id)) { showToast('Sản phẩm đã có trong bảng so sánh!'); return; }
            if(compareList.length >= 3) { showToast('Chỉ được so sánh tối đa 3 sản phẩm!'); return; }

            const name = card.querySelector('.product-name').textContent;
            const img = card.querySelector('.product-image img').src;
            const price = parseInt(card.querySelector('.product-price').textContent.replace(/\D/g, '')) || 0;
            const desc = card.querySelector('.product-desc').textContent;

            compareList.push({ id, name, img, price, desc });
            updateCompareCount();
            showToast('Đã thêm vào so sánh');
        });
    });
}

// --- 6. UTILITIES (Search, Toast, Scroll) ---
document.querySelector('.search-box input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = card.querySelector('.product-name').textContent.toLowerCase().includes(term) ? 'flex' : 'none';
    });
});
document.querySelector('.search-box').addEventListener('submit', e => e.preventDefault());

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div'); toast.className = 'toast';
    toast.innerHTML = `<div class="toast-icon"><i class="fa-solid fa-check"></i></div> <div><strong>${msg}</strong></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

const btt = document.getElementById('back-to-top');
window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 300));
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const mobileBtn = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');
mobileBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
document.querySelectorAll('#nav-menu a').forEach(link => link.addEventListener('click', () => navMenu.classList.remove('active')));

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); } });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

// --- 7. INIT ---
async function loadProducts() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        if (!res.ok) throw new Error();
        const products = await res.json();
        products.forEach(sp => {
            const card = document.querySelector(`.product-card[data-masp="${sp.maSP}"]`);
            if (!card) return;
            card.querySelector('.product-name').textContent = sp.tenSP;
            card.querySelector('.product-desc').textContent = sp.moTa;
            const cleanPrice = String(sp.giaSP).replace(/\D/g, '');
            card.querySelector('.product-price').textContent = Number(cleanPrice).toLocaleString('vi-VN') + '₫';
        });
    } catch (e) {
        console.warn("Đang dùng dữ liệu Demo có sẵn.");
    } finally {
        setTimeout(() => {
            document.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton'));
            attachCardEvents();
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }, 800);
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    updateCartCount(); 
    loadProducts(); 
});
