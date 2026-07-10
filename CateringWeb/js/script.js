// =========================
// 🔹 CART
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

updateCartCount();

function addToCart(name, price) {
    let item = { name, price };
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
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

    cart.forEach((item, index) => {
        total += item.price;
        cartDiv.innerHTML += `
            <div class="cart-item">
                ${item.name} - ₹${item.price}
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
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


// =========================
// 🔹 BOOKING FORM
// =========================
const dateInput = document.getElementById("eventDate");
if (dateInput) {
    const today = new Date();
    const minBookingDate = new Date();
    minBookingDate.setDate(today.getDate() + 3);

    const yyyy = minBookingDate.getFullYear();
    const mm = String(minBookingDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minBookingDate.getDate()).padStart(2, '0');

    dateInput.setAttribute("min", `${yyyy}-${mm}-${dd}`);
}

const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
    bookingForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const guests = document.getElementById("guests").value.trim();
        const eventType = document.getElementById("eventType").value;
        const eventDate = document.getElementById("eventDate").value;

        if (!name || !email || !phone || !guests || !eventDate) {
            alert("Please fill all fields");
            return;
        }

        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (!email.match(emailPattern)) {
            alert("Invalid email address");
            return;
        }

        if (phone.length < 10) {
            alert("Invalid phone number");
            return;
        }

        if (parseInt(guests) <= 0) {
            alert("Number of guests must be greater than 0");
            return;
        }

        if (parseInt(guests) >= 1500) {
            alert("Number of guests must not be greater than 1500");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDateObj = new Date(today);
        minDateObj.setDate(today.getDate() + 3);

        const selectedDate = new Date(eventDate);
        if (selectedDate < minDateObj) {
            alert("Event must be booked at least 3 days in advance.");
            return;
        }

        const booking = { name, email, phone, guests: parseInt(guests), eventType, eventDate };

        try {
            const response = await fetch("http://localhost:8080/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking)
            });

            if (response.ok) {
                alert("Booking successful!");
                bookingForm.reset();
            } else {
                const error = await response.text();
                alert("Error: " + error);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again later.");
        }
    });
}


// =========================
// 🔹 MENU FILTER
// =========================
function filterMenu(category) {
    let items = document.querySelectorAll(".food-card");
    items.forEach(item => {
        const itemCategory = item.dataset.category || "";
        if (category === "all" || itemCategory === category) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}


// =========================
// 🔹 LOAD MENU
// =========================
async function loadMenuCards() {
    let container = document.querySelector(".menu-container");
    if (!container) return;

    try {
        let res = await fetch("http://localhost:8080/menu");
        let data = await res.json();

        container.innerHTML = "";

        data.forEach(item => {
            // ✅ Fixed: normalize category to CSS class
            let categoryClass = item.category.toLowerCase().replace(/\s+/g, '-');
            container.innerHTML += `
            <div class="food-card ${categoryClass}" data-category="${item.category}">
                <img src="http://localhost:8080/${item.image}" onerror="this.src='images/default-food.jpg'">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <p style="font-size:13px;color:#666;">${item.description || ""}</p>
                <button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
            </div>`;
        });

    } catch (err) {
        console.error("Menu load error:", err);
    }
}

loadMenuCards();


// =========================
// 🔹 ADMIN: SECTION SWITCHING
// =========================
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";

    if (sectionId === "bookings") loadBookings();
    if (sectionId === "manageMenu") loadAdminMenu();
    if (sectionId === "orders") loadOrders();
}


// =========================
// 🔹 ADMIN: ADD FOOD
// =========================
let foodForm = document.getElementById("foodForm");
if (foodForm) {
    foodForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("foodName").value.trim();
        const price = document.getElementById("foodPrice").value;
        const category = document.getElementById("foodCategory").value;
        const description = document.getElementById("foodDescription").value;
        const imageFile = document.getElementById("foodImage").files[0];

        const checkedEvents = [...document.querySelectorAll('input[name="events"]:checked')]
            .map(cb => cb.value);

        if (!name) { alert("Food name is required."); return; }
        if (!price || price <= 0) { alert("Valid price is required."); return; }
        if (!category) { alert("Please select a category."); return; }
        if (checkedEvents.length === 0) { alert("Select at least one event menu."); return; }
        if (!imageFile) { alert("Please select an image."); return; }

        let formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("events", checkedEvents.join(","));
        formData.append("description", description);
        formData.append("image", imageFile);

        try {
            let res = await fetch("http://localhost:8080/menu/upload", {
                method: "POST",
                body: formData
            });

            let text = await res.text();
            alert(text);
            foodForm.reset();
            loadAdminMenu();

        } catch (err) {
            console.error(err);
            alert("Error adding food");
        }
    });
}


// =========================
// 🔹 ADMIN: MANAGE MENU
// =========================
async function loadAdminMenu() {
    try {
        let res = await fetch("http://localhost:8080/menu");
        let data = await res.json();

        let table = document.getElementById("menuTable");
        if (!table) return;

        table.innerHTML = "";

        data.forEach(item => {
            table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>${item.category}</td>
                <td><button class="btn-delete" onclick="deleteFood(${item.id})">Delete</button></td>
            </tr>`;
        });

    } catch (err) {
        console.error(err);
    }
}

async function deleteFood(id) {
    try {
        await fetch(`http://localhost:8080/menu/delete/${id}`, { method: "DELETE" });
        alert("Deleted");
        loadAdminMenu();
        loadMenuCards();
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
}


// =========================
// 🔹 ADMIN: BOOKINGS
// =========================
async function loadBookings() {
    try {
        const res = await fetch("http://localhost:8080/booking");
        const data = await res.json();

        let table = document.getElementById("bookingTable");
        if (!table) return;

        table.innerHTML = "";

        data.forEach(b => {
            table.innerHTML += `
                <tr>
                    <td>${b.name}</td>
                    <td>${b.email}</td>
                    <td>${b.phone}</td>
                    <td>${b.eventType}</td>
                    <td>${b.eventDate}</td>
                    <td>${b.guests}</td>
                    <td>${b.specialRequests || "-"}</td>
                    <td><button class="btn-delete" onclick="deleteBooking(${b.id})">Delete</button></td>
                </tr>`;
        });

    } catch (err) {
        console.error("Booking load error:", err);
    }
}

async function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    try {
        await fetch(`http://localhost:8080/booking/${id}`, { method: "DELETE" });
        alert("Booking deleted");
        loadBookings();
    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
}


// =========================
// 🔹 ADMIN: ORDERS
// =========================
async function loadOrders() {
    try {
        const res = await fetch("http://localhost:8080/orders");
        const data = await res.json();

        let table = document.getElementById("orderTable");
        if (!table) return;

        table.innerHTML = "";

        data.forEach(o => {
            table.innerHTML += `
                <tr>
                    <td>${o.customerName}</td>
                    <td>${o.phone}</td>
                    <td>${o.address}</td>
                    <td>${o.items}</td>
                    <td>₹${o.totalAmount}</td>
                    <td>${o.status}</td>
                    <td>
                        <select onchange="updateOrderStatus(${o.id}, this.value)">
                            <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td><button class="btn-delete" onclick="deleteOrder(${o.id})">Delete</button></td>
                </tr>`;
        });

    } catch (err) {
        console.error(err);
    }
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`http://localhost:8080/orders/${id}/status?status=${status}`, {
            method: "PATCH"
        });
        loadOrders();
    } catch (err) {
        console.error(err);
        alert("Failed to update status.");
    }
}

async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    try {
        await fetch(`http://localhost:8080/orders/${id}`, { method: "DELETE" });
        alert("Order deleted.");
        loadOrders();
    } catch (err) {
        console.error(err);
        alert("Delete failed.");
    }
}


// =========================
// 🔹 AUTO LOAD ADMIN DATA
// =========================
loadAdminMenu();
loadBookings();
loadOrders();


// =========================
// 🔹 PLACE ORDER
// =========================
const orderForm = document.getElementById("orderForm");
if (orderForm) {
    orderForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const customerName = document.getElementById("orderName").value.trim();
        const phone = document.getElementById("orderPhone").value.trim();
        const address = document.getElementById("orderAddress").value.trim();

        if (!customerName || !phone || !address) {
            alert("Please fill all delivery details.");
            return;
        }

        if (phone.length < 10) {
            alert("Invalid phone number.");
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const items = cart.map(i => `${i.name} x1`).join(", ");
        const totalAmount = cart.reduce((sum, i) => sum + i.price, 0);

        const order = { customerName, phone, address, items, totalAmount };

        try {
            const response = await fetch("http://localhost:8080/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                alert("Order placed successfully!");
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartCount();
                displayCart();
                orderForm.reset();
            } else {
                const error = await response.text();
                alert("Error: " + error);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again later.");
        }
    });
}


// =========================
// 🔹 AUTH GUARD
// =========================
function requireLogin() {
    const customer = JSON.parse(sessionStorage.getItem("loggedInCustomer"));
    if (!customer) {
        alert("Please login to continue.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function getLoggedInCustomer() {
    return JSON.parse(sessionStorage.getItem("loggedInCustomer"));
}


// =========================
// 🔹 SIGNUP
// =========================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const phone = document.getElementById("signupPhone").value.trim();

        if (!name || !phone) {
            alert("Please fill all fields.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        if (name.length < 2) {
            alert("Please enter a valid name.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/customer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone })
            });

            const text = await res.text();
            if (res.ok) {
                alert(text);
                window.location.href = "login.html";
            } else {
                alert("Error: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again.");
        }
    });
}


// =========================
// 🔹 LOGIN (OTP)
// =========================
const sendOtpBtn = document.getElementById("sendOtpBtn");
if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async function () {
        const phone = document.getElementById("loginPhone").value.trim();

        if (phone.length < 10) {
            alert("Enter a valid phone number.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/customer/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone })
            });

            const text = await res.text();
            if (res.ok) {
                document.getElementById("otpSection").style.display = "block";
                alert("OTP sent! Check your Spring Boot console.");
            } else {
                alert("Error: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again.");
        }
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const phone = document.getElementById("loginPhone").value.trim();
        const otp = document.getElementById("otpInput").value.trim();

        if (!phone || !otp) {
            alert("Please enter phone and OTP.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/customer/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, otp })
            });

            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem("loggedInCustomer", JSON.stringify(data));
                alert("Welcome, " + data.name + "!");
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get("returnUrl");
                window.location.href = returnUrl ? decodeURIComponent(returnUrl) : "index.html";
            } else {
                const text = await res.text();
                alert("Error: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again.");
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
            <span style="color:#ff7e5f; font-size:14px;">👤 ${customer.name}</span>
            <button onclick="logout()" style="padding:6px 14px; font-size:13px; margin-left:8px; background:#ff4d4d; border-radius:6px;">Logout</button>`;
    } else {
        el.innerHTML = `<a href="login.html" style="color:white; font-size:14px;">Login</a>`;
    }
}

function logout() {
    sessionStorage.removeItem("loggedInCustomer");
    alert("Logged out successfully.");
    window.location.href = "index.html";
}

updateNavAuth();


// =========================
// 🔹 LOGIN PERSISTENCE & GUARDS
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

// Run guard on protected pages
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
        const newUsername = document.getElementById("newUsername").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();

        if (!currentPassword || !newUsername || !newPassword) {
            alert("All fields are required.");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/admin/change-credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newUsername, newPassword })
            });

            const text = await res.text();
            if (res.ok) {
                alert("Credentials updated! Please login again.");
                sessionStorage.removeItem("adminLoggedIn");
                window.location.href = "admin-login.html";
            } else {
                alert("Error: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Please try again.");
        }
    });
}