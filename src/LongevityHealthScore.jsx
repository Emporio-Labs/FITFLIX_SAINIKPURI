import React, { useState, useEffect } from 'react';
import './LongevityHealthScore.css';

const Q1 = [
  { cat:"Movement", q:"How many days per week do you exercise or move intentionally?", opts:[["0–1 days — mostly sedentary",1],["2–3 days — light activity",2],["4–5 days — regular workouts",3],["6–7 days — very active or athletic",4]] },
  { cat:"Nutrition", q:"How would you describe your typical diet?", opts:[["Processed foods, irregular meals",1],["Mixed — some healthy, some junk",2],["Mostly whole foods with occasional treats",3],["Clean, whole-food focused with mindful eating",4]] },
  { cat:"Sleep", q:"On average, how many hours of quality sleep do you get?", opts:[["Less than 5 hours",1],["5–6 hours — often tired",2],["7–8 hours — generally rested",3],["8–9 hours — consistent and restorative",4]] },
  { cat:"Mental Wellness", q:"How well do you manage daily stress and mental load?", opts:[["Frequently overwhelmed or anxious",1],["Moderate stress, occasional coping",2],["Generally calm with good coping tools",3],["Consistently resilient with active practices",4]] },
  { cat:"Hydration", q:"How much water do you drink daily?", opts:[["Less than 1 litre",1],["1–1.5 litres",2],["1.5–2.5 litres",3],["2.5+ litres, consciously hydrated",4]] },
  { cat:"Recovery", q:"How do you typically recover after physical activity or a tough week?", opts:[["I don't really recover — just push through",1],["Rest on weekends, minimal structure",2],["Some stretching, decent sleep routine",3],["Active recovery, sleep tracking, stress release practices",4]] },
  { cat:"Energy", q:"How are your energy levels throughout a typical day?", opts:[["Fatigued most of the day — caffeine dependent",1],["Afternoon energy dips are common",2],["Mostly good with minor fluctuations",3],["Consistently high energy, no crashes",4]] },
];

const Q2 = [
  { cat:"Movement", q:"How many minutes of moderate-to-vigorous exercise do you average per week?", opts:[["Under 60 minutes",1],["60–120 minutes",2],["150–250 minutes",3],["250+ minutes with varied modalities",4]] },
  { cat:"Movement", q:"Do you incorporate strength training, flexibility, and cardio in your routine?", opts:[["No structured routine",1],["One modality only",2],["Two modalities regularly",3],["All three, periodized and tracked",4]] },
  { cat:"Nutrition", q:"How many servings of vegetables and legumes do you eat daily?", opts:[["0–1 servings",1],["2–3 servings",2],["4–5 servings",3],["6+ servings, diverse and plant-rich",4]] },
  { cat:"Nutrition", q:"How is your relationship with eating habits, hunger cues, and meal timing?", opts:[["Emotional eating or skipping meals",1],["Inconsistent — no clear pattern",2],["Regular meals, mostly intuitive",3],["Structured, mindful, timed eating",4]] },
  { cat:"Sleep", q:"Do you follow a consistent sleep schedule (same bed & wake time)?", opts:[["No consistency at all",1],["Roughly consistent on weekdays",2],["Consistent most days",3],["Always consistent, protected sleep window",4]] },
  { cat:"Sleep", q:"Do you experience issues like waking frequently, snoring, or unrefreshing sleep?", opts:[["Frequently — major issues",1],["Occasionally noticeable",2],["Rarely — minor",3],["Never — sleep is deep and restorative",4]] },
  { cat:"Mental Health", q:"Do you have regular practices for mental health (meditation, therapy, journaling)?", opts:[["No practices",1],["Occasionally when stressed",2],["2–3 times a week",3],["Daily dedicated practice",4]] },
  { cat:"Mental Health", q:"How connected do you feel to purpose, meaning, or flow in daily life?", opts:[["Disconnected or purposeless",1],["Occasionally purposeful",2],["Generally fulfilled",3],["Deeply connected to purpose and community",4]] },
  { cat:"Social Wellness", q:"How robust is your social support network and sense of belonging?", opts:[["Isolated or lonely",1],["Limited social connection",2],["Good relationships, some depth",3],["Rich, reciprocal, nourishing relationships",4]] },
  { cat:"Biomarkers", q:"Have you had health screenings (blood panels, metabolic markers) in the past year?", opts:[["Never checked",1],["More than 2 years ago",2],["Within the past year — basic tests",3],["Comprehensive annual panel with physician review",4]] },
  { cat:"Habits", q:"Do you consume alcohol, tobacco, or other substances?", opts:[["Daily or heavy use",1],["Several times a week",2],["Occasional social use",3],["Rarely or never",4]] },
  { cat:"Habits", q:"How much time do you spend in natural light and nature per week?", opts:[["Almost none — mostly indoors",1],["1–2 hours",2],["3–5 hours",3],["Daily outdoor time, nature-integrated lifestyle",4]] },
  { cat:"Recovery", q:"Do you use any active recovery methods (cold therapy, massage, breathwork, sauna)?", opts:[["None",1],["Occasionally, inconsistently",2],["1–2 tools used weekly",3],["Multiple modalities, structured protocol",4]] },
  { cat:"Environment", q:"How clean and optimised is your home/work environment (air, light, EMF, noise)?", opts:[["Unaware or unconcerned",1],["Somewhat aware, minimal changes",2],["Moderate adjustments made",3],["Highly optimised, air filters, blue-light, routines",4]] },
  { cat:"Purpose", q:"Do you have long-term health goals and actively track progress?", opts:[["No goals or tracking",1],["Vague goals, no tracking",2],["Some goals with occasional review",3],["Clear goals, regular review, data-informed",4]] },
];

const BRANDS = [
  { name:"Equinox", country:"USA · Global", range:[0,20], tier:"Performance & Lifestyle", desc:"Your starting point. Equinox's methodology focuses on movement fundamentals, body composition, and building consistent fitness habits — the essential foundation of longevity.", rec:["Start a 3-day/week structured workout plan","Prioritise 7–8 hours of sleep nightly","Begin tracking your daily steps and water intake"] },
  { name:"Six Senses", country:"Global Retreats", range:[21,40], tier:"Holistic Mind-Body", desc:"You're building wellness awareness. Six Senses integrates mindfulness, sleep science, and holistic nutrition — addressing the whole person beyond just the gym.", rec:["Add a daily 10-min mindfulness or breathwork session","Experiment with a whole-food, plant-forward diet","Introduce weekly digital detox periods"] },
  { name:"Canyon Ranch", country:"USA", range:[41,60], tier:"Integrative Preventive Health", desc:"You have solid health foundations. Canyon Ranch's integrative approach bridges preventive medicine, nutrition counselling, and movement optimisation for sustained wellbeing.", rec:["Schedule a comprehensive blood panel this quarter","Add strength training 2x/week if not already","Explore cognitive behavioural stress techniques"] },
  { name:"SHA Wellness", country:"Alicante, Spain", range:[61,80], tier:"Medical Nutrition & Longevity", desc:"You're operating at an advanced wellness level. SHA's protocol combines macrobiotic nutrition, anti-ageing diagnostics, and metabolic optimisation for measurable longevity gains.", rec:["Consider advanced metabolic & hormonal testing","Adopt time-restricted eating or intermittent fasting","Explore epigenetic or microbiome testing with a specialist"] },
  { name:"Lanserhof", country:"Germany · Austria", range:[81,100], tier:"Precision Medical Longevity", desc:"You exemplify elite longevity practice. Lanserhof's precision approach — combining diagnostics, detoxification, and functional medicine — mirrors your disciplined, data-driven lifestyle.", rec:["Maintain your protocols with quarterly biometric review","Add advanced recovery: peptide therapy or IV micronutrients","Explore genetic longevity profiling for the next frontier"] },
];

const DEFAULT_LEAD_CAPTURE_BASE_URL = 'https://hybridhumanbackend.vercel.app';
const RAW_LEAD_CAPTURE_BASE_URL = import.meta.env ? import.meta.env.VITE_LEAD_CAPTURE_BASE_URL : '';
const LEAD_CAPTURE_BASE_URL = (
  RAW_LEAD_CAPTURE_BASE_URL && !RAW_LEAD_CAPTURE_BASE_URL.includes('%VITE_')
    ? RAW_LEAD_CAPTURE_BASE_URL
    : DEFAULT_LEAD_CAPTURE_BASE_URL
).trim().replace(/\/+$/, '');
const LEAD_CAPTURE_ENDPOINT = `${LEAD_CAPTURE_BASE_URL}/leads/public-capture`;

const LongevityHealthScore = () => {
  const [activeSection, setActiveSection] = useState('s-intro');
  const [selVersion, setSelVersion] = useState(1);
  
  const [userData, setUserData] = useState({
    name: '', phone: '', email: '', age: '', gender: '', goal: '', interests: [], notes: ''
  });
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const qList = selVersion === 1 ? Q1 : Q2;
  const totalQ = qList.length;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('f-', '');
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setUserData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const goTo = (sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo(0, 0);
  };

  const startQuestionnaire = () => {
    if (!userData.name || !userData.phone || !userData.email) {
      alert('Please fill in Name, Phone, and Email to continue.');
      return;
    }
    
    goTo('s-quote');
    
    setTimeout(() => {
      goTo('s-q');
      setCurrentQ(0);
      setAnswers({});
    }, 2800);
  };

  const pickOpt = (qIndex, score) => {
    setAnswers(prev => ({ ...prev, [qIndex]: score }));
    setTimeout(() => {
      if (currentQ < totalQ - 1) {
        nextQ();
      }
    }, 450);
  };

  const nextQ = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const prevQ = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    }
  };

  const calculateScore = async () => {
    let total = 0;
    let maxTotal = 0;
    const scores = {};
    const totals = {};

    qList.forEach((q, i) => {
      const s = answers[i] || 2; // Default to 2 if not answered
      if (!scores[q.cat]) { scores[q.cat] = 0; totals[q.cat] = 0; }
      scores[q.cat] += s;
      totals[q.cat] += 4;
    });

    const catPct = {};
    for (const cat in scores) {
      catPct[cat] = Math.round((scores[cat] / totals[cat]) * 100);
      total += scores[cat];
      maxTotal += totals[cat];
    }

    const overall = Math.round((total / maxTotal) * 100);
    const brand = BRANDS.find(b => overall >= b.range[0] && overall <= b.range[1]) || BRANDS[4];

    setResult({ overall, catPct, brand });

    // Submit Lead
    const parsedAge = parseInt(userData.age, 10);
    const personalDetails = {
      fullName: userData.name,
      phoneNumber: userData.phone,
      emailAddress: userData.email,
      gender: userData.gender,
      primaryHealthGoal: userData.goal,
      wellnessInterests: userData.interests,
      notes: userData.notes
    };
    if (!isNaN(parsedAge)) personalDetails.age = parsedAge;

    const assessmentAnswers = {};
    const prefix = selVersion === 1 ? 'v1' : 'v2';
    for (let i = 0; i < totalQ; i++) {
      assessmentAnswers[`${prefix}_q${i + 1}`] = answers[i] || 2;
    }

    const payload = {
      formType: 'healthscore',
      personalDetails,
      assessment: {
        version: selVersion === 1 ? 'v1_quick_vitality_check' : 'v2_deep_longevity_assessment',
        answers: assessmentAnswers
      },
      source: window.location.hostname || 'fitflix.in',
      tags: ['website', 'healthscore'],
      captchaToken: window.fitflixLeadCaptchaToken || 'captcha-not-provided',
      website: ''
    };

    try {
      await fetch(LEAD_CAPTURE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Lead capture failed:', err);
    }

    goTo('s-result');
  };

  const progressPct = Math.round(((currentQ + 1) / totalQ) * 100);

  return (
    <>
      <nav>
        <a href="/" className="nav-logo">
          <img src="/assets/fitflix_logo.png" alt="Fitflix" />
          Fitflix
        </a>
        <a href="/" className="nav-back-btn">Back to Home</a>
      </nav>

      <div className="ff-wrap">
        <div className="ff-header">
          <div className="ff-tagline">Longevity Health Score Assessment</div>
        </div>

        {/* Intro Section */}
        <section className={`section ${activeSection === 's-intro' ? 'active' : ''}`} id="s-intro">
          <div>
            <p className="section-title">The Global Standard for Longevity</p>
            <p className="section-sub">Your health score is benchmarked against the world's five premier longevity & wellness institutes.</p>

            <div className="brand-scale">
              {BRANDS.map((b, i) => (
                <div className="brand-card" key={i}>
                  <div className="brand-rank">Tier {i + 1}</div>
                  <div className="brand-name">{b.name}</div>
                  <div className="brand-country">{b.country.split('·')[0]}</div>
                </div>
              ))}
            </div>

            <p style={{fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '700px', textAlign: 'center', marginInline: 'auto'}}>
              Each tier represents a distinct philosophy of longevity — from performance-driven fitness to full-spectrum medical diagnostics. Your score will place you on this scale and guide your next steps.
            </p>

            <div className="v-picker">
              <div className={`v-card ${selVersion === 1 ? 'selected' : ''}`} onClick={() => setSelVersion(1)}>
                <div className="v-badge">Version 1</div>
                <div className="v-title">Quick Vitality Check</div>
                <div className="v-desc">7 targeted questions covering your core health pillars. Ideal for a first-time snapshot.</div>
                <div className="v-meta"><span>5 minutes</span> · 7 questions · Instant score</div>
              </div>
              <div className={`v-card ${selVersion === 2 ? 'selected' : ''}`} onClick={() => setSelVersion(2)}>
                <div className="v-badge">Version 2</div>
                <div className="v-title">Deep Longevity Assessment</div>
                <div className="v-desc">15 clinical-grade questions across 7 wellness domains. Inspired by SHA & Lanserhof protocols.</div>
                <div className="v-meta"><span>12 minutes</span> · 15 questions · Full report</div>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => goTo('s-details')}>Begin Assessment</button>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className={`section ${activeSection === 's-details' ? 'active' : ''}`} id="s-details">
          <div>
            <p className="section-title">Your Profile</p>
            <p className="section-sub">Your details are used to personalise your health report and connect you with the right program.</p>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" id="f-name" value={userData.name} onChange={handleInputChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" id="f-phone" value={userData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" id="f-email" value={userData.email} onChange={handleInputChange} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" id="f-age" value={userData.age} onChange={handleInputChange} placeholder="32" min="16" max="100" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select id="f-gender" value={userData.gender} onChange={handleInputChange}>
                  <option value="">Prefer not to say</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Primary Health Goal</label>
                <select id="f-goal" value={userData.goal} onChange={handleInputChange}>
                  <option value="">Select a goal...</option>
                  <option>Weight Management</option>
                  <option>Build Strength & Muscle</option>
                  <option>Improve Cardiovascular Health</option>
                  <option>Stress & Mental Wellness</option>
                  <option>Longevity & Disease Prevention</option>
                  <option>Better Sleep & Recovery</option>
                  <option>Hormone & Metabolic Balance</option>
                  <option>General Fitness & Energy</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Wellness Interests (select all that apply)</label>
                <div className="interests-grid">
                  {['Yoga & Mindfulness', 'Strength Training', 'Nutrition & Diet', 'Sleep Optimisation', 'Biohacking & Longevity', 'Cardio & Endurance', 'Detox & Cleansing', 'Mental Health & Therapy', 'Spa & Recovery'].map(interest => (
                    <div 
                      key={interest} 
                      className={`interest-chip ${userData.interests.includes(interest) ? 'on' : ''}`} 
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group full">
                <label>Anything you'd like us to know?</label>
                <textarea id="f-notes" value={userData.notes} onChange={handleInputChange} rows="2" placeholder="Medical conditions, preferences, or questions for our team..." style={{resize:'none'}}></textarea>
              </div>
            </div>
            <div className="btn-row between">
              <button className="btn" style={{opacity: 0.7}} onClick={() => goTo('s-intro')}>Back</button>
              <button className="btn btn-primary" onClick={startQuestionnaire}>Start Assessment</button>
            </div>
          </div>
        </section>

        {/* Pre-Quiz Quote Section */}
        <section className={`section ${activeSection === 's-quote' ? 'active' : ''}`} id="s-quote">
          <div className="quote-screen">
            <h2 className="quote-text">"Longevity is not just adding years to life, but life to years."</h2>
          </div>
        </section>

        {/* Quiz Question Section */}
        <section className={`section ${activeSection === 's-q' ? 'active' : ''}`} id="s-q">
          <div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{width: `${progressPct}%`}}></div>
            </div>
            
            <div id="q-container">
              {qList.map((q, i) => (
                <div key={i} className={`q-slide ${i === currentQ ? 'active' : i < currentQ ? 'exit' : ''}`} style={i > currentQ ? {opacity: 0, transform: 'translateX(30px)', pointerEvents: 'none'} : {}}>
                  <div className="q-cat">{q.cat}</div>
                  <div className="q-label">Q{i+1} of {totalQ}.<br/>{q.q}</div>
                  <div className="q-options">
                    {q.opts.map((o, j) => (
                      <div 
                        key={j} 
                        className={`q-opt ${answers[i] === o[1] ? 'picked' : ''}`} 
                        onClick={() => pickOpt(i, o[1])}
                      >
                        <div className="q-dot"></div>
                        <span>{o[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="btn-row between" style={{marginTop: '3rem'}}>
              <button className="btn" style={{display: currentQ === 0 ? 'none' : 'inline-flex'}} onClick={prevQ}>Previous</button>
              <button className="btn btn-primary" onClick={nextQ}>{currentQ === totalQ - 1 ? 'Calculate Score' : 'Next'}</button>
            </div>
          </div>
        </section>

        {/* Result Section */}
        <section className={`section ${activeSection === 's-result' ? 'active' : ''}`} id="s-result">
          {result && (
            <div>
              <p className="section-title" style={{marginBottom:'0.25rem'}}>Your Health Score</p>
              <p className="section-sub" style={{marginBottom: 0}}>Version {selVersion} · {selVersion===1?'Quick Vitality Check':'Deep Longevity Assessment'} · {userData.name}</p>

              <div className="score-ring-wrap">
                <div><span className="score-num">{result.overall}</span><span className="score-denom">/100</span></div>
                <div className="score-label">Longevity Vitality Score</div>
              </div>

              <div className="brand-match-grid">
                {BRANDS.map((b, i) => (
                  <div key={i} className={`b-match-col ${b.name === result.brand.name ? 'active' : ''}`}>
                    <div className="b-match-tier">Tier {i+1}</div>
                    <div className="b-match-name">{b.name}</div>
                  </div>
                ))}
              </div>

              <div className="tier-match">
                <div className="tier-tag">{result.brand.tier}</div>
                <div className="tier-brand">{result.brand.name} Level</div>
                <div style={{fontSize:'0.9rem', color:'var(--text-muted)', marginTop:'0.35rem'}}>{result.brand.country}</div>
                <div className="tier-sub">{result.brand.desc}</div>
              </div>

              <h3 style={{fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 300, color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem'}}>Score by Category</h3>
              <div className="score-cats">
                {Object.entries(result.catPct).map(([cat, pct]) => (
                  <div className="score-cat" key={cat}>
                    <div className="sc-name">{cat}</div>
                    <div className="sc-bar-wrap"><div className="sc-bar" style={{width:`${pct}%`}}></div></div>
                    <div className="sc-val">{pct}/100</div>
                  </div>
                ))}
              </div>

              <div className="recs-box">
                <div className="recs-title">Your Action Plan</div>
                {result.brand.rec.map((r, i) => (
                  <div className="rec-row" key={i}>
                    <div className="rec-icon">✦</div>
                    <div className="rec-text">{r}</div>
                  </div>
                ))}
              </div>

              <div className="final-quote">
                <h2>"Healing that begins with you, for you."</h2>
              </div>

              <div className="bottom-cta">
                <div style={{fontSize:'1.1rem', color:'rgba(255,255,255,0.85)', marginBottom:'1.5rem'}}>
                  Our wellness experts will reach out to <strong style={{color:'#dcb36d'}}>{userData.phone}</strong> within 24 hours.
                </div>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Retake Assessment</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default LongevityHealthScore;
