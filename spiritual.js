(() => {
  'use strict';

  const D = window.HALA_SPIRITUAL;
  if (!D) return;

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  let midnightTimer = null;
  const language = () => document.documentElement.lang || 'ar';

  /* ==================== 1. المكتبة الروحية (الأدعية والزيارات) ==================== */
  let currentDuaFontSize = 18;

  function renderLibrary() {
    const searchEl = $('spiritualSearch');
    const kindEl = $('spiritualKind');
    const listEl = $('spiritualList');
    if (!listEl) return;

    const q = (searchEl?.value || '').trim().toLocaleLowerCase();
    const kind = kindEl?.value || 'all';

    const rows = D.references.filter(x =>
      (kind === 'all' || x.kind === kind) &&
      (!q || `${x.title} ${x.author} ${x.kind} ${x.keywords} ${x.summary}`.toLocaleLowerCase().includes(q))
    );

    listEl.innerHTML = rows.length ? rows.map(x => `
      <article class="spiritual-card">
        <div class="spiritual-card-head">
          <div class="spiritual-title-group">
            <h3>${esc(x.title)}</h3>
            <p class="spiritual-author">${esc(x.author)}</p>
          </div>
          <span class="spiritual-kind">${esc(x.kind)}</span>
        </div>
        ${x.excerpt ? `<blockquote class="spiritual-excerpt" lang="ar" dir="rtl">${esc(x.excerpt)}</blockquote>` : ''}
        <p class="spiritual-summary">${esc(x.summary)}</p>
        <div class="spiritual-card-actions">
          <button type="button" class="btn btn-gold btn-sm read-dua-btn" data-read-dua="${esc(x.id)}">
            <span aria-hidden="true">📖</span> قراءة النص كاملاً
          </button>
          <a class="spiritual-source" href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">${esc(x.sourceName)} ↗</a>
        </div>
      </article>
    `).join('') : `
      <div class="empty-panel">
        <p>لا توجد نصوص تطابق البحث. جرّب كلمة أخرى أو غيّر التصنيف.</p>
      </div>
    `;
  }

  $('spiritualSearch')?.addEventListener('input', renderLibrary);
  $('spiritualKind')?.addEventListener('change', renderLibrary);

  // Dua Reader Modal Logic
  function openDuaReader(id) {
    const item = D.references.find(x => x.id === id);
    if (!item) return;

    const modal = $('duaReaderModal');
    if (!modal) return;

    if ($('duaReaderTitle')) $('duaReaderTitle').textContent = item.title;
    if ($('duaReaderAuthor')) $('duaReaderAuthor').textContent = item.author;
    if ($('duaReaderCategory')) $('duaReaderCategory').textContent = item.kind || 'دعاء مأثور';

    const virtueEl = $('duaReaderVirtue');
    if (virtueEl) {
      if (item.virtue) {
        virtueEl.hidden = false;
        virtueEl.innerHTML = `
          <div class="virtue-badge">
            <span class="virtue-icon">✨</span>
            <div>
              <b>فضل وبركة هذا الذكر المبارك</b>
              <p>${esc(item.virtue)}</p>
            </div>
          </div>
        `;
      } else {
        virtueEl.hidden = true;
        virtueEl.innerHTML = '';
      }
    }

    const textEl = $('duaReaderText');
    if (textEl) {
      const textToDisplay = item.fullText || item.excerpt || '';
      const paragraphs = textToDisplay.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      textEl.innerHTML = paragraphs.map(p => `<p class="dua-paragraph">${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
      textEl.style.fontSize = `${currentDuaFontSize}px`;
    }

    const sourceEl = $('duaReaderSource');
    if (sourceEl) {
      sourceEl.href = item.source || '#';
      sourceEl.textContent = `${item.sourceName || 'المصدر المعتمد'} ↗`;
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeDuaReader() {
    const modal = $('duaReaderModal');
    if (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  $('spiritualList')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-read-dua]');
    if (btn) {
      e.preventDefault();
      openDuaReader(btn.dataset.readDua);
    }
  });

  $('duaReaderClose')?.addEventListener('click', closeDuaReader);
  $('duaReaderDone')?.addEventListener('click', closeDuaReader);
  $('duaReaderModal')?.addEventListener('click', e => {
    if (e.target === $('duaReaderModal')) closeDuaReader();
  });

  $('duaFontInc')?.addEventListener('click', () => {
    if (currentDuaFontSize < 28) {
      currentDuaFontSize += 2;
      const textEl = $('duaReaderText');
      if (textEl) textEl.style.fontSize = `${currentDuaFontSize}px`;
      if ($('duaFontVal')) $('duaFontVal').textContent = `${currentDuaFontSize}px`;
    }
  });

  $('duaFontDec')?.addEventListener('click', () => {
    if (currentDuaFontSize > 14) {
      currentDuaFontSize -= 2;
      const textEl = $('duaReaderText');
      if (textEl) textEl.style.fontSize = `${currentDuaFontSize}px`;
      if ($('duaFontVal')) $('duaFontVal').textContent = `${currentDuaFontSize}px`;
    }
  });

  $('duaCopyBtn')?.addEventListener('click', async () => {
    const textEl = $('duaReaderText');
    if (!textEl) return;
    const title = $('duaReaderTitle')?.textContent || '';
    const text = `${title}\n\n${textEl.innerText}`;
    try {
      await navigator.clipboard.writeText(text);
      const btn = $('duaCopyBtn');
      const old = btn.textContent;
      btn.textContent = '✓ تم النسخ بنجاح';
      setTimeout(() => { btn.textContent = old; }, 2000);
      const tEl = $('toast');
      if (tEl) {
        tEl.textContent = 'تم نسخ نص الدعاء المبارك إلى الحافظة';
        tEl.classList.add('visible');
        setTimeout(() => tEl.classList.remove('visible'), 2600);
      }
    } catch {
      alert('تعذر نسخ النص تلقائياً. يمكنك تحديده ونسخه يدوياً.');
    }
  });

  /* ==================== 2. التقويم الهجري والمناسبات ==================== */
  const monthNames = {
    ar: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'],
    en: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'],
    fa: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه']
  };

  function lunarParts(date = new Date()) {
    try {
      const loc = language() === 'en' ? 'en-US-u-ca-islamic-umalqura-nu-latn' :
                  language() === 'fa' ? 'fa-IR-u-ca-islamic-umalqura-nu-latn' :
                  'ar-IQ-u-ca-islamic-umalqura-nu-latn';
      const parts = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date);
      const get = t => Number(parts.find(x => x.type === t)?.value);
      const day = get('day'), month = get('month');
      if (day && month) return { day, month, year: get('year') };
    } catch {}
    return null;
  }

  function renderAnniversaries() {
    const now = lunarParts();
    const today = $('anniversaryToday');
    const listEl = $('anniversaryList');
    const dailyCardEvent = document.querySelector('.remembrance-card b');
    const dailyCardSub = document.querySelector('.remembrance-card span');

    if (!now) {
      if (today) today.textContent = 'تقويم أم القرى غير متاح في هذا المتصفح.';
      return [];
    }

    const matches = D.anniversaries.filter(e => e.day === now.day && e.month === now.month);
    const fmt = new Intl.DateTimeFormat(language() === 'en' ? 'en-US' : language() === 'fa' ? 'fa-IR' : 'ar-IQ', {
      calendar: 'islamic-umalqura',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    if (today) {
      today.innerHTML = matches.length
        ? `اليوم ${esc(fmt)} · ${matches.map(e => `<a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">${esc(e.name)}</a>`).join('، ')}`
        : `اليوم ${esc(fmt)} · لا توجد مناسبة في قائمة هذا المرجع.`;
    }

    // Sync with daily card in Home view
    if (dailyCardEvent && matches.length) {
      dailyCardEvent.innerHTML = matches.map(e => `<a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">${esc(e.name)}</a>`).join('، ');
      if (dailyCardSub) dailyCardSub.textContent = 'مناسبة موثقة من التقويم المعتمد';
    }

    if (listEl) {
      const list = [...D.anniversaries].sort((a, b) => a.month - b.month || a.day - b.day);
      listEl.innerHTML = list.map(e => `
        <article class="anniversary-item ${e.day === now.day && e.month === now.month ? 'today' : ''}">
          <b>${esc(e.name)}</b>
          <span>${e.day} ${esc(monthNames[language()]?.[e.month - 1] || monthNames.ar[e.month - 1])} · ${esc(e.year)}${e.note ? `<br>${esc(e.note)}` : ''}</span>
          <a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">عرض المرجع ↗</a>
        </article>
      `).join('');
    }

    return matches;
  }

  function notifyIfToday() {
    if (!window.Notification || Notification.permission !== 'granted' || storageOff()) return;
    const hits = renderAnniversaries() || [];
    const key = `hala-anniversary-${new Date().toISOString().slice(0, 10)}`;
    try {
      if (hits.length && !sessionStorage.getItem(key)) {
        new Notification('مناسبة اليوم', { body: hits.map(x => x.name).join('، ') });
        sessionStorage.setItem(key, '1');
      }
    } catch {}
  }

  function storageOff() {
    try {
      return localStorage.getItem('hala-anniversary-alerts') !== 'enabled';
    } catch {
      return true;
    }
  }

  function armMidnight() {
    clearTimeout(midnightTimer);
    const n = new Date();
    const tomorrow = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5);
    midnightTimer = setTimeout(() => {
      notifyIfToday();
      armMidnight();
    }, tomorrow - n);
  }

  $('anniversaryNotifyBtn')?.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      alert('إشعارات المتصفح غير مدعومة.');
      return;
    }
    try {
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('لم يتم منح إذن الإشعارات.');
        return;
      }
      localStorage.setItem('hala-anniversary-alerts', 'enabled');
      const btn = $('anniversaryNotifyBtn');
      if (btn) {
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = 'التنبيه مفعّل · أثناء فتح الموقع';
      }
      notifyIfToday();
      armMidnight();
    } catch {
      alert('تعذر تفعيل التنبيه في هذا المتصفح.');
    }
  });

  /* ==================== 3. معرض مشاهد العتبات المقدسة ==================== */
  function renderGallery() {
    const g = $('sacredGallery');
    if (!g) return;
    g.dir = 'ltr';
    const records = D.gallery || [];
    g.innerHTML = records.map(x => {
      const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(x.file)}?width=1000`;
      return `
        <article class="gallery-card" lang="ar" dir="rtl">
          <img src="${src}" alt="${esc(x.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          <span class="gallery-credit">
            <a href="${esc(x.page)}" target="_blank" rel="noopener noreferrer">${esc(x.author)}</a> · 
            <a href="${esc(x.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(x.license)}</a>
          </span>
          <div class="gallery-caption">
            <b>${esc(x.title)}</b>
            <q lang="ar">${esc(x.quote)}</q>
          </div>
        </article>
      `;
    }).join('');

    g.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        img.alt += ' · تعذر تحميل الصورة';
        img.closest('.gallery-card')?.classList.add('image-unavailable');
      }, { once: true });
    });
  }

  $('galleryPrev')?.addEventListener('click', () => {
    const g = $('sacredGallery');
    if (g) g.scrollBy({ left: -g.clientWidth * 0.78, behavior: 'smooth' });
  });

  $('galleryNext')?.addEventListener('click', () => {
    const g = $('sacredGallery');
    if (g) g.scrollBy({ left: g.clientWidth * 0.78, behavior: 'smooth' });
  });

  /* ==================== 4. شريط صور العتبات المتغيرة في الهيرو (Changing Photos) ==================== */
  let heroSlideTimer = null;
  let currentHeroIndex = 0;

  function initHeroSlider() {
    const slider = $('heroShrineSlider');
    const track = $('heroSliderTrack');
    const dots = $('heroSliderDots');
    const counter = $('heroSliderCounter');
    const city = $('heroSliderCity');
    if (!slider || !track) return;

    const photos = D.shrinePhotos || [];
    if (!photos.length) return;

    // Build slides with Wikimedia Commons images
    track.innerHTML = photos.map((p, i) => {
      const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.file)}?width=1200`;
      return `
        <figure class="hero-slider-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
          <img src="${src}" alt="${esc(p.title)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${i === 0 ? 'high' : 'auto'}">
          <div class="shrine-photo-shade"></div>
          <figcaption>
            <span>${esc(p.title)}</span>
            <strong>${esc(p.quoteSource || p.title)}</strong>
            <small>${esc(p.city)}</small>
            <q class="hero-slide-quote">«${esc(p.quote)}»</q>
          </figcaption>
          <a class="shrine-photo-credit" href="${esc(p.page)}" target="_blank" rel="noopener noreferrer">${esc(p.author)} | ${esc(p.license)}</a>
        </figure>
      `;
    }).join('');

    // Build dots
    if (dots) {
      dots.innerHTML = photos.map((p, i) => `
        <button type="button" class="hero-dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="عرض ${esc(p.title)}" title="${esc(p.title)}"></button>
      `).join('');
    }

    function showSlide(idx) {
      const slides = track.querySelectorAll('.hero-slider-slide');
      const dotBtns = dots ? dots.querySelectorAll('.hero-dot') : [];
      if (!slides.length) return;

      currentHeroIndex = (idx + slides.length) % slides.length;

      slides.forEach((s, i) => s.classList.toggle('active', i === currentHeroIndex));
      dotBtns.forEach((d, i) => d.classList.toggle('active', i === currentHeroIndex));

      if (counter) counter.textContent = `${currentHeroIndex + 1} / ${slides.length}`;
      if (city) city.textContent = photos[currentHeroIndex]?.city || '';
    }

    function nextSlide() {
      showSlide(currentHeroIndex + 1);
    }

    function prevSlide() {
      showSlide(currentHeroIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      heroSlideTimer = setInterval(nextSlide, 4500);
    }

    function stopAutoPlay() {
      if (heroSlideTimer) {
        clearInterval(heroSlideTimer);
        heroSlideTimer = null;
      }
    }

    $('heroSliderNext')?.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });

    $('heroSliderPrev')?.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });

    dots?.addEventListener('click', e => {
      const dot = e.target.closest('[data-slide]');
      if (dot) {
        showSlide(+dot.dataset.slide);
        startAutoPlay();
      }
    });

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    slider.addEventListener('touchstart', stopAutoPlay, { passive: true });
    slider.addEventListener('touchend', startAutoPlay, { passive: true });

    showSlide(0);
    startAutoPlay();
  }

  // Initialization
  renderLibrary();
  renderAnniversaries();
  renderGallery();
  initHeroSlider();
  if (!storageOff()) armMidnight();

  // Expose function for dynamic locale change
  window.renderAnniversaries = renderAnniversaries;
  window.openDuaReader = openDuaReader;
})();
