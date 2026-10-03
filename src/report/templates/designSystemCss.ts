export const DESIGN_SYSTEM_CSS = `
  :root {
    --orange: #FF6B35;
    --yellow: #FFD23F;
    --purple: #8B5CF6;
    --blue: #3B82F6;
    --green: #10B981;
    --red: #EF4444;
    --dark: #0B0B14;
    --dark2: #141424;
    --dark3: #1F1F38;
    --dark4: #2A2A4A;
    --text: #F0F0FA;
    --muted: #9AA0C0;
    --border: rgba(255,255,255,0.10);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--dark);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .page {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: 48px 32px 80px;
  }

  .header {
    text-align: center;
    margin-bottom: 56px;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,107,53,0.14);
    border: 1px solid rgba(255,107,53,0.35);
    border-radius: 999px;
    padding: 6px 18px;
    font-size: 12px;
    font-weight: 700;
    color: var(--orange);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(255,107,53,0.15);
  }

  .header h1 {
    font-size: clamp(30px, 4.5vw, 48px);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #FF6B35, #FFD23F, #8B5CF6, #3B82F6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-sub {
    font-size: 15px;
    color: var(--muted);
    max-width: 920px;
    margin: 0 auto;
    line-height: 1.7;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #A0A5C8;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .arch-wrapper {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .arch-row {
    display: grid;
    gap: 16px;
  }

  .row-4 { grid-template-columns: repeat(4, 1fr); }
  .row-3 { grid-template-columns: repeat(3, 1fr); }
  .row-2 { grid-template-columns: repeat(2, 1fr); }
  .row-2-1 { grid-template-columns: 2fr 1fr; }
  .row-1-2 { grid-template-columns: 1fr 2fr; }

  .card {
    background: var(--dark2);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.45);
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  .card.orange::before { background: linear-gradient(90deg, var(--orange), var(--yellow)); }
  .card.purple::before { background: linear-gradient(90deg, var(--purple), #60A5FA); }
  .card.green::before  { background: linear-gradient(90deg, var(--green), #34D399); }
  .card.blue::before   { background: linear-gradient(90deg, var(--blue), #818CF8); }
  .card.red::before    { background: linear-gradient(90deg, var(--red), #F97316); }
  .card.yellow::before { background: linear-gradient(90deg, var(--yellow), var(--orange)); }

  .card-icon {
    font-size: 30px;
    margin-bottom: 12px;
    display: block;
  }

  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .card-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.75;
  }

  .card-file {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--orange);
    margin-top: 10px;
    opacity: 0.9;
    word-break: break-all;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .tag {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
  }

  .tag-orange { background: rgba(255,107,53,0.18); color: var(--orange); border: 1px solid rgba(255,107,53,0.3); }
  .tag-purple { background: rgba(139,92,246,0.18); color: var(--purple); border: 1px solid rgba(139,92,246,0.3); }
  .tag-green  { background: rgba(16,185,129,0.18); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
  .tag-blue   { background: rgba(59,130,246,0.18); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }
  .tag-yellow { background: rgba(255,210,63,0.18); color: var(--yellow); border: 1px solid rgba(255,210,63,0.3); }
  .tag-red    { background: rgba(239,68,68,0.18); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }

  .card-wide { grid-column: 1 / -1; }

  .arrow-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
  }

  .arrow-down {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .arrow-down svg { opacity: 0.6; }

  .hub {
    background: linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.18));
    border: 1px solid rgba(139,92,246,0.35);
    border-radius: 22px;
    padding: 26px 30px;
    display: flex;
    align-items: flex-start;
    gap: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(139,92,246,0.12);
  }

  .hub::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--purple), var(--blue), var(--purple));
  }

  .hub-icon {
    font-size: 52px;
    flex-shrink: 0;
  }

  .hub-content {
    flex: 1;
  }

  .hub-title {
    font-size: 19px;
    font-weight: 800;
    color: #FFFFFF;
    margin-bottom: 8px;
  }

  .hub-desc {
    font-size: 12px;
    color: #D0D4F0;
    line-height: 1.8;
  }

  .hub-meta {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hub-pill {
    font-size: 10px;
    font-weight: 700;
    border-radius: 999px;
    padding: 4px 12px;
    border: 1px solid rgba(255,255,255,0.12);
    font-family: 'JetBrains Mono', monospace;
  }

  .state-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .state-item {
    background: rgba(0,0,0,0.25);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px 14px;
  }

  .state-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: var(--yellow);
    margin-bottom: 4px;
  }

  .state-desc {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.5;
  }

  .ext-card {
    background: var(--dark3);
    border: 1px dashed rgba(255,255,255,0.15);
    border-radius: 18px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: transform 0.2s;
  }

  .ext-card:hover {
    transform: translateY(-2px);
  }

  .ext-icon { font-size: 32px; flex-shrink: 0; }
  .ext-title { font-size: 14px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; }
  .ext-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }
  .ext-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 999px;
    margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.5px;
  }

  .badge-free { background: rgba(16,185,129,0.2); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
  .badge-device { background: rgba(59,130,246,0.2); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }
  .badge-local { background: rgba(255,210,63,0.2); color: var(--yellow); border: 1px solid rgba(255,210,63,0.3); }

  .flow-diagram {
    background: linear-gradient(180deg, rgba(20,20,36,0.95), rgba(15,15,28,0.98));
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 26px;
  }

  .flow-steps {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .flow-step {
    flex: 1;
    min-width: 140px;
    text-align: center;
  }

  .flow-bubble {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    font-size: 22px;
    font-weight: 800;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }

  .b-orange { background: rgba(255,107,53,0.25); color: var(--orange); }
  .b-yellow { background: rgba(255,210,63,0.25); color: var(--yellow); }
  .b-purple { background: rgba(139,92,246,0.25); color: var(--purple); }
  .b-blue   { background: rgba(59,130,246,0.25); color: var(--blue); }
  .b-green  { background: rgba(16,185,129,0.25); color: var(--green); }
  .b-red    { background: rgba(239,68,68,0.25); color: var(--red); }

  .flow-step-title {
    font-size: 12px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 4px;
  }

  .flow-step-sub {
    font-size: 10px;
    color: var(--muted);
    line-height: 1.6;
  }

  .flow-arrow {
    align-self: center;
    font-size: 24px;
    color: rgba(255,255,255,0.35);
    padding-top: 8px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 20px;
    margin-top: 24px;
    padding: 20px 24px;
    background: var(--dark2);
    border: 1px solid var(--border);
    border-radius: 18px;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
    font-weight: 600;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .footer {
    margin-top: 48px;
    text-align: center;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.8;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--yellow);
  }

  @media (max-width: 980px) {
    .row-4, .row-3, .row-2, .row-2-1, .row-1-2,
    .arrows-4, .arrows-3, .arrows-2 {
      grid-template-columns: 1fr;
    }

    .flow-steps {
      flex-direction: column;
    }

    .flow-arrow {
      transform: rotate(90deg);
      padding-top: 0;
    }

    .hub {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
