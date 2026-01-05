document.addEventListener('DOMContentLoaded', () => {
  // Staggered reveal for top-level sections
  const sections = Array.from(document.querySelectorAll('#Home_Desktop > div'));
  sections.forEach((el, i) => {
    el.classList.add('reveal');
    // staggered entrance
    setTimeout(() => el.classList.add('visible'), 120 * i + 80);
  });

  // IntersectionObserver fallback for sections loaded later / on scroll
  try {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } catch (e) {
    // IntersectionObserver not supported -> no-op (we already triggered initial reveal)
  }

  // Button ripple + press animation
  function getRippleColorFrom(btn){
    try{
      const bg = getComputedStyle(btn).backgroundColor || '';
      // simple test: use white-ish ripple on dark backgrounds, dark ripple on light backgrounds
      if(!bg) return 'rgba(255,255,255,0.14)';
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if(!m) return 'rgba(255,255,255,0.14)';
      const r = +m[1], g = +m[2], b = +m[3];
      const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
      return luminance < 0.55 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)';
    }catch(e){return 'rgba(255,255,255,0.14)'}
  }

  document.querySelectorAll('button').forEach(btn => {
    // ensure positioning for ripple
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';

    btn.addEventListener('click', (ev) => {
      // press animation
      btn.classList.add('click-press');
      setTimeout(() => btn.classList.remove('click-press'), 120);

      // ripple element
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      const color = getRippleColorFrom(btn);
      ripple.style.background = color;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (ev.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (ev.clientY - rect.top - size/2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });

    // keyboard press effect for accessibility
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === ' ' || ev.key === 'Enter') {
        btn.classList.add('click-press');
        setTimeout(() => btn.classList.remove('click-press'), 120);
      }
    });
  });

  // Fade in images with class img-fade
  document.querySelectorAll('img').forEach(img => {
    img.classList.add('img-fade');
    if (img.complete) img.classList.add('visible');
    else img.addEventListener('load', () => img.classList.add('visible'));
  });

  // Apply entrance + "pop" micro-interaction to all cards with IDs starting with "Card"
  (function(){
    const cards = Array.from(document.querySelectorAll('[id^="Card"], [id^="Product"], #Column_1, #Column_2, #Column_3, #Column_4, #Column_5, #Column_6'));
    if (!cards.length) return;

    // inject lightweight styles for the pop effect (only once)
    if (!document.getElementById('card-pop-styles')) {
      const s = document.createElement('style');
      s.id = 'card-pop-styles';
      s.textContent = `
        [id^="Card"], [id^="Product"], #Column_1, #Column_2, #Column_3, #Column_4, #Column_5, #Column_6 { transition: transform 260ms cubic-bezier(.22,.9,.24,1), box-shadow 260ms cubic-bezier(.22,.9,.24,1); transform-origin: center; will-change: transform, box-shadow; }
        /* pop moves the card up and increases shadow but does not scale the image */
        [id^="Card"].pop, [id^="Product"].pop, #Column_1.pop, #Column_2.pop, #Column_3.pop, #Column_4.pop, #Column_5.pop, #Column_6.pop { transform: translateY(-8px); box-shadow: 0 22px 46px rgba(0,0,0,0.22); z-index: 30; }
        [id^="Card"].touching, [id^="Product"].touching, #Column_1.touching, #Column_2.touching, #Column_3.touching, #Column_4.touching, #Column_5.touching, #Column_6.touching { transition-duration: 160ms; transform: translateY(-6px); }
        @media (hover: none) and (pointer: coarse) { [id^="Card"].pop, [id^="Product"].pop, #Column_1.pop, #Column_2.pop, #Column_3.pop, #Column_4.pop, #Column_5.pop, #Column_6.pop { transform: translateY(-6px); } }
      `;
      document.head.appendChild(s);
    }

    const setupCard = (card) => {
      const tagline = card.querySelector('[id^="Tagline"]');
      const heading = card.querySelector('[id^="Heading"]');
      const text = card.querySelector('[id^="Text"]');
      const button = card.querySelector('button');
      const chevron = card.querySelector('[id^="chevron"], [id^="chevron_right"]');

      // Entrance animations (subtle)
      const animateElements = () => {
        
        const ease = 'cubic-bezier(.22,.9,.24,1)';
        try {
          if (img && img.animate) img.animate([
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 640, easing: ease, fill: 'forwards', delay: 120 });
          else if (img) img.style.opacity = 1;

          if (tagline && tagline.animate) tagline.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}], {duration:380, easing: ease, fill:'forwards', delay:240});
          if (heading && heading.animate) heading.animate([{opacity:0, transform:'translateY(10px)'},{opacity:1, transform:'translateY(0)'}], {duration:560, easing: ease, fill:'forwards', delay:320});
          if (text && text.animate) text.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:560, easing: ease, fill:'forwards', delay:420});
          if (button && button.animate) button.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}], {duration:380, easing: ease, fill:'forwards', delay:520});
        } catch (e) {}
      };

      try {
        const io = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              animateElements();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.18 });
        io.observe(card);
      } catch (e) {
        animateElements();
      }

      // Pop on hover / focus / touch
      let touchTimer = null;
      const addPop = () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } card.classList.add('pop'); };
      const removePop = () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } card.classList.remove('pop'); card.classList.remove('touching'); };

      card.addEventListener('pointerenter', addPop);
      card.addEventListener('pointerleave', removePop);
      card.addEventListener('focusin', addPop, true);
      card.addEventListener('focusout', removePop, true);

      card.addEventListener('touchstart', (ev) => {
        card.classList.add('touching');
        addPop();
        if (touchTimer) clearTimeout(touchTimer);
        touchTimer = setTimeout(removePop, 700);
      }, { passive: true });
      card.addEventListener('touchend', () => {
        if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
        setTimeout(removePop, 80);
      });

      // Chevron micro-interaction on button hover/focus — keep subtle
      if (button && chevron) {
        let chevAnim = null;
        const onEnter = () => {
          if (chevAnim) chevAnim.cancel();
          if (chevron.animate) chevAnim = chevron.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(6px)' }
          ], { duration: 200, easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'forwards' });
        };
        const onLeave = () => {
          if (chevAnim) chevAnim.cancel();
          if (chevron.animate) chevAnim = chevron.animate([
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0px)' }
          ], { duration: 220, easing: 'cubic-bezier(.22,.9,.24,1)', fill: 'forwards' });
        };
        button.addEventListener('mouseenter', onEnter);
        button.addEventListener('focus', onEnter, true);
        button.addEventListener('mouseleave', onLeave);
        button.addEventListener('blur', onLeave, true);
      }
    };

    cards.forEach(setupCard);
  })();
});
