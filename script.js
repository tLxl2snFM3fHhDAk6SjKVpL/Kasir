// 1. DATA MENU (Ambil dari LocalStorage atau pakai default)
let menu = JSON.parse(localStorage.getItem('posMenuItems')) || [
    { id: Date.now(), name: "Nasi Goreng", price: 15000 },
    { id: Date.now() + 1, name: "Es Teh Manis", price: 5000 }
];

let cart = [];
let transactionHistory = JSON.parse(localStorage.getItem('posHistory')) || [];

// 2. FUNGSI TAMBAH MENU BARU
function addNewMenuItem() {
    const name = document.getElementById('new-menu-name').value;
    const price = parseInt(document.getElementById('new-menu-price').value);

    if (!name || !price) {
        alert("Mohon isi nama dan harga menu!");
        return;
    }

    const newItem = {
        id: Date.now(), // Generate ID unik pakai timestamp
        name: name,
        price: price
    };

    menu.push(newItem);
    localStorage.setItem('posMenuItems', JSON.stringify(menu)); // Simpan ke storage
    
    // Reset Form & Tutup Modal
    document.getElementById('new-menu-name').value = '';
    document.getElementById('new-menu-price').value = '';
    bootstrap.Modal.getInstance(document.getElementById('addMenuModal')).hide();

    renderMenu();
}

// 3. RENDER DAFTAR MENU
function renderMenu() {
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = '';
    menu.forEach(item => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4';
        div.innerHTML = `
            <div class="menu-item-card h-100 d-flex flex-column justify-content-between">
                <div>
                    <h6 class="fw-bold mb-1">${item.name}</h6>
                    <p class="text-primary fw-bold small">Rp ${item.price.toLocaleString()}</p>
                </div>
                <div class="d-flex gap-1">
                    <input type="number" min="1" value="1" class="form-control form-control-sm w-50" id="qty-${item.id}">
                    <button class="btn btn-primary btn-sm w-50" onclick="addToCart(${item.id})"><i class="fas fa-plus"></i></button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteMenuItem(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        menuList.appendChild(div);
    });
}

// 4. HAPUS MENU DARI DAFTAR (BUKAN DARI KERANJANG)
function deleteMenuItem(id) {
    if(confirm("Hapus menu ini secara permanen?")) {
        menu = menu.filter(m => m.id !== id);
        localStorage.setItem('posMenuItems', JSON.stringify(menu));
        renderMenu();
    }
}

// 5. LOGIKA KERANJANG
function addToCart(id) {
    const product = menu.find(m => m.id === id);
    const qty = parseInt(document.getElementById(`qty-${id}`).value);
    const existing = cart.find(c => c.id === id);

    if (existing) { existing.qty += qty; } 
    else { cart.push({ ...product, qty }); }
    updateCart();
}

function updateCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent';
        li.innerHTML = `
            <div><span class="fw-bold small">${item.name}</span><br><small>${item.qty}x ${item.price.toLocaleString()}</small></div>
            <div class="text-end">
                <span class="fw-bold small">Rp ${(item.price * item.qty).toLocaleString()}</span>
                <button class="btn-remove ms-2" onclick="removeFromCart(${index})">&times;</button>
            </div>`;
        list.appendChild(li);
    });

    const disc = (subtotal * (parseFloat(document.getElementById('discount').value) || 0)) / 100;
    const tax = ((subtotal - disc) * (parseFloat(document.getElementById('tax').value) || 10)) / 100;
    const total = subtotal - disc + tax;

    document.getElementById('subtotal').innerText = subtotal.toLocaleString();
    document.getElementById('discount-amount').innerText = disc.toLocaleString();
    document.getElementById('tax-amount').innerText = tax.toLocaleString();
    document.getElementById('total').innerText = total.toLocaleString();
}

function removeFromCart(i) { cart.splice(i, 1); updateCart(); }
document.getElementById('reset-cart').onclick = () => { cart = []; updateCart(); };

// 6. CHECKOUT & PRINT
document.getElementById('checkout').onclick = () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    const total = document.getElementById('total').innerText;
    const now = new Date().toLocaleString('id-ID');

    transactionHistory.unshift({ date: now, total: total, items: [...cart] });
    localStorage.setItem('posHistory', JSON.stringify(transactionHistory));

    const win = window.open('', '_blank');
    win.document.write(`<html><body style="font-family:monospace;width:250px;text-align:center;">
        <h3>STRUK KASIR</h3><p>${now}</p><hr>
        ${cart.map(i => `<div style="display:flex;justify-content:space-between;"><span>${i.name} x${i.qty}</span><span>${(i.price*i.qty).toLocaleString()}</span></div>`).join('')}
        <hr><h4>TOTAL Rp ${total}</h4><p>Terima Kasih</p>
        <script>window.print();window.close();</script></body></html>`);
    
    cart = []; updateCart(); renderHistory();
};

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = transactionHistory.map(h => `
        <li class="list-group-item mb-2 shadow-sm border-start border-info border-4">
            <small class="fw-bold">${h.date}</small><br>
            <span class="text-success fw-bold">Total: Rp ${h.total}</span>
        </li>`).join('');
}

// Inisialisasi awal
renderMenu();
renderHistory(); 