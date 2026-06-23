
// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
function openMobile() {
  mobileNav.classList.add('active');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobile() {
  mobileNav.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
hamburger?.addEventListener('click', () => {
  mobileNav.classList.contains('active') ? closeMobile() : openMobile();
});
document.querySelectorAll('[data-mobile-close]').forEach(el => {
  el.addEventListener('click', closeMobile);
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const header = document.querySelector('.site-header');
      const offset = (header ? header.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
function updateActiveNav() {
  if (!sections.length) return;
  const header = document.querySelector('.site-header');
  const scrollPos = window.scrollY + (header ? header.offsetHeight : 0) + 100;
  let currentId = '';
  sections.forEach(section => {
    if (section.offsetTop <= scrollPos) currentId = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
  });
}
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

const STORAGE_KEY = "dinifirma_state_v4";
const defaultState = {
  companyName:"",
  nameChecked:false,
  legal:"",
  canton:"",
  address:"",
  activity:"",
  activityText:"",
  founders:"1 Person",
  turnover:"Noch unsicher",
  timing:"So schnell wie möglich",
  capital:"",
  paidCapital:"",
  packageName:"Basic",
  packagePrice:150,
  discounts:[],
  extras:[],
  contact:{firstName:"",lastName:"",phone:"",email:"",language:"Deutsch",contactTime:"Flexibel"}
};

function loadState(){
  try{
    return {...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})};
  }catch(e){ return {...defaultState};}
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function money(n){ return "CHF " + Number(n).toLocaleString("de-CH") + ".–"; }
function selectedDiscountTotal(state){ return (state.discounts||[]).reduce((s,x)=>s+Number(x.discount||0),0); }
function appliedDiscount(state){ return Math.min(selectedDiscountTotal(state), Number(state.packagePrice||0)); }
function totalPrice(state){ return Math.max(0, Number(state.packagePrice||0)-appliedDiscount(state)); }
function simulatedNameCheck(name){
  const lower=(name||"").toLowerCase();
  if(!name.trim()) return {cls:"warn", text:"Bitte gib zuerst einen Firmennamen ein."};
  if(lower.includes("swiss") || lower.includes("holding") || lower.includes("test")){
    return {cls:"warn", text:"Ähnliche Firmennamen könnten bereits bestehen. Wir empfehlen eine persönliche Prüfung. Du kannst trotzdem weiterfahren."};
  }
  return {cls:"good", text:"Gute Ausgangslage: Im Prototyp wurde kein identischer Eintrag gefunden. Die definitive Freigabe erfolgt durch das zuständige Handelsregisteramt."};
}
function updateSummary(state){
  const ids = {
    sPackage: state.packageName,
    sPackagePrice: money(state.packagePrice),
    sDiscount: "– " + money(appliedDiscount(state)),
    sExtras: (state.extras||[]).length + " ausgewählt",
    sTotal: money(totalPrice(state)),
    sSaving: appliedDiscount(state)>0
      ? "Du sparst aktuell " + money(appliedDiscount(state)) + " auf dein Gründungspaket."
      : "Du kannst deinen Paketpreis mit passenden Partnerangeboten reduzieren."
  };
  Object.entries(ids).forEach(([id,value])=>{
    const el=document.getElementById(id); if(el) el.textContent=value;
  });
}
function next(url){ window.location.href=url; }
function back(url){ window.location.href=url; }


/* Contact details */
const DINIFIRMA_CONTACT = {
  phoneDisplay:"071 221 00 00",
  phoneHref:"tel:+41712210000",
  email:"info@dinifirma.ch",
  address:"Breitfeldstrasse 8, 9015 St. Gallen"
};

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item.active').forEach(el => {
      el.classList.remove('active');
      const btn = el.querySelector('.faq-item__trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    if (!isActive) {
      item.classList.add('active');
      const btn = item.querySelector('.faq-item__trigger');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== ESC KEY =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    mobileNav?.classList.remove('active');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* Floating chatbot injected on every page */
(function initChatbot(){
  if(document.getElementById("chatLauncher")) return;

  const launcher=document.createElement("button");
  launcher.id="chatLauncher";
  launcher.className="chat-launcher";
  launcher.setAttribute("aria-label","Chat öffnen");
  launcher.innerHTML="💬";

  const panel=document.createElement("section");
  panel.id="chatPanel";
  panel.className="chat-panel";
  panel.innerHTML=`
    <div class="chat-head">
      <div><strong>dinifirma.ch Assistent</strong><span>Wir helfen dir beim nächsten Schritt.</span></div>
      <button class="chat-close" id="chatClose" aria-label="Chat schliessen">×</button>
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-input-wrap">
      <input id="chatInput" placeholder="Antwort eingeben">
      <button class="chat-send" id="chatSend">Senden</button>
    </div>
    <div class="chat-note">Deine Angaben werden vertraulich behandelt und für die persönliche Kontaktaufnahme verwendet.</div>
  `;
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const messages=document.getElementById("chatMessages");
  const input=document.getElementById("chatInput");
  const send=document.getElementById("chatSend");
  const lead=JSON.parse(localStorage.getItem("dinifirma_chat_lead")||"{}");
  let step=0;

  function bubble(text,type="bot"){
    const el=document.createElement("div");
    el.className="chat-bubble "+(type==="user"?"chat-user":"chat-bot");
    el.innerHTML=text;
    messages.appendChild(el);
    messages.scrollTop=messages.scrollHeight;
  }

  function actions(options){
    const wrap=document.createElement("div");
    wrap.className="chat-actions";
    options.forEach(option=>{
      const b=document.createElement("button");
      b.className="chat-option";
      b.textContent=option.label;
      b.addEventListener("click",()=>{
        bubble(option.label,"user");
        wrap.remove();
        option.onClick();
      });
      wrap.appendChild(b);
    });
    messages.appendChild(wrap);
    messages.scrollTop=messages.scrollHeight;
  }

  function persist(){ localStorage.setItem("dinifirma_chat_lead",JSON.stringify(lead)); }

  function ask(){
    if(step===0){
      bubble("Hallo 👋 Ich helfe dir gerne weiter. Was möchtest du erledigen?");
      actions([
        {label:"Eine Firma gründen",onClick:()=>{lead.intent="Firma gründen";persist();step=1;ask();}},
        {label:"Meine Firma ändern",onClick:()=>{lead.intent="Firma ändern";persist();step=1;ask();}},
        {label:"Ich brauche zuerst Beratung",onClick:()=>{lead.intent="Beratung";persist();step=1;ask();}}
      ]);
    }else if(step===1){
      bubble("Wie darf ich dich nennen?");
      input.placeholder="Vorname eingeben"; input.focus();
    }else if(step===2){
      bubble(`Danke ${lead.firstName}. Unter welcher Telefonnummer erreichen wir dich am besten?`);
      input.placeholder="Telefonnummer eingeben"; input.focus();
    }else if(step===3){
      bubble("Wie lautet deine E-Mail-Adresse?");
      input.placeholder="E-Mail-Adresse eingeben"; input.focus();
    }else if(step===4){
      bubble("Wann möchtest du starten?");
      actions([
        {label:"So schnell wie möglich",onClick:()=>{lead.timing="So schnell wie möglich";persist();step=5;ask();}},
        {label:"Innerhalb von 30 Tagen",onClick:()=>{lead.timing="Innerhalb von 30 Tagen";persist();step=5;ask();}},
        {label:"Ich informiere mich zuerst",onClick:()=>{lead.timing="Ich informiere mich zuerst";persist();step=5;ask();}}
      ]);
    }else if(step===5){
      bubble("Perfekt. Möchtest du direkt einen Termin vereinbaren?");
      actions([
        {label:"Ja, Termin auswählen",onClick:()=>window.location.href="termin.html"},
        {label:"Nein, bitte zurückrufen",onClick:()=>{
          lead.callback=true;persist();
          bubble("Vielen Dank. Wir melden uns persönlich bei dir.");
          bubble(`<a class="btn btn-primary" href="funnel-1-vorhaben.html">Gründung starten</a>`);
        }}
      ]);
    }
  }

  function submitInput(){
    const value=input.value.trim(); if(!value) return;
    bubble(value,"user"); input.value="";
    if(step===1){lead.firstName=value;persist();step=2;ask();}
    else if(step===2){lead.phone=value;persist();step=3;ask();}
    else if(step===3){lead.email=value;persist();step=4;ask();}
  }

  launcher.addEventListener("click",()=>{
    panel.classList.toggle("open");
    if(panel.classList.contains("open") && messages.children.length===0) ask();
  });
  document.getElementById("chatClose").addEventListener("click",()=>panel.classList.remove("open"));
  send.addEventListener("click",submitInput);
  input.addEventListener("keydown",e=>{if(e.key==="Enter") submitInput();});
})();


/* ===== Scroll Animations (IntersectionObserver) ===== */
(function initScrollAnimations(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

/* ===== Testimonial Slider ===== */
(function initTestimonialSlider(){
  const track = document.getElementById('testimonialsTrack');
  const navBtns = document.querySelectorAll('.testimonials-nav button');
  if (!track || navBtns.length === 0) return;
  let currentSlide = 0;
  function goToSlide(index) {
    const card = track.querySelector('.testimonial-card');
    if (!card) return;
    const gap = 20;
    const cardWidth = card.offsetWidth;
    const offset = -index * (cardWidth + gap);
    track.style.transform = 'translateX(' + offset + 'px)';
    navBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    currentSlide = index;
  }
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => goToSlide(parseInt(btn.dataset.index)));
  });
  window.addEventListener('resize', () => { goToSlide(currentSlide); });
})();

/* Optional package preselection from main page */
(function preselectPackageFromUrl(){
  try{
    const params=new URLSearchParams(window.location.search);
    const selected=params.get("package");
    if(!selected) return;
    const state=loadState();
    const prices={Basic:150,Pro:450,Premium:750};
    if(prices[selected]){
      state.packageName=selected;
      state.packagePrice=prices[selected];
      saveState(state);
    }
  }catch(e){}
})();
