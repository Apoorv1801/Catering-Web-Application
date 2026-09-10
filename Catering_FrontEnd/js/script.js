// =========================
// 🔹 CART
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

updateCartCount();

function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showToast(`${name} added to cart!`);
}

function updateCartCount() {
    let el = document.getElementById("cart-count");
    if (el) el.innerText = cart.length;
}

function displayCart() {
    let cartDiv = document.getElementById("cart-items");
    if (!cartDiv) return;
    cartDiv.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
        cartDiv.innerHTML = "<p style='color:#888;text-align:center;padding:20px;'>Your cart is empty.</p>";
    }
    cart.forEach((item, index) => {
        total += item.price;
        cartDiv.innerHTML += `
            <div class="cart-item">
                <span>${item.name} — ₹${item.price}</span>
                <button onclick="removeItem(${index})">Remove</button>
            </div>`;
    });
    let totalEl = document.getElementById("total-price");
    if (totalEl) totalEl.innerText = total;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

displayCart();

// Toast notification
function showToast(msg, type = "success") {
    let t = document.getElementById("rc-toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "rc-toast";
        t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${type==="error"?"#c0392b":"#27ae60"};color:white;
            padding:12px 20px;border-radius:10px;font-size:14px;font-family:Poppins,sans-serif;
            z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.4s;`;
        document.body.appendChild(t);
    }
    t.style.background = type === "error" ? "#c0392b" : "#27ae60";
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = "0"; }, 3000);
}

// =========================
// 🔹 VALIDATION HELPERS
// =========================
function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = "#e74c3c";
    let err = field.parentElement.querySelector(".field-error");
    if (!err) {
        err = document.createElement("span");
        err.className = "field-error";
        err.style.cssText = "color:#e74c3c;font-size:12px;margin-top:3px;display:block;";
        field.parentElement.appendChild(err);
    }
    err.textContent = msg;
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = "";
    const err = field.parentElement.querySelector(".field-error");
    if (err) err.remove();
}

function clearAllErrors(ids) {
    ids.forEach(id => clearError(id));
}

function validateName(val, fieldId) {
    if (!val) { showError(fieldId, "Name is required."); return false; }
    if (val.length < 2) { showError(fieldId, "Name must be at least 2 characters."); return false; }
    if (val.length > 60) { showError(fieldId, "Name must not exceed 60 characters."); return false; }
    if (!/^[a-zA-Z\s]+$/.test(val)) { showError(fieldId, "Name must contain only letters."); return false; }
    clearError(fieldId); return true;
}

function validatePhone(val, fieldId) {
    if (!val) { showError(fieldId, "Phone number is required."); return false; }
    if (!/^[6-9][0-9]{9}$/.test(val)) { showError(fieldId, "Enter a valid 10-digit Indian mobile number (starts with 6-9)."); return false; }
    clearError(fieldId); return true;
}

function validateEmail(val, fieldId) {
    if (!val) { showError(fieldId, "Email is required."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val)) { showError(fieldId, "Enter a valid email address."); return false; }
    clearError(fieldId); return true;
}

function validateAddress(val, fieldId) {
    if (!val) { showError(fieldId, "Address is required."); return false; }
    if (val.length < 10) { showError(fieldId, "Please enter a complete address (at least 10 characters)."); return false; }
    if (val.length > 300) { showError(fieldId, "Address must not exceed 300 characters."); return false; }
    clearError(fieldId); return true;
}

// Add live inline validation on blur
function attachLiveValidation() {
    const rules = [
        { id: "name",         fn: () => validateName(document.getElementById("name")?.value.trim(), "name") },
        { id: "email",        fn: () => validateEmail(document.getElementById("email")?.value.trim(), "email") },
        { id: "phone",        fn: () => validatePhone(document.getElementById("phone")?.value.trim(), "phone") },
        { id: "guests",       fn: () => validateGuests(document.getElementById("guests")?.value, "guests") },
        { id: "orderName",    fn: () => validateName(document.getElementById("orderName")?.value.trim(), "orderName") },
        { id: "orderPhone",   fn: () => validatePhone(document.getElementById("orderPhone")?.value.trim(), "orderPhone") },
        { id: "orderAddress", fn: () => validateAddress(document.getElementById("orderAddress")?.value.trim(), "orderAddress") },
    ];
    rules.forEach(r => {
        const el = document.getElementById(r.id);
        if (el) el.addEventListener("blur", r.fn);
    });
}
attachLiveValidation();

function validateGuests(val, fieldId) {
    const n = parseInt(val);
    if (!val || isNaN(n)) { showError(fieldId, "Guest count is required."); return false; }
    if (n < 10) { showError(fieldId, "Minimum 10 guests required for catering."); return false; }
    if (n > 1499) { showError(fieldId, "Maximum 1499 guests allowed per booking."); return false; }
    clearError(fieldId); return true;
}

// =========================
// 🔹 BOOKING FORM
// =========================
const dateInput = document.getElementById("eventDate");
if (dateInput) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);

    const fmt = d => d.toISOString().split("T")[0];
    dateInput.setAttribute("min", fmt(minDate));
    dateInput.setAttribute("max", fmt(maxDate));

    dateInput.addEventListener("blur", () => {
        if (!dateInput.value) { showError("eventDate", "Event date is required."); return; }
        const sel = new Date(dateInput.value);
        if (sel < minDate) { showError("eventDate", "Event must be at least 3 days in advance."); return; }
        if (sel > maxDate) { showError("eventDate", "Event must be within 1 month from today."); return; }
        clearError("eventDate");
    });
}

const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
    bookingForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name      = document.getElementById("name").value.trim();
        const email     = document.getElementById("email").value.trim();
        const phone     = document.getElementById("phone").value.trim();
        const guests    = document.getElementById("guests").value.trim();
        const eventType = document.getElementById("eventType").value;
        const eventDate = document.getElementById("eventDate").value;
        const special   = document.getElementById("specialRequests")?.value.trim() || "";

        let valid = true;
        if (!validateName(name, "name"))        valid = false;
        if (!validateEmail(email, "email"))      valid = false;
        if (!validatePhone(phone, "phone"))      valid = false;
        if (!validateGuests(guests, "guests"))   valid = false;

        if (!eventType) { showToast("Please select an event type.", "error"); valid = false; }

        if (!eventDate) {
            showError("eventDate", "Event date is required.");
            valid = false;
        } else {
            const sel     = new Date(eventDate);
            const minDate = new Date(); minDate.setDate(minDate.getDate() + 3); minDate.setHours(0,0,0,0);
            const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 1); maxDate.setHours(0,0,0,0);
            if (sel < minDate) { showError("eventDate", "Event must be at least 3 days in advance."); valid = false; }
            else if (sel > maxDate) { showError("eventDate", "Event must be within 1 month from today."); valid = false; }
            else clearError("eventDate");
        }

        if (special.length > 500) {
            showToast("Special requests must not exceed 500 characters.", "error");
            valid = false;
        }

        if (!valid) return;

        const btn = bookingForm.querySelector("button[type='submit']");
        btn.disabled = true; btn.textContent = "Submitting...";

        try {
            const response = await fetch(`${API_BASE_URL}/booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, guests: parseInt(guests), eventType, eventDate, specialRequests: special })
            });

            if (response.ok) {
                showToast("Booking successful! We'll contact you soon.");
                bookingForm.reset();
                if (dateInput) {
                    const minDate = new Date(); minDate.setDate(minDate.getDate() + 3);
                    const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 1);
                    const fmt = d => d.toISOString().split("T")[0];
                    dateInput.setAttribute("min", fmt(minDate));
                    dateInput.setAttribute("max", fmt(maxDate));
                }
            } else {
                const error = await response.text();
                showToast("Error: " + error, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Server error. Please try again later.", "error");
        } finally {
            btn.disabled = false; btn.textContent = "Submit Booking";
        }
    });
}


// =========================
// 🔹 MENU FILTER
// =========================
function filterMenu(category) {
    document.querySelectorAll(".food-card").forEach(item => {
        const c = item.dataset.category || "";
        item.style.display = (category === "all" || c === category) ? "block" : "none";
    });

    document.querySelectorAll(".menu-filters button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === category);
    });
}


// =========================
// 🔹 LOAD MENU
// =========================
async function loadMenuCards() {
    let container = document.querySelector(".menu-container");
    if (!container) return;

    container.innerHTML = "<p style='color:#888;text-align:center;padding:40px;'>Loading menu...</p>";

    try {
        let res = await fetch(`${API_BASE_URL}/menu`);
        if (!res.ok) throw new Error("Failed to load menu");
        let data = await res.json();

        container.innerHTML = data.length === 0
            ? "<p style='color:#888;text-align:center;padding:40px;'>No menu items found.</p>"
            : "";

        data.forEach(item => {
            let categoryClass = item.category.toLowerCase().replace(/\s+/g, '-');
            const price = parseFloat(item.price);
            if (isNaN(price) || price <= 0) return; // skip invalid price items
            container.innerHTML += `
            <div class="food-card ${categoryClass}" data-category="${item.category}">
                <img src="${API_BASE_URL}/${item.image}" alt="${item.name}" onerror="this.src='images/biryani.jpg'">
                <h3>${item.name}</h3>
                <p class="food-price">₹${price.toFixed(2)}</p>
                <p style="font-size:13px;color:#666;">${item.description || ""}</p>
                <button onclick="addToCart('${item.name.replace(/'/g,"\\'")}', ${price})">Add to Cart</button>
            </div>`;
        });

        // Apply URL filter if present
        const params = new URLSearchParams(window.location.search);
        const eventFilter = params.get("event");
        if (eventFilter) filterByEvent(eventFilter);

    } catch (err) {
        console.error("Menu load error:", err);
        container.innerHTML = "<p style='color:#e74c3c;text-align:center;padding:40px;'>Failed to load menu. Please refresh.</p>";
    }
}

function filterByEvent(event) {
    document.querySelectorAll(".food-card").forEach(card => {
        const events = card.dataset.events || "";
        card.style.display = (events.includes(event) || event === "all") ? "block" : "none";
    });
}

loadMenuCards();


// =========================
// 🔹 ADMIN: SECTION SWITCHING
// =========================
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    const el = document.getElementById(sectionId);
    if (el) el.style.display = "block";

    document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
    if (event && event.currentTarget) event.currentTarget.classList.add("active");

    if (sectionId === "bookings")   loadBookings();
    if (sectionId === "manageMenu") loadAdminMenu();
    if (sectionId === "orders")     loadOrders();
}


// =========================
// 🔹 ADMIN: ADD FOOD — VALIDATION
// =========================
let foodForm = document.getElementById("foodForm");
if (foodForm) {
    foodForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name        = document.getElementById("foodName").value.trim();
        const priceVal    = document.getElementById("foodPrice").value;
        const category    = document.getElementById("foodCategory").value;
        const description = document.getElementById("foodDescription").value.trim();
        const imageFile   = document.getElementById("foodImage").files[0];
        const checkedEvents = [...document.querySelectorAll('input[name="events"]:checked')].map(cb => cb.value);

        let valid = true;
        if (!name || name.length < 2)             { showToast("Food name must be at least 2 characters.", "error"); valid = false; }
        if (name.length > 80)                     { showToast("Food name must not exceed 80 characters.", "error"); valid = false; }
        const price = parseFloat(priceVal);
        if (!priceVal || isNaN(price) || price <= 0)   { showToast("Enter a valid price greater than 0.", "error"); valid = false; }
        if (price > 100000)                       { showToast("Price seems too high. Max ₹1,00,000.", "error"); valid = false; }
        if (!category)                            { showToast("Please select a category.", "error"); valid = false; }
        if (checkedEvents.length === 0)           { showToast("Select at least one event menu.", "error"); valid = false; }
        if (!imageFile)                           { showToast("Please select an image.", "error"); valid = false; }
        if (imageFile && imageFile.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB.", "error"); valid = false; }
        if (imageFile && !imageFile.type.startsWith("image/")) { showToast("Please upload a valid image file.", "error"); valid = false; }
        if (description.length > 300)             { showToast("Description must not exceed 300 characters.", "error"); valid = false; }

        if (!valid) return;

        const btn = foodForm.querySelector("button[type='submit']");
        btn.disabled = true; btn.textContent = "Uploading...";

        let formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("events", checkedEvents.join(","));
        formData.append("description", description);
        formData.append("image", imageFile);

        try {
            let res = await fetch(`${API_BASE_URL}/menu/upload`, { method: "POST", body: formData });
            if (res.ok) {
                showToast("Food item added successfully!");
                foodForm.reset();
                loadAdminMenu();
            } else {
                showToast(await res.text(), "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error adding food. Check server.", "error");
        } finally {
            btn.disabled = false; btn.textContent = "Add Food Item";
        }
    });
}


// =========================
// 🔹 ADMIN: MANAGE MENU
// =========================
async function loadAdminMenu() {
    try {
        let res = await fetch(`${API_BASE_URL}/menu`);
        let data = await res.json();

        const filterVal = document.getElementById("adminEventFilter")?.value || "All";
        if (filterVal !== "All") {
            data = data.filter(item => item.events && item.events.split(",").map(e => e.trim()).includes(filterVal));
        }

        let table = document.getElementById("menuTable");
        if (!table) return;

        table.innerHTML = data.length === 0
            ? `<tr><td colspan="5" style="text-align:center;color:#666;padding:20px;">No items found.</td></tr>`
            : "";

        data.forEach(item => {
            table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>₹${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.category}</td>
                <td><span style="font-size:11px;color:#888;">${item.events || "-"}</span></td>
                <td><button class="btn-delete" onclick="deleteFood(${item.id})">Delete</button></td>
            </tr>`;
        });
    } catch (err) { console.error(err); }
}

async function deleteFood(id) {
    if (!confirm("Delete this food item? This cannot be undone.")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/menu/delete/${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Food item deleted."); loadAdminMenu(); }
        else showToast("Delete failed.", "error");
    } catch (err) { showToast("Delete failed.", "error"); }
}


// =========================
// 🔹 ADMIN: BOOKINGS
// =========================
async function loadBookings() {
    try {
        const res = await fetch(`${API_BASE_URL}/booking`);
        const data = await res.json();
        let table = document.getElementById("bookingTable");
        if (!table) return;

        table.innerHTML = data.length === 0
            ? `<tr><td colspan="8" style="text-align:center;color:#666;padding:20px;">No bookings yet.</td></tr>`
            : "";

        data.forEach(b => {
            const dateStr = b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "-";
            table.innerHTML += `
                <tr>
                    <td>${b.name}</td>
                    <td>${b.email}</td>
                    <td>${b.phone}</td>
                    <td>${b.eventType}</td>
                    <td>${dateStr}</td>
                    <td>${b.guests}</td>
                    <td>${b.specialRequests || "-"}</td>
                    <td><button class="btn-delete" onclick="deleteBooking(${b.id})">Delete</button></td>
                </tr>`;
        });
    } catch (err) { console.error("Booking load error:", err); }
}

async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/booking/${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Booking deleted."); loadBookings(); }
        else showToast("Delete failed.", "error");
    } catch (err) { showToast("Delete failed.", "error"); }
}


// =========================
// 🔹 ADMIN: ORDERS
// =========================
async function loadOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        const data = await res.json();
        let table = document.getElementById("orderTable");
        if (!table) return;

        table.innerHTML = data.length === 0
            ? `<tr><td colspan="8" style="text-align:center;color:#666;padding:20px;">No orders yet.</td></tr>`
            : "";

        data.forEach(o => {
            const statusColor = { Pending:"#f39c12", Confirmed:"#2980b9", Delivered:"#27ae60", Cancelled:"#e74c3c" }[o.status] || "#888";
            table.innerHTML += `
                <tr>
                    <td>${o.customerName}</td>
                    <td>${o.phone}</td>
                    <td>${o.address}</td>
                    <td style="max-width:160px;word-break:break-word;">${o.items}</td>
                    <td>₹${parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td><span style="color:${statusColor};font-weight:600;">${o.status}</span></td>
                    <td>
                        <select onchange="updateOrderStatus(${o.id}, this.value)" style="font-size:12px;">
                            <option ${o.status==='Pending'   ?'selected':''}>Pending</option>
                            <option ${o.status==='Confirmed' ?'selected':''}>Confirmed</option>
                            <option ${o.status==='Delivered' ?'selected':''}>Delivered</option>
                            <option ${o.status==='Cancelled' ?'selected':''}>Cancelled</option>
                        </select>
                    </td>
                    <td><button class="btn-delete" onclick="deleteOrder(${o.id})">Delete</button></td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

async function updateOrderStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}/status?status=${status}`, { method: "PATCH" });
        if (res.ok) { showToast(`Status updated to ${status}.`); loadOrders(); }
        else showToast("Failed to update status.", "error");
    } catch (err) { showToast("Failed to update status.", "error"); }
}

async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Order deleted."); loadOrders(); }
        else showToast("Delete failed.", "error");
    } catch (err) { showToast("Delete failed.", "error"); }
}


// =========================
// 🔹 AUTO LOAD ADMIN DATA
// =========================
loadAdminMenu();
loadBookings();
loadOrders();


// =========================
// 🔹 PLACE ORDER — VALIDATION
// =========================
const orderForm = document.getElementById("orderForm");
if (orderForm) {
    orderForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const customerName = document.getElementById("orderName").value.trim();
        const phone        = document.getElementById("orderPhone").value.trim();
        const address      = document.getElementById("orderAddress").value.trim();

        let valid = true;
        if (!validateName(customerName, "orderName"))   valid = false;
        if (!validatePhone(phone, "orderPhone"))         valid = false;
        if (!validateAddress(address, "orderAddress"))   valid = false;

        if (cart.length === 0) {
            showToast("Your cart is empty. Add items from the menu.", "error");
            return;
        }

        if (!valid) return;

        const btn = document.getElementById("placeOrderBtn");
        btn.disabled = true; btn.textContent = "Placing order...";

        const items       = cart.map(i => `${i.name} x1`).join(", ");
        const totalAmount = cart.reduce((sum, i) => sum + i.price, 0);

        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerName, phone, address, items, totalAmount })
            });

            if (response.ok) {
                showToast("Order placed successfully! We'll deliver soon.");
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
                displayCart();
                orderForm.reset();
            } else {
                showToast("Error: " + await response.text(), "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Server error. Please try again later.", "error");
        } finally {
            btn.disabled = false; btn.textContent = "Place Order";
        }
    });
}


// =========================
// 🔹 NAV AUTH DISPLAY
// =========================
function updateNavAuth() {
    const el = document.getElementById("nav-user");
    if (!el) return;
    const customer = JSON.parse(sessionStorage.getItem("loggedInCustomer"));
    if (customer) {
        el.innerHTML = `
            <span style="color:#ff7e5f;font-size:14px;">👤 ${customer.name}</span>
            <button onclick="logout()" style="padding:6px 14px;font-size:13px;margin-left:8px;background:#ff4d4d;border-radius:6px;border:none;color:white;cursor:pointer;">Logout</button>`;
    } else {
        el.innerHTML = `<a href="login.html" style="color:white;font-size:14px;">Login</a>`;
    }
}

function logout() {
    sessionStorage.removeItem("loggedInCustomer");
    showToast("Logged out successfully.");
    setTimeout(() => window.location.href = "index.html", 1000);
}

updateNavAuth();


// =========================
// 🔹 AUTH GUARD
// =========================
function requireLogin(redirectBack) {
    const customer = JSON.parse(sessionStorage.getItem("loggedInCustomer"));
    if (!customer) {
        alert("Please login to continue.");
        const returnUrl = redirectBack ? encodeURIComponent(window.location.href) : '';
        window.location.href = "login.html" + (returnUrl ? "?returnUrl=" + returnUrl : "");
        return false;
    }
    return true;
}

function getLoggedInCustomer() {
    return JSON.parse(sessionStorage.getItem("loggedInCustomer"));
}

const protectedPages = ["booking.html", "cart.html"];
const currentPage = window.location.pathname.split("/").pop();
if (protectedPages.includes(currentPage)) {
    requireLogin(true);
}


// =========================
// 🔹 ADMIN: CHANGE CREDENTIALS
// =========================
const changeCredForm = document.getElementById("changeCredForm");
if (changeCredForm) {
    changeCredForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const currentPassword = document.getElementById("currentPassword").value.trim();
        const newUsername     = document.getElementById("newUsername").value.trim();
        const newPassword     = document.getElementById("newPassword").value.trim();
        const msg             = document.getElementById("credMsg");

        msg.style.color = "red"; msg.textContent = "";

        if (!currentPassword)        { msg.textContent = "Current password is required."; return; }
        if (!newUsername || newUsername.length < 3) { msg.textContent = "New username must be at least 3 characters."; return; }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername))  { msg.textContent = "Username can only contain letters, numbers, and underscores."; return; }
        if (!newPassword || newPassword.length < 6) { msg.textContent = "New password must be at least 6 characters."; return; }
        if (newPassword === currentPassword)         { msg.textContent = "New password must be different from current."; return; }

        try {
            const res = await fetch(`${API_BASE_URL}/admin/change-credentials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newUsername, newPassword })
            });
            const text = await res.text();
            if (res.ok) {
                msg.style.color = "#4caf50";
                msg.textContent = "Credentials updated successfully!";
                setTimeout(() => {
                    sessionStorage.removeItem("adminLoggedIn");
                    window.location.href = "adminlogin.html";
                }, 1500);
            } else {
                msg.textContent = text;
            }
        } catch (err) {
            msg.textContent = "Server error. Please try again.";
        }
    });
}
