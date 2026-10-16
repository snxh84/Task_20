// Configuration for EmailJS (replace with your own values to enable real email)
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const RECIPIENT_EMAIL = "your-email@example.com";

const services = [
  { name: "Dry Cleaning", price: 200.00, image: "images/dry-cleaning.jpg" },
  { name: "Leather & Suede Cleaning", price: 999.00, image: "images/leather-suede.jpg" },
  { name: "Ironing", price: 30.00, image: "images/ironing.jpg" },
  { name: "Wedding Dress Cleaning", price: 2400.00, image: "images/wedding-dress.jpg" },
  { name: "Wash and Fold", price: 140.00, image: "images/wash-fold.jpg" },
  { name: "Stain Removal", price: 500.00, image: "images/stain-removal.jpg" }
];

let cart = [];

const formatPrice = (value) => "\u20B9" + value.toFixed(2);

// ---------- Services list (Left Div) ----------
function renderServices() {
  const list = document.getElementById("servicesList");
  if (!list) return;
  list.innerHTML = "";

  services.forEach((service, index) => {
    const li = document.createElement("li");
    li.className = "service-row";
    li.innerHTML = `
      <img src="${service.image}" alt="${service.name}" />
      <div class="service-info">
        <p class="service-name">${service.name}</p>
        <p class="service-price">${formatPrice(service.price)}</p>
      </div>
      <div class="service-row-actions">
        <button type="button" class="remove-now-btn" data-index="${index}">Remove Now</button>
        <button type="button" class="add-items-btn" data-index="${index}">Add Items</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// ---------- Cart (Right Div) ----------
function renderCart() {
  const tbody = document.getElementById("cartItems");
  const empty = document.getElementById("emptyCart");
  const totalEl = document.getElementById("totalAmount");
  if (!tbody || !empty || !totalEl) return;

  tbody.innerHTML = "";

  if (cart.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    cart.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${formatPrice(item.price)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  totalEl.textContent = "\u20B9" + (Number.isInteger(total) ? String(total) : total.toFixed(2));
}

function addToCart(index) {
  const service = services[index];
  cart.push({ name: service.name, price: service.price });
  renderCart();
}

function removeFromCart(index) {
  const service = services[index];
  const cartIndex = cart.map((i) => i.name).lastIndexOf(service.name);
  if (cartIndex !== -1) {
    cart.splice(cartIndex, 1);
    renderCart();
  }
}

// ---------- Booking form ----------
function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  // init EmailJS if configured
  if (window.emailjs && !EMAILJS_PUBLIC_KEY.startsWith("YOUR_")) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (e) {
      console.warn("EmailJS init failed:", e);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const thanksMsg = document.getElementById("thanksMsg");
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name || !email || phone.length !== 10 || cart.length === 0) {
      thanksMsg.textContent = "\u26A0 Add the items to the cart to book";
      thanksMsg.classList.remove("success");
      thanksMsg.classList.add("error");
      thanksMsg.hidden = false;
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const orderDetails = cart
      .map((item, idx) => `${idx + 1}. ${item.name} - \u20B9${item.price.toFixed(2)}`)
      .join("\n");

    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      from_name: name,
      user_email: email,
      phone: phone,
      order_details: orderDetails,
      total: "\u20B9" + (Number.isInteger(total) ? String(total) : total.toFixed(2))
    };

    const showSuccess = () => {
      thanksMsg.textContent = "Thank you For Booking the Service We will get back to you soon!";
      thanksMsg.classList.remove("error");
      thanksMsg.classList.add("success");
      thanksMsg.hidden = false;
      form.reset();
    };

    if (window.emailjs && !EMAILJS_SERVICE_ID.startsWith("YOUR_")) {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(showSuccess)
        .catch((err) => {
          console.error("Email send failed:", err);
          // fall back to success so UX still completes
          showSuccess();
        });
    } else {
      // No EmailJS configured: simulate async send
      setTimeout(showSuccess, 400);
    }
  });
}

// ---------- Newsletter ----------
function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("newsName").value.trim();
    const email = document.getElementById("newsEmail").value.trim();
    const msg = document.getElementById("subscribeMsg");

    if (!name || !email) {
      msg.textContent = "\u26A0 Please fill in all fields.";
      msg.classList.remove("success");
      msg.classList.add("error");
      msg.hidden = false;
      return;
    }

    msg.textContent = "Thank you for subscribing to our newsletter!";
    msg.classList.remove("error");
    msg.classList.add("success");
    msg.hidden = false;
    form.reset();
  });
}

// ---------- Smooth scrolling for navbar / hero button ----------
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const heroBtn = document.getElementById("bookServiceBtn");
  if (heroBtn) {
    heroBtn.addEventListener("click", () => {
      const booking = document.getElementById("booking");
      if (booking) booking.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  renderCart();
  setupBookingForm();
  setupNewsletter();
  setupSmoothScroll();

  const servicesList = document.getElementById("servicesList");
  if (servicesList) {
    servicesList.addEventListener("click", (event) => {
      const target = event.target;
      if (target.classList.contains("add-items-btn")) {
        addToCart(Number(target.dataset.index));
      } else if (target.classList.contains("remove-now-btn")) {
        removeFromCart(Number(target.dataset.index));
      }
    });
  }
});
