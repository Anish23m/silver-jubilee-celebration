const celebrationDate = new Date("2026-05-18T19:00:00+05:30");

const invitationCard = document.querySelector(".invitation-card");
const cardInside = document.querySelector(".card-inside");

if (invitationCard && cardInside) {
  invitationCard.addEventListener("click", () => {
    const isOpen = invitationCard.classList.toggle("is-open");
    invitationCard.setAttribute("aria-expanded", String(isOpen));
    cardInside.setAttribute("aria-hidden", String(!isOpen));
  });
}

const countdownNodes = {
  days: document.querySelector('[data-countdown="days"]'),
  hours: document.querySelector('[data-countdown="hours"]'),
  minutes: document.querySelector('[data-countdown="minutes"]'),
  seconds: document.querySelector('[data-countdown="seconds"]'),
};

const pad = (value) => String(value).padStart(2, "0");

function updateCountdown() {
  const now = new Date();
  const remaining = celebrationDate.getTime() - now.getTime();
  const safeRemaining = Math.max(remaining, 0);

  const totalSeconds = Math.floor(safeRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (countdownNodes.days) countdownNodes.days.textContent = pad(days);
  if (countdownNodes.hours) countdownNodes.hours.textContent = pad(hours);
  if (countdownNodes.minutes) countdownNodes.minutes.textContent = pad(minutes);
  if (countdownNodes.seconds) countdownNodes.seconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const rsvpForm = document.querySelector("#rsvp-form");
const formStatus = document.querySelector(".form-status");
const wishRecipientWhatsApp = "916206041134";

function showFormStatus(message, linkUrl) {
  formStatus.textContent = message;

  if (!linkUrl) return;

  formStatus.append(document.createTextNode(" "));

  const link = document.createElement("a");
  link.href = linkUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open WhatsApp";
  formStatus.append(link);
}

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(rsvpForm);
    const name = String(formData.get("name") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !message) {
      showFormStatus("Please add your name and wishes before sending.");
      return;
    }

    const response = {
      name,
      message,
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("silverJubileeRsvp", JSON.stringify(response));
    } catch {
      // Some private browsing modes block localStorage; the visible RSVP flow
      // should still complete gracefully.
    }

    const wishText = [
      `_*Wishes from ${name}*_`,
      "",
      `_${message}_`,
    ].join("\n");
    const whatsappUrl = `https://wa.me/${wishRecipientWhatsApp}?text=${encodeURIComponent(wishText)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
      showFormStatus(
        `Thank you, ${name}. WhatsApp is opening with your wishes ready to send.`
      );
    } else {
      showFormStatus(
        `Thank you, ${name}. WhatsApp did not open automatically.`,
        whatsappUrl
      );
    }

    rsvpForm.reset();
  });
}
