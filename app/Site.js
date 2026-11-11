'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { T, COURSE_URL, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from '../lib/i18n';
import { supabase } from '../lib/supabase';

const FILTERS = ['all', 'agri', 'health', 'brand'];

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* A grid card: poster + a short muted loop that only plays while on screen. */
function Card({ p, lang, t, index, onOpen }) {
  const ref = useRef(null);
  const vid = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const v = vid.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const title = lang === 'ar' ? p.title_ar : p.title_en;
  const cat = lang === 'ar' ? p.category_ar : p.category_en;
  const wide = p.aspect === '16:9';

  return (
    <button
      ref={ref}
      type="button"
      className={`card${wide ? ' wide' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      onClick={() => onOpen(index)}
      aria-label={`${t.play}: ${title}`}
    >
      <img src={p.poster_url} alt="" loading={index < 4 ? 'eager' : 'lazy'} decoding="async" />
      <video ref={vid} data-src={p.loop_url} muted loop playsInline preload="none" aria-hidden="true" />
      <span className="ov" />
      <span className="fmt">{p.aspect}</span>
      <span className="play" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
      </span>
      <span className="meta">
        <span className="t">{title}</span>
        <span className="c">{cat} · {p.duration}</span>
      </span>
    </button>
  );
}

/* Adaptive streaming: native HLS on Safari/iOS, hls.js everywhere else, plain MP4 if the source is .mp4.
   Starts at a low rendition so playback begins instantly, then climbs as bandwidth allows. */
let hlsModule = null;
export function warmHls() {
  if (!hlsModule && typeof window !== 'undefined') hlsModule = import('hls.js');
  return hlsModule;
}

function StreamVideo({ src, poster, tall }) {
  const ref = useRef(null);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let hls;
    let cancelled = false;
    const isHls = src.endsWith('.m3u8');
    const play = () => v.play().catch(() => {});

    if (!isHls || v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = src;
      play();
    } else {
      warmHls().then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) { v.src = src; play(); return; }
        hls = new Hls({
          capLevelToPlayerSize: true,
          startLevel: -1,
          abrEwmaDefaultEstimate: 1_200_000,
          maxBufferLength: 20,
          backBufferLength: 30,
        });
        hls.loadSource(src);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, play);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else hls.destroy();
        });
      });
    }
    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      v.removeAttribute('src');
      v.load();
    };
  }, [src]);

  return (
    <div className={`vwrap${tall ? ' tall' : ''}`}>
      <video
        ref={ref}
        poster={poster}
        controls
        playsInline
        preload="auto"
        className={tall ? 'tall' : ''}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
      />
      {waiting && <span className="spin" aria-hidden="true" />}
    </div>
  );
}

/* Full-screen player with prev / next, keyboard and swipe. */
function Player({ list, index, setIndex, lang, t }) {
  const p = list[index];
  const closeRef = useRef(null);
  const touch = useRef(null);
  const n = list.length;
  const close = useCallback(() => setIndex(-1), [setIndex]);
  const next = useCallback(() => setIndex((i) => (i + 1) % n), [setIndex, n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [setIndex, n]);
  const rtl = lang === 'ar';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') (rtl ? prev : next)();
      if (e.key === 'ArrowLeft') (rtl ? next : prev)();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [close, next, prev, rtl]);

  if (!p) return null;
  const title = lang === 'ar' ? p.title_ar : p.title_en;
  const cat = lang === 'ar' ? p.category_ar : p.category_en;

  return (
    <div
      className="pl"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) < 60) return;
        // swipe toward reading direction = next
        (dx < 0) === rtl ? prev() : next();
      }}
    >
      <div className="plbar">
        <span className="mono">{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button ref={closeRef} type="button" className="ib" onClick={close} aria-label={t.close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="plmedia" onClick={(e) => e.target === e.currentTarget && close()}>
        <StreamVideo key={p.slug} src={p.video_url} poster={p.poster_url} tall={p.aspect === '9:16'} />
      </div>
      <div className="plinfo">
        <div className="plt">
          <span className="disp">{title}</span>
          <span className="muted">{cat} · {p.duration} · {p.aspect}</span>
        </div>
        <div className="plnav">
          <button type="button" className="ib" onClick={prev} aria-label={t.prev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="flip"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" className="ib" onClick={next} aria-label={t.next}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="flip"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ t, lang }) {
  const [state, setState] = useState('idle');
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const message = String(fd.get('message') || '').trim();
    if (!name || !phone) return;
    setState('sending');
    let ok = false;
    if (supabase) {
      const { error } = await supabase.from('leads').insert({ name, phone, message: message || null, lang });
      ok = !error;
    }
    if (!ok) {
      // no database available — hand the message to WhatsApp so the lead is never lost
      const text = `${t.waText}\n${name} — ${phone}${message ? `\n${message}` : ''}`;
      window.open(waLink(text), '_blank', 'noopener');
      setState('idle');
      return;
    }
    setState('ok');
    if (ok) form.reset();
  }
  return (
    <form className="form" onSubmit={submit}>
      <label className="fl">
        <span>{t.form.name}</span>
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <label className="fl">
        <span>{t.form.phone}</span>
        <input name="phone" required maxLength={40} inputMode="tel" autoComplete="tel" dir="ltr" />
      </label>
      <label className="fl full">
        <span>{t.form.msg}</span>
        <textarea name="message" rows={3} maxLength={2000} />
      </label>
      <div className="full formrow">
        <button className="btn solid" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t.form.sending : t.form.send}
        </button>
        <span className="muted">{t.or}</span>
        <a className="btn" href={waLink(t.waText)} target="_blank" rel="noopener noreferrer">
          {t.whatsapp} · <span dir="ltr">{WHATSAPP_DISPLAY}</span>
        </a>
      </div>
      <p className="full status" role="status" aria-live="polite">
        {state === 'ok' ? t.form.ok : state === 'err' ? t.form.err : ''}
      </p>
    </form>
  );
}

export default function Site({ projects }) {
  const [lang, setLang] = useState('ar');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(-1);
  const t = T[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ar') setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = T[lang].dir;
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  // scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  const shown = useMemo(
    () => projects.filter((p) => filter === 'all' || p.category === filter),
    [projects, filter]
  );
  const counts = useMemo(() => {
    const c = { all: projects.length };
    projects.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, [projects]);

  const wa = waLink(t.waText);

  return (
    <div className="pg">
      <a href="#work" className="skip">{t.seeWork}</a>

      <header className="nav">
        <div className="wrap navin">
          <a href="#top" className="logo">
            <span className="mark">MA</span>
            <span className="disp">{t.brand}</span>
          </a>
          <nav className="navlinks" aria-label="primary">
            <a href="#work">{t.nav.work}</a>
            <a href="#fields">{t.nav.fields}</a>
            <a href="#clients">{t.nav.clients}</a>
            <a href="#course">{t.nav.course}</a>
          </nav>
          <div className="navend">
            <button className="lang" type="button" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={t.langLabel}>
              {t.langBtn}
            </button>
            <a className="btn solid sm" href="#contact">{t.nav.cta}</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <video className="bg" src="/media/hero.mp4" poster="/media/hero.jpg" autoPlay muted loop playsInline aria-hidden="true" />
          <div className="shade" />
          <div className="herotext">
            <div className="wrap">
              <div className="mono fade">{t.kicker}</div>
              <h1 className="h1" key={lang}>
                <span><i>{t.h1a}</i></span>
                <span><i>{t.h1b}</i></span>
              </h1>
              <p className="sub fade d1">{t.sub}</p>
              <div className="ctas fade d2">
                <a className="btn solid" href="#work">{t.seeWork}</a>
                <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">{t.whatsapp}</a>
              </div>
            </div>
          </div>
        </section>

        <div className="wrap">
          <div className="stats fade d3">
            {t.stats.map(([b, s]) => (
              <div className="stat" key={b}><b>{b}</b><span>{s}</span></div>
            ))}
          </div>
        </div>

        <div className="mq" aria-hidden="true">
          <div className="mqt">
            {[...t.marquee, ...t.marquee].map((w, i) => <span key={i}>{w}</span>)}
          </div>
        </div>

        <section className="sec" id="work">
          <div className="wrap">
            <div className="sechead">
              <div>
                <div className="mono">{t.workKicker}</div>
                <h2 className="h2">{t.workTitle}</h2>
              </div>
              <div className="filters" role="group" aria-label={t.workTitle}>
                {FILTERS.filter((f) => counts[f]).map((f) => (
                  <button key={f} type="button" className={`pill${filter === f ? ' on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {t.filters[f]} <span className="cnt">{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid" key={filter} onPointerEnter={warmHls} onTouchStart={warmHls}>
              {shown.map((p, i) => (
                <Card key={p.slug} p={p} lang={lang} t={t} index={i} onOpen={setOpen} />
              ))}
              <a className="ctacard" href="#contact">
                <span className="mono">Next project</span>
                <span>
                  <span className="disp ct">{t.nextTitle}</span>
                  <span className="muted cs">{t.nextSub}</span>
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="sec reveal" id="fields">
          <div className="wrap">
            <div className="sechead"><div><div className="mono">{t.fieldsKicker}</div><h2 className="h2">{t.fieldsTitle}</h2></div></div>
            <div className="fields">
              {t.fields.map(([h, p], i) => (
                <div className="field" key={h}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec reveal" id="clients">
          <div className="wrap">
            <div className="sechead"><div><div className="mono">{t.clientsKicker}</div><h2 className="h2">{t.clientsTitle}</h2></div></div>
            <div className="clients">
              {[t.clientsEgypt, t.clientsGulf].map(([b, sub]) => (
                <div className="client" key={b}>
                  <b>{b}</b>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec reveal">
          <div className="wrap">
            <div className="sechead"><div><div className="mono">{t.processKicker}</div><h2 className="h2">{t.processTitle}</h2></div></div>
            <div className="steps">
              {t.steps.map(([h, p], i) => (
                <div className="step" key={h}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec reveal" id="course">
          <div className="wrap">
            <div className="course">
              <div className="ci"><img src="/media/posters/wheat-3.jpg" alt="" loading="lazy" /></div>
              <div className="cb">
                <span className="tag">{t.courseTag}</span>
                <h2 className="h2 m0">{t.courseTitle}</h2>
                <p className="muted lh">{t.courseSub}</p>
                <ul>{t.courseList.map((x) => <li key={x}>{x}</li>)}</ul>
                <a className="btn solid self" href={COURSE_URL} target="_blank" rel="noopener noreferrer">{t.courseCta}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="contact reveal" id="contact">
          <div className="wrap">
            <div className="mono">{t.contactKicker}</div>
            <p className="big">{t.contactA}<br /><em>{t.contactB}</em></p>
            <ContactForm t={t} lang={lang} />
          </div>
        </section>
      </main>

      <footer className="wrap">
        <div className="foot">
          <span>© {new Date().getFullYear()} {t.brand} · {t.rights}</span>
          <a href={wa} target="_blank" rel="noopener noreferrer" dir="ltr">WhatsApp {WHATSAPP_DISPLAY}</a>
        </div>
      </footer>

      {open >= 0 && <Player list={shown} index={open} setIndex={setOpen} lang={lang} t={t} />}
    </div>
  );
}
