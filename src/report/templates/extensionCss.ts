export const EXTENSION_CSS = `
.toc { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px; margin-bottom: 28px;
  background: rgba(15,15,26,0.92); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: 14px; }
.toc a { font-size: 11px; font-weight: 600; color: var(--muted); text-decoration: none; padding: 4px 10px; border-radius: 999px; }
.toc a:hover { color: var(--text); background: var(--dark3); }
.search { width: 100%; max-width: 420px; background: var(--dark2); border: 1px solid var(--border); border-radius: 999px;
  padding: 8px 16px; color: var(--text); font-family: 'Sora', sans-serif; font-size: 12px; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.stat { background: var(--dark2); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; text-align: center; }
.stat-num { font-size: 26px; font-weight: 800; background: linear-gradient(135deg, var(--orange), var(--yellow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stat-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
table.data { width: 100%; border-collapse: collapse; font-size: 11px; background: var(--dark2); border-radius: 14px; overflow: hidden; }
table.data th { text-align: left; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); padding: 10px 12px; background: var(--dark3); }
table.data td { padding: 9px 12px; border-top: 1px solid var(--border); color: var(--text); vertical-align: top; }
.table-scroll { overflow-x: auto; }
.chip-high { background: rgba(239,68,68,0.15); color: var(--red); }
.chip-med { background: rgba(255,210,63,0.15); color: var(--yellow); }
.chip-low { background: rgba(16,185,129,0.15); color: var(--green); }
.badge-ai { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(139,92,246,0.25); color: var(--purple); margin-left: 6px; }
.badge-conf { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(255,255,255,0.08); color: var(--muted); margin-left: 6px; }
details.section > summary { cursor: pointer; list-style: none; padding: 12px 0; }
.diagram { background: var(--dark2); border: 1px solid var(--border); border-radius: 18px; padding: 16px; overflow-x: auto; margin: 16px 0; }
:root[data-theme="light"] { --dark:#F6F6FB; --dark2:#FFFFFF; --dark3:#ECECF5; --dark4:#E0E0EE; --text:#1A1A2E; --muted:#5A5A78; --border:rgba(0,0,0,0.10); }
@media print { body::before, .toc, .search { display: none; } .card:hover { transform: none; box-shadow: none; } .page { padding: 16px; } }
`;
