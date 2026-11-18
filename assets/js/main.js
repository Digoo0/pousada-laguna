/* Pousada Laguna — interações */
(() => {
  const WHATSAPP = "552220420039";
  // Motor de reservas atual (Omnibees, hotel 6319).
  // ATENÇÃO: confirmar com a Omnibees o formato dos parâmetros de data/hóspedes.
  const BOOKING_URL = "https://reservations.omnibees.com/default.aspx?q=6319&lang=pt-BR";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  // Links de WhatsApp com mensagem pré-preenchida
  $$(".js-wa").forEach((a) => { a.href = waLink(a.dataset.msg || "Olá!"); });

  // Ano no rodapé
  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // ---------- Formulário de reserva ----------
  const form = $("#reservar");
  const inEl = $("#checkin");
  const outEl = $("#checkout");
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = new Date(); today.setHours(12, 0, 0, 0);

  inEl.min = iso(today);
  outEl.min = iso(addDays(today, 1));

  inEl.addEventListener("change", () => {
    if (!inEl.value) return;
    const next = addDays(new Date(inEl.value + "T12:00:00"), 1);
    outEl.min = iso(next);
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = iso(next);
  });

  const ddmmyyyy = (v) => { const [y, m, d] = v.split("-"); return `${d}${m}${y}`; };
  const br = (v) => { const [y, m, d] = v.split("-"); return `${d}/${m}/${y}`; };

  let chosenRoom = "";
  $$("[data-room]").forEach((a) =>
    a.addEventListener("click", () => {
      chosenRoom = a.dataset.room;
      form.classList.remove("is-flash");
      void form.offsetWidth;
      form.classList.add("is-flash");
      setTimeout(() => inEl.focus({ preventScroll: true }), 600);
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const params = new URLSearchParams({
      CheckIn: ddmmyyyy(inEl.value),
      CheckOut: ddmmyyyy(outEl.value),
      ad: $("#adultos").value,
      ch: $("#criancas").value,
    });
    window.open(`${BOOKING_URL}&${params}`, "_blank", "noopener");
  });

  // Cotação por WhatsApp com as datas preenchidas
  $(".js-wa-dates").addEventListener("click", (e) => {
    e.preventDefault();
    const parts = ["Olá! Gostaria de uma cotação na Pousada Laguna"];
    if (chosenRoom) parts.push(`para a ${chosenRoom}`);
    let msg = parts.join(" ");
    if (inEl.value && outEl.value) msg += `, de ${br(inEl.value)} a ${br(outEl.value)}`;
    msg += `, para ${$("#adultos").value} adulto(s) e ${$("#criancas").value} criança(s).`;
    window.open(waLink(msg), "_blank", "noopener");
  });

  // ---------- Header com sombra ao rolar + barra mobile ----------
  const header = $(".header");
  const mobileBar = $(".mobile-bar");
  const hero = $(".hero");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const atForm = form.getBoundingClientRect().top < window.innerHeight && form.getBoundingClientRect().bottom > 0;
    mobileBar.classList.toggle("is-visible", pastHero && !atForm);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Revelar seções ao rolar ----------
  const targets = $$(".section__head, .room, .bento__item, .feature__media, .feature__text, .place, .faq details, .location > *");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  }
})();
