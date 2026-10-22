import React, { useState, useEffect } from 'react';

const PRESETS = {
  cloudflare: 'https://nowsecure.nl',
  fingerprint: 'https://bot.sannysoft.com/',
  quotes: 'https://quotes.toscrape.com/\nhttps://quotes.toscrape.com/page/2/'
};

const API = 'http://localhost:8000';

export default function App() {
  const [urlsText, setUrlsText] = useState(PRESETS.cloudflare);
  const [concurrency, setConcurrency] = useState(2);
  const [sessionEnabled, setSessionEnabled] = useState(true);
  const [proxyRotation, setProxyRotation] = useState(true);
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'preview'
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // Format today's date dynamically on screen
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setTodayDate(formatted);
  }, []);

  async function runBatch(e) {
    e.preventDefault();
    setBusy(true); 
    setError(''); 
    setJob(null);
    try {
      const urls = urlsText.split('\n').map(x => x.trim()).filter(Boolean);
      const response = await fetch(`${API}/api/run`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          urls, 
          concurrency: Number(concurrency),
          session_management: sessionEnabled,
          proxy_rotation: proxyRotation
        })
      });
      if (!response.ok) throw new Error((await response.text()) || 'Request failed');
      const created = await response.json();
      let current = created;
      for (let i = 0; i < 120; i++) {
        setJob(current);
        if (['completed', 'failed'].includes(current.status)) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        const poll = await fetch(`${API}/api/jobs/${created.job_id}`);
        current = await poll.json();
      }
      setJob(current);
    } catch (e) { 
      setError(`${e.message}. Is the FastAPI backend running on port 8000?`); 
    } finally { 
      setBusy(false); 
    }
  }

  const result = job?.result;
  const json = result ? JSON.stringify(result, null, 2) : '';

  function downloadJson() {
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `cloudflare-scraping-results-${Date.now()}.json`; 
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCsv() {
    if (!result || !result.results) return;

    const rows = [
      ['Target URL', 'Status', 'Proxy Assigned', 'Session Reused', 'Turnstile Status', 'Record Summary', 'Duration (s)']
    ];

    result.results.forEach((r) => {
      const proxy = r.proxy_rotation?.assigned_node || 'Direct';
      const session = r.session_management?.session_reused ? 'Reused' : 'Fresh/Created';
      const turnstile = r.cloudflare_handling?.turnstile_status || 'N/A';
      const summary = r.records?.length > 0 ? (r.records[0].text || r.records[0].page_title || 'Extracted') : 'No records';
      rows.push([
        r.url,
        r.status,
        proxy,
        session,
        turnstile,
        summary,
        r.duration_seconds ?? ''
      ]);
    });

    const csvContent = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraping-records-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      {/* 1. Header showing Candidate Name and Today's Date clearly at the start */}
      <header className="hero">
        <div className="eyebrow">SCRAPING &amp; AUTOMATION ENGINEER · TECHNICAL EVALUATION</div>
        <h1>Cloudflare Automation &amp; Scalable Scraping</h1>
        
        <div style={{
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: '14px', 
          margin: '14px 0 10px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{fontSize: '15px', color: '#ffffff'}}>
            Candidate: <strong style={{color: '#93c5fd', fontSize: '16px'}}>Sandeep Kaur</strong>
          </div>
          <span style={{color: '#60a5fa'}}>•</span>
          <div style={{fontSize: '15px', color: '#ffffff'}}>
            Date: <strong style={{color: '#34d399', fontSize: '16px'}}>{todayDate || '20 October 2026'}</strong>
          </div>
          <span style={{color: '#60a5fa'}}>•</span>
          <div style={{fontSize: '13.5px', color: '#cbd5e1'}}>
            Role: <strong>Scraping &amp; Automation Engineer (Python)</strong>
          </div>
        </div>

        <p className="sub">
          Playwright Async · Cloudflare &amp; Turnstile Bypass · Residential Proxy Rotation · Session Persistence · Concurrency
        </p>
      </header>

      {/* 2. Interactive Run Section */}
      <section className="panel">
        <h2>1. Configure Live Scraping Run</h2>
        
        {/* Preset Selector */}
        <div style={{marginBottom: '16px'}}>
          <label style={{marginBottom: '8px'}}>Select Live Demo Target:</label>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <button 
              type="button" 
              className={urlsText === PRESETS.cloudflare ? '' : 'secondary'}
              onClick={() => setUrlsText(PRESETS.cloudflare)}
            >
              🛡️ Cloudflare Protected (nowsecure.nl)
            </button>
            <button 
              type="button" 
              className={urlsText === PRESETS.fingerprint ? '' : 'secondary'}
              onClick={() => setUrlsText(PRESETS.fingerprint)}
            >
              🔍 Bot Test &amp; Fingerprint (sannysoft.com)
            </button>
            <button 
              type="button" 
              className={urlsText === PRESETS.quotes ? '' : 'secondary'}
              onClick={() => setUrlsText(PRESETS.quotes)}
            >
              ⚡ Concurrent Batch (quotes.toscrape.com)
            </button>
          </div>
        </div>

        <form onSubmit={runBatch}>
          <label>
            Target URLs
            <span>Enter one target URL per line</span>
          </label>
          <textarea 
            value={urlsText} 
            onChange={e => setUrlsText(e.target.value)} 
            rows="3" 
            required 
          />

          <div className="controls" style={{marginTop: '14px'}}>
            <label>
              Worker Concurrency
              <select value={concurrency} onChange={e => setConcurrency(e.target.value)}>
                <option value="1">1 Worker (Sequential)</option>
                <option value="2">2 Workers (Parallel)</option>
                <option value="3">3 Workers (High Throughput)</option>
              </select>
            </label>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0}}>
                <input 
                  type="checkbox" 
                  checked={proxyRotation} 
                  onChange={e => setProxyRotation(e.target.checked)} 
                />
                <span><strong>Proxy Rotation:</strong> Residential IP Pool Active</span>
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0}}>
                <input 
                  type="checkbox" 
                  checked={sessionEnabled} 
                  onChange={e => setSessionEnabled(e.target.checked)} 
                />
                <span><strong>Session Management:</strong> Persist &amp; Reuse Cookies (<code>storage_state</code>)</span>
              </label>
            </div>

            <button disabled={busy} type="submit" style={{padding: '12px 24px'}}>
              {busy ? 'Automating Browser…' : '▶ Execute Live Batch'}
            </button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
        {job && (
          <div className="jobline">
            <span>Job ID: <code>{job.job_id}</code></span>
            <span>
              Status: <span className={`status-badge ${job.status}`}>{job.status}</span>
            </span>
            <span>Workers: <b>{job.concurrency}</b></span>
            <span>Proxy Rotation: <b>{job.proxy_rotation ? 'Enabled' : 'Disabled'}</b></span>
            <span>Session Management: <b>{job.session_management ? 'Enabled' : 'Disabled'}</b></span>
          </div>
        )}
      </section>

      {/* 3. Results Section with Structured JSON & Highlights */}
      {result && (
        <section className="panel">
          <div className="section-title">
            <h2>2. Extracted Data &amp; Execution Telemetry</h2>
            <div className="btn-group">
              <button className="secondary" onClick={() => setActiveTab('json')}>
                {'{ }'} View JSON
              </button>
              <button className="secondary" onClick={() => setActiveTab('preview')}>
                📋 View Cards
              </button>
              <button className="btn-csv" onClick={downloadCsv}>
                📊 Export CSV
              </button>
              <button onClick={downloadJson}>
                💾 Export JSON
              </button>
            </div>
          </div>

          <div className="stats">
            <div>
              <small>Target URLs</small>
              <strong>{result.requested}</strong>
            </div>
            <div>
              <small>Success Rate</small>
              <strong style={{color: '#15803d'}}>
                {result.summary.success}/{result.requested}
              </strong>
            </div>
            <div>
              <small>Cloudflare Cleared</small>
              <strong style={{color: '#2563eb'}}>
                {result.summary.cloudflare_challenges_handled}
              </strong>
            </div>
            <div>
              <small>Total Records</small>
              <strong style={{color: '#0f172a'}}>
                {result.summary.total_records_extracted}
              </strong>
            </div>
          </div>

          {/* Active Cards or Structured JSON */}
          {activeTab === 'json' ? (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <h3 style={{margin: 0}}>Structured JSON Output:</h3>
                <small style={{color: '#64748b'}}>Clean, typed response with full telemetry</small>
              </div>
              <pre>{json}</pre>
            </div>
          ) : (
            <div className="records-grid">
              {result.results.map((r, i) => (
                <div key={r.url + i} style={{borderTop: '1px solid #e2e8f0', padding: '16px 0'}}>
                  <div className="resulthead">
                    <strong style={{color: '#15803d'}}>{r.status}</strong>
                    <span>{r.duration_seconds}s · Attempts: {r.attempts}</span>
                  </div>
                  
                  <div className="url" style={{fontWeight: 'bold', margin: '6px 0'}}>{r.url}</div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', margin: '10px 0'}}>
                    <div style={{background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px'}}>
                      <strong>🌐 Proxy Node:</strong> {r.proxy_rotation?.assigned_node}
                    </div>
                    <div style={{background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px'}}>
                      <strong>🛡️ Cloudflare Status:</strong> {r.cloudflare_handling?.turnstile_status}
                    </div>
                    <div style={{background: '#faf5ff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px'}}>
                      <strong>🍪 Session:</strong> {r.session_management?.session_reused ? 'Reused Cookies' : 'Fresh Session Saved'}
                    </div>
                  </div>

                  <div style={{marginTop: '10px'}}>
                    {r.records.map((rec, j) => (
                      <div className="record-card" key={j}>
                        {rec.text && <p className="record-quote">“{rec.text}”</p>}
                        {rec.author && <div className="record-author">— {rec.author}</div>}
                        {rec.page_title && <div style={{fontWeight: 600}}>Title: {rec.page_title}</div>}
                        {rec.extracted_text_preview && <p style={{fontSize: '12.5px', color: '#475569'}}>{rec.extracted_text_preview}</p>}
                        {rec.tags && rec.tags.map(t => <span className="tag-badge" key={t}>#{t}</span>)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. On-Screen Technical Explanation for Video Walkthrough */}
      <section className="panel">
        <h2>3. Anti-Bot Handling, Retries &amp; Scalable Architecture</h2>
        <div className="notes">
          <div className="note-item">
            <h3>🛡️ Anti-Bot &amp; Cloudflare Handling</h3>
            <p>
              Bypasses heuristics using Chromium stealth arguments (<code>--disable-blink-features=AutomationControlled</code>), overriding <code>navigator.webdriver</code>, mocking the <code>window.chrome</code> runtime, and handling Cloudflare Turnstile verification with clearance cookie retention.
            </p>
          </div>

          <div className="note-item">
            <h3>🔄 Proxy Rotation &amp; Session Management</h3>
            <p>
              Rotates across residential proxy pools per concurrent worker to distribute IP footprint. Uses Playwright <code>storage_state</code> to persist and reuse authentication cookies (<code>cf_clearance</code>, session IDs) across subsequent tasks.
            </p>
          </div>

          <div className="note-item">
            <h3>⏱️ Exponential Backoff Retries</h3>
            <p>
              Transient timeouts and 429/503 errors trigger bounded retries with exponential backoff plus randomized jitter (<code>2^attempt + random()</code>). Permanent challenge denials stop safely to prevent domain blacklisting.
            </p>
          </div>

          <div className="note-item">
            <h3>📈 Scalable High-Throughput Architecture</h3>
            <p>
              Controls concurrency via <code>asyncio.Semaphore</code> to enforce strict backpressure without crashing memory. Designed to seamlessly plug into distributed worker queues (Celery, Redis, RQ) and database persistence.
            </p>
          </div>
        </div>
      </section>

      <footer>
        Scraping &amp; Automation Engineer Evaluation · Candidate: Sandeep Kaur · Python Playwright, FastAPI &amp; React
      </footer>
    </main>
  );
}
