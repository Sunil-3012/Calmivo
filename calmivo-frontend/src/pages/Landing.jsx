import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function useTilt(selector) {
  useEffect(() => {
    const cards = document.querySelectorAll(selector);
    const handlers = [];
    cards.forEach(card => {
      const shine = card.querySelector('.card-shine');
      const onMove = e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y - r.height / 2) / (r.height / 2)) * -10;
        const ry = ((x - r.width / 2) / (r.width / 2)) * 10;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
        card.style.boxShadow = '0 0 40px rgba(255,71,196,0.25), 0 20px 40px rgba(0,0,0,0.5)';
        card.style.borderColor = 'rgba(255,71,196,0.45)';
        if (shine) {
          shine.style.background = `radial-gradient(circle at ${(x/r.width)*100}% ${(y/r.height)*100}%, rgba(255,255,255,0.13) 0%, transparent 55%)`;
          shine.style.opacity = '1';
        }
      };
      const onLeave = () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        if (shine) { shine.style.opacity = '0'; shine.style.background = ''; }
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      handlers.push({ card, onMove, onLeave });
    });
    return () => handlers.forEach(({ card, onMove, onLeave }) => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    });
  }, [selector]);
}

function useCounters() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-count-text]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const final = el.dataset.countText;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let iter = 0;
        const iv = setInterval(() => {
          el.textContent = final.split('').map((c, i) => {
            if (i < Math.floor(iter)) return c;
            return isNaN(c) && c !== '/' ? chars[Math.floor(Math.random() * 26)] : c;
          }).join('');
          iter += 0.55;
          if (iter >= final.length) { el.textContent = final; clearInterval(iv); }
        }, 45);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Landing() {
  const navigate = useNavigate();
  useTilt('.feature-card');
  useCounters();

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar__inner">
          <div className="navbar__logo">
            <svg viewBox="0 0 100 95" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36, filter: 'drop-shadow(0 0 8px rgba(255,71,196,0.6))' }} aria-hidden="true">
              <defs>
                <linearGradient id="land-g" x1="5" y1="5" x2="95" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF47C4"/>
                  <stop offset="100%" stopColor="#C026D3"/>
                </linearGradient>
                <filter id="land-glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path d="M15 6 Q5 6 5 16 L5 62 Q5 72 15 72 L20 72 L11 90 L36 72 L85 72 Q95 72 95 62 L95 16 Q95 6 85 6 Z"
                stroke="url(#land-g)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" filter="url(#land-glow)"/>
              <path d="M50 28 C46 19 20 20 20 38 C20 53 35 60 50 67"
                stroke="url(#land-g)" strokeWidth="5" strokeLinecap="round" filter="url(#land-glow)"/>
              <path d="M50 28 C54 19 80 20 80 38 C80 53 65 60 50 67"
                stroke="url(#land-g)" strokeWidth="5" strokeLinecap="round" filter="url(#land-glow)"/>
            </svg>
            <span className="navbar__logo-text">Calmivo</span>
          </div>
          <ul className="navbar__links">
            <li><a href="#features">Features</a></li>
            <li><a href="#why">Why Calmivo</a></li>
            <li><a href="#testimonials">Stories</a></li>
            <li><a href="/chat" className="navbar__cta">Start Chatting</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero__badge fade-up">
            ✨ AI-Powered Mental Wellness
          </div>
          <h1 className="hero__title fade-up">
            A calmer mind starts with <span>one conversation</span>
          </h1>
          <p className="hero__subtitle fade-up">
            Calmivo is your safe, judgment-free space to talk, reflect, and grow.
            Powered by AI, guided by compassion. Available anytime you need it.
          </p>
          <div className="hero__actions fade-up">
            <button className="btn-primary" onClick={() => navigate('/chat')}>
              💬 Talk to Sage, it's free
            </button>
            <button className="btn-outline" onClick={() => navigate('/resources')}>
              Explore Resources
            </button>
          </div>

          {/* Chat preview mockup */}
          <div className="hero__preview fade-up">
            <div className="hero__preview-bar">
              <div className="hero__preview-dot" style={{ background: '#FC5753' }} />
              <div className="hero__preview-dot" style={{ background: '#FDBC40' }} />
              <div className="hero__preview-dot" style={{ background: '#33C748' }} />
              <span className="hero__preview-title">💜 Sage — Calmivo Companion</span>
            </div>
            <div className="hero__chat">
              <div className="chat-bubble chat-bubble--user">
                I've been feeling really anxious and overwhelmed lately...
              </div>
              <div className="chat-bubble chat-bubble--sage">
                <div className="chat-bubble__name">Sage</div>
                That sounds really hard, and I'm glad you reached out. Anxiety can feel
                all-consuming sometimes. Can you tell me a little more about what's been
                weighing on you most? I'm here to listen. 💜
              </div>
              <div className="chat-bubble chat-bubble--user">
                It's mostly work stress and not sleeping well
              </div>
              <div className="chat-bubble chat-bubble--sage">
                <div className="chat-bubble__name">Sage</div>
                That combination is really tough. Poor sleep makes everything feel
                harder to handle. Let's try something together right now: a simple
                breathing exercise that can calm your nervous system in under 5 minutes.
                Would that help?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <p className="section__label fade-up">What Calmivo Offers</p>
          <h2 className="section__title fade-up">Everything you need to feel better</h2>
          <p className="section__subtitle fade-up">
            Three powerful tools designed to support your mental wellbeing, all in one place.
          </p>
          <div className="features-grid">
            <div className="feature-card fade-up">
              <div className="card-shine" />
              <div className="feature-card__icon">💬</div>
              <h3 className="feature-card__title">AI Wellness Companion</h3>
              <p className="feature-card__desc">
                Chat with Sage, your compassionate AI companion trained in CBT techniques,
                grounding exercises, and empathetic listening. Available 24/7 with no appointments needed.
              </p>
            </div>
            <div className="feature-card fade-up">
              <div className="card-shine" />
              <div className="feature-card__icon">📊</div>
              <h3 className="feature-card__title">Mood Tracker</h3>
              <p className="feature-card__desc">
                Log how you're feeling daily and watch your patterns emerge. Track your mood
                score, add notes, and get insights on your emotional trends over time.
              </p>
            </div>
            <div className="feature-card fade-up">
              <div className="card-shine" />
              <div className="feature-card__icon">🌿</div>
              <h3 className="feature-card__title">Wellness Resources</h3>
              <p className="feature-card__desc">
                Access a curated library of evidence-based exercises: breathing techniques,
                grounding methods, sleep guides, and mindfulness practices whenever you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why I Built This */}
      <section className="section why-section" id="why">
        <div className="container">
          <div className="why-grid">
            <div className="why-story">
              <p className="section__label fade-up" style={{ textAlign: 'left' }}>The Story</p>
              <h2 className="why__title fade-up">Why I built Calmivo</h2>
              <p className="why__text fade-up">
                Late one night during my final year of college, I found myself spiraling with anxiety
                but too exhausted to call anyone. I just needed something to talk to. Something patient.
                Something that wouldn't judge me for feeling overwhelmed at 2am.
              </p>
              <p className="why__text fade-up">
                I'm Sunil, a software engineer who started building Calmivo not because I saw a market
                opportunity, but because I genuinely needed something like it. I combined everything I'd
                learned about AI, mental wellness frameworks, and thoughtful design to build the companion
                I wish I'd had.
              </p>
              <p className="why__text fade-up">
                Calmivo isn't trying to replace therapy. It's the bridge between feeling overwhelmed
                and feeling ready to take the next step. Available any hour, zero judgment, completely private.
              </p>
            </div>
            <div className="why-stats fade-up">
              <div className="why-stat">
                <div className="why-stat__number" data-count-text="24/7">24/7</div>
                <div className="why-stat__label">Always available</div>
              </div>
              <div className="why-stat">
                <div className="why-stat__number" data-count-text="Free">Free</div>
                <div className="why-stat__label">No cost, ever</div>
              </div>
              <div className="why-stat">
                <div className="why-stat__number" data-count-text="Private">Private</div>
                <div className="why-stat__label">No account needed</div>
              </div>
              <div className="why-stat">
                <div className="why-stat__number" data-count-text="Safe">Safe</div>
                <div className="why-stat__label">Crisis support built in</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section--alt" id="how-it-works">
        <div className="container">
          <p className="section__label fade-up">Simple by Design</p>
          <h2 className="section__title fade-up">How Calmivo works</h2>
          <p className="section__subtitle fade-up">
            No sign-up required. Just open, talk, and feel better.
          </p>
          <div className="steps">
            <div className="step fade-up">
              <div className="step__number">1</div>
              <h3 className="step__title">Open Calmivo</h3>
              <p className="step__desc">
                No account needed. Your session is private and yours alone.
              </p>
            </div>
            <div className="step fade-up">
              <div className="step__number">2</div>
              <h3 className="step__title">Talk to Sage</h3>
              <p className="step__desc">
                Share what's on your mind. Sage listens with empathy and responds thoughtfully.
              </p>
            </div>
            <div className="step fade-up">
              <div className="step__number">3</div>
              <h3 className="step__title">Track your mood</h3>
              <p className="step__desc">
                Log your feelings and discover your emotional patterns over time.
              </p>
            </div>
            <div className="step fade-up">
              <div className="step__number">4</div>
              <h3 className="step__title">Practice and Grow</h3>
              <p className="step__desc">
                Use curated exercises to build healthy habits and emotional resilience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials">
        <div className="container">
          <p className="section__label fade-up">Real Stories</p>
          <h2 className="section__title fade-up">People who found their calm</h2>
          <p className="section__subtitle fade-up">
            Here's what people say about using Calmivo during difficult moments.
          </p>
          <div className="testimonials-grid">
            <div className="testimonial-card fade-up">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "I was having a panic attack at 2am with no one to call. Sage walked me through
                a breathing exercise and just listened. I felt genuinely better within 15 minutes."
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">🌸</div>
                <div>
                  <div className="testimonial-card__name">Anonymous</div>
                  <div className="testimonial-card__role">Graduate Student</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-up">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "The mood tracker helped me realize my anxiety spikes every Sunday evening.
                That awareness alone has been life-changing for how I plan my week."
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">🌊</div>
                <div>
                  <div className="testimonial-card__name">Anonymous</div>
                  <div className="testimonial-card__role">Software Engineer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-up">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "I use the resources section every night before bed. The progressive muscle
                relaxation exercise has genuinely transformed my sleep. Highly recommend."
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">🌿</div>
                <div>
                  <div className="testimonial-card__name">Anonymous</div>
                  <div className="testimonial-card__role">Healthcare Worker</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section">
        <div className="cta-banner fade-up">
          <h2 className="cta-banner__title">Ready to find your calm?</h2>
          <p className="cta-banner__subtitle">
            Start a conversation with Sage right now. No sign-up, no judgment, just support.
          </p>
          <button className="btn-primary" onClick={() => navigate('/chat')}>
            💬 Start talking, it's free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="footer__logo">Calmivo</div>
              <p className="footer__tagline">
                Your AI mental wellness companion. Available anytime, completely private.
              </p>
            </div>
            <div className="footer__links">
              <h4>Product</h4>
              <ul>
                <li><a href="/chat">Chat with Sage</a></li>
                <li><a href="/mood">Mood Tracker</a></li>
                <li><a href="/resources">Resources</a></li>
              </ul>
            </div>
            <div className="footer__links">
              <h4>Crisis Support</h4>
              <ul>
                <li><a href="tel:988">988 Lifeline: Call or Text 988</a></li>
                <li><a href="sms:741741">Crisis Text Line: Text HOME to 741741</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2025 Calmivo. Built with 💜 for everyone who needs a moment of calm.</p>
            <p className="footer__disclaimer">
              Calmivo is an AI wellness tool and is not a substitute for professional mental health care.
              If you are in crisis, please contact a qualified mental health professional or call 988.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
