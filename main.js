/* =============================================
   MAREA Event Planner — Main JavaScript
   js/main.js
   ============================================= */

/* --------------------------------------------------
   1. NAVBAR SCROLL EFFECT
   -------------------------------------------------- */
(function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        triggerAnimations();
    });
})();

/* --------------------------------------------------
   2. HAMBURGER MENU
   -------------------------------------------------- */
(function initHamburger() {
    var hamburger = document.getElementById('hamburger');
    var navMenu   = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close on nav link click (mobile)
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
})();

/* --------------------------------------------------
   3. SCROLL ANIMATIONS
   -------------------------------------------------- */
function triggerAnimations() {
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
            el.classList.add('visible');
        }
    });
}
// Trigger on load and scroll
window.addEventListener('load', function () { setTimeout(triggerAnimations, 150); });
window.addEventListener('scroll', triggerAnimations);
document.addEventListener('DOMContentLoaded', function () { setTimeout(triggerAnimations, 200); });

/* --------------------------------------------------
   4. GALLERY FILTER
   -------------------------------------------------- */
(function initGalleryFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var cat = this.dataset.cat || 'all';

            // Update items visibility
            document.querySelectorAll('#galleryGrid .g-item').forEach(function (item) {
                item.style.display = (cat === 'all' || item.dataset.cat === cat) ? 'flex' : 'none';
            });

            // Update button styles
            filterBtns.forEach(function (b) {
                b.style.background   = 'var(--color-card-bg)';
                b.style.color        = 'var(--color-text)';
                b.style.borderColor  = 'var(--color-border)';
            });
            btn.style.background  = 'var(--color-text)';
            btn.style.color       = 'var(--color-white)';
            btn.style.borderColor = 'var(--color-text)';
        });
    });
})();

/* --------------------------------------------------
   5. WEATHER WIDGET  (Open-Meteo — no API key needed)
   Tirana: lat=41.3275, lon=19.8187
   -------------------------------------------------- */
(function initWeather() {
    var widget = document.getElementById('weatherWidget');
    if (!widget) return;

    var lat = 41.3275, lon = 19.8187, city = 'Tirana, Albania';

    var url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=' + lat
            + '&longitude=' + lon
            + '&current_weather=true'
            + '&hourly=relativehumidity_2m,windspeed_10m'
            + '&timezone=auto';

    /* WMO weather code → description + emoji */
    var wmoMap = {
        0:'Clear sky ☀️', 1:'Mainly clear 🌤️', 2:'Partly cloudy ⛅', 3:'Overcast ☁️',
        45:'Foggy 🌫️', 48:'Icy fog 🌫️', 51:'Light drizzle 🌦️', 53:'Moderate drizzle 🌦️',
        55:'Dense drizzle 🌧️', 61:'Slight rain 🌧️', 63:'Moderate rain 🌧️', 65:'Heavy rain 🌧️',
        71:'Slight snow ❄️', 73:'Moderate snow ❄️', 75:'Heavy snow ❄️', 77:'Snow grains 🌨️',
        80:'Slight showers 🌦️', 81:'Moderate showers 🌧️', 82:'Violent showers ⛈️',
        95:'Thunderstorm ⛈️', 96:'Thunderstorm with hail ⛈️', 99:'Heavy thunderstorm ⛈️'
    };

    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var cw       = data.current_weather;
            var tempC    = Math.round(cw.temperature);
            var wind     = Math.round(cw.windspeed);
            var code     = cw.weathercode;
            var desc     = wmoMap[code] || 'Weather data';

            // Get current-hour humidity from hourly (approximate)
            var hourIndex = new Date().getHours();
            var humidity  = data.hourly && data.hourly.relativehumidity_2m
                            ? data.hourly.relativehumidity_2m[hourIndex] + '%'
                            : '--';

            widget.innerHTML =
                '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">'
              +   '<div>'
              +     '<p class="weather-city">' + city + '</p>'
              +     '<div class="weather-temp">' + tempC + '°C</div>'
              +     '<p class="weather-desc">' + desc + '</p>'
              +   '</div>'
              +   '<div class="weather-icon">' + (desc.split(' ').pop() || '🌡️') + '</div>'
              + '</div>'
              + '<div class="weather-details">'
              +   '<span>💨 Wind: ' + wind + ' km/h</span>'
              +   '<span>💧 Humidity: ' + humidity + '</span>'
              +   '<span>📍 ' + city + '</span>'
              + '</div>';
        })
        .catch(function () {
            widget.innerHTML =
                '<div style="color:rgba(255,255,255,.6);font-size:.85rem;padding:.5rem 0;">'
              + '⚠️ Weather data unavailable. Please check your connection.'
              + '</div>';
        });
})();

/* --------------------------------------------------
   6. COUNTDOWN TIMER  (user-initiated)
   Target: Dec 31 2026 20:00 Tirana time
   -------------------------------------------------- */
(function initCountdown() {
    var btn     = document.getElementById('startCountdown');
    var display = document.getElementById('countdownDisplay');
    if (!btn || !display) return;

    var targetDate = new Date('2026-12-31T20:00:00+02:00');
    var intervalId  = null;
    var started     = false;

    function pad(n) { return String(n).padStart(2, '0'); }

    function renderCountdown() {
        var now  = new Date();
        var diff = targetDate - now;

        if (diff <= 0) {
            display.innerHTML = '<p style="color:var(--color-gold);font-size:1.2rem;font-weight:700;">🎉 The event has started!</p>';
            clearInterval(intervalId);
            return;
        }

        var days    = Math.floor(diff / 86400000);
        var hours   = Math.floor((diff % 86400000) / 3600000);
        var minutes = Math.floor((diff % 3600000)  / 60000);
        var seconds = Math.floor((diff % 60000)    / 1000);

        display.innerHTML =
            '<div class="countdown-unit"><span class="countdown-num">' + days    + '</span><span class="countdown-label">Days</span></div>'
          + '<span class="countdown-sep">:</span>'
          + '<div class="countdown-unit"><span class="countdown-num">' + pad(hours)   + '</span><span class="countdown-label">Hours</span></div>'
          + '<span class="countdown-sep">:</span>'
          + '<div class="countdown-unit"><span class="countdown-num">' + pad(minutes) + '</span><span class="countdown-label">Minutes</span></div>'
          + '<span class="countdown-sep">:</span>'
          + '<div class="countdown-unit"><span class="countdown-num">' + pad(seconds) + '</span><span class="countdown-label">Seconds</span></div>';
    }

    btn.addEventListener('click', function () {
        if (started) {
            clearInterval(intervalId);
            started = false;
            btn.textContent = '▶ Start Countdown';
            display.innerHTML = '<p style="color:rgba(255,255,255,.5);font-size:.85rem;">Press the button to start the countdown.</p>';
            return;
        }
        started = true;
        btn.textContent = '⏹ Stop Countdown';
        renderCountdown();
        intervalId = setInterval(renderCountdown, 1000);
    });
})();

/* --------------------------------------------------
   7. FAQ ACCORDION
   -------------------------------------------------- */
(function initFAQ() {
    var faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
        var btn = item.querySelector('.faq-question');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var wasOpen = item.classList.contains('open');
            // Close all
            faqItems.forEach(function (fi) { fi.classList.remove('open'); });
            // Toggle current
            if (!wasOpen) { item.classList.add('open'); }
        });
    });
})();

/* --------------------------------------------------
   8. CHART.JS — Pricing / Pricing page bar chart
   (Only runs if <canvas id="eventsChart"> exists)
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('eventsChart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [{
                label: 'Events Planned',
                data: [8, 10, 14, 18, 22, 30, 38, 42, 28, 20, 15, 35],
                backgroundColor: 'rgba(184,151,106,.7)',
                borderColor: 'rgba(184,151,106,1)',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(45,61,79,.85)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (ctx) { return ' ' + ctx.parsed.y + ' events'; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,.06)' },
                    ticks: { font: { family: "'Jost', sans-serif", size: 12 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Jost', sans-serif", size: 12 } }
                }
            }
        }
    });
});