import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LogoMarkComponent } from '@shared/atoms/logo-mark.component';

@Component({
  selector: 'app-erp-product-window',
  standalone: true,
  imports: [LogoMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="visual" aria-hidden="true">
      <div class="visual-float">

        <!-- main product window -->
        <div class="window">
          <div class="win-top">
            <app-logo-mark size="sm" />
            <span class="win-title">{{ winTitle() }}</span>
            <span class="win-dots">
              <span></span><span></span>
            </span>
            <span class="win-pill">Live</span>
          </div>
          <div class="win-body">
            <!-- sidebar icons -->
            <div class="win-side">
              <div class="s active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div class="s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div class="s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 .02 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              </div>
            </div>

            <!-- main content area -->
            <div class="win-main">
              <div class="win-bar"></div>
              <div class="kpis">
                <div class="kpi kpi--g">
                  <div class="kpi-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <div class="kpi-n"></div>
                  <div class="kpi-l"></div>
                </div>
                <div class="kpi kpi--t">
                  <div class="kpi-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div class="kpi-n"></div>
                  <div class="kpi-l"></div>
                </div>
                <div class="kpi kpi--b">
                  <div class="kpi-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <div class="kpi-n"></div>
                  <div class="kpi-l"></div>
                </div>
              </div>
              <div class="tbl">
                <div class="tbl-h">
                  <span style="width:22%"></span>
                  <span style="width:16%"></span>
                  <span style="width:14%; margin-inline-start:auto"></span>
                </div>
                <div class="tr">
                  <span class="av"></span>
                  <span class="cell" style="width:26%"></span>
                  <span class="cell" style="width:18%"></span>
                  <span class="badge badge--ok">Active</span>
                </div>
                <div class="tr">
                  <span class="av"></span>
                  <span class="cell" style="width:32%"></span>
                  <span class="cell" style="width:14%"></span>
                  <span class="badge badge--pend">Pending</span>
                </div>
                <div class="tr last">
                  <span class="av"></span>
                  <span class="cell" style="width:24%"></span>
                  <span class="cell" style="width:20%"></span>
                  <span class="badge badge--ok">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- floating secure chip -->
        <div class="secure-chip">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <span>{{ secureLabel() }}</span>
        </div>

        <!-- floating architecture card -->
        <div class="arch">
          <span class="node n1">
            <span class="node-icon">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </span>
            <span class="node-lbl">Angular</span>
          </span>
          <span class="arrow">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
          <span class="node n2">
            <span class="node-icon">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </span>
            <span class="node-lbl">.NET API</span>
          </span>
          <span class="arrow">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
          <span class="node n3">
            <span class="node-icon">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </span>
            <span class="node-lbl">SQL Server</span>
          </span>
        </div>

      </div>
    </aside>
  `,
  styles: [`
    .visual {
      position: relative;
      justify-self: center;
      width: 100%;
      max-width: 520px;
    }

    @media (prefers-reduced-motion: no-preference) {
      .visual-float { animation: kz-floaty 7s ease-in-out infinite; }
    }

    /* ── Product window ─────────────────────────────────────────────────────── */
    .window {
      background: #161616;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, .08);
      box-shadow: var(--shadow-xl);
    }

    .win-top {
      height: 46px;
      background: #191919;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      border-bottom: 1px solid #2a2a2a;
    }

    .win-title {
      color: #fff;
      font-size: 12.5px;
      font-weight: 700;
    }

    .win-dots {
      margin-inline-start: auto;
      display: flex;
      gap: 6px;
    }

    .win-dots span {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(255, 255, 255, .16);
    }

    .win-pill {
      height: 18px;
      padding: 0 9px;
      border-radius: 9999px;
      background: var(--lime-bright, #b2e742);
      color: #191919;
      font-size: 10px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
    }

    /* ── Sidebar ─────────────────────────────────────────────────────────────── */
    .win-body {
      display: flex;
      min-height: 280px;
    }

    .win-side {
      width: 58px;
      background: #1a1a1a;
      padding: 14px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .s {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8a8a8a;
      position: relative;
    }

    .s svg { width: 17px; height: 17px; }

    .s.active {
      background: rgba(255, 255, 255, .16);
      color: var(--lime-bright, #b2e742);
    }

    .s.active::before {
      content: "";
      position: absolute;
      inset-inline-start: -14px;
      top: 8px;
      width: 4px;
      height: 14px;
      border-radius: 9999px;
      background: var(--lime-bright, #b2e742);
    }

    /* ── Main area ─────────────────────────────────────────────────────────── */
    .win-main {
      flex: 1;
      background: #f6f7f4;
      padding: 16px;
      min-width: 0;
    }

    .win-bar {
      height: 9px;
      width: 44%;
      background: #d9ddd2;
      border-radius: 4px;
    }

    /* ── KPI cards ──────────────────────────────────────────────────────────── */
    .kpis {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 14px;
    }

    .kpi {
      background: #fff;
      border: 1px solid #e7e9e2;
      border-radius: 9px;
      padding: 11px;
    }

    .kpi-ic {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-ic svg { width: 15px; height: 15px; }

    .kpi-n {
      height: 13px;
      width: 60%;
      border-radius: 4px;
      margin-top: 9px;
      background: #2b2b2b;
    }

    .kpi-l {
      height: 6px;
      width: 85%;
      border-radius: 4px;
      margin-top: 7px;
      background: #cfd3c8;
    }

    .kpi--g .kpi-ic { background: #eef7df; color: var(--dash-green, #537c0f); }
    .kpi--t .kpi-ic { background: rgba(0, 163, 137, .12); color: var(--teal, #00a389); }
    .kpi--b .kpi-ic { background: rgba(11, 132, 181, .12); color: var(--info, #0b84b5); }

    /* ── Table ─────────────────────────────────────────────────────────────── */
    .tbl {
      margin-top: 13px;
      background: #fff;
      border: 1px solid #e7e9e2;
      border-radius: 9px;
      overflow: hidden;
    }

    .tbl-h {
      height: 26px;
      background: #fafbf8;
      border-bottom: 1px solid #eceee7;
      display: flex;
      align-items: center;
      padding: 0 11px;
      gap: 8px;
    }

    .tbl-h span {
      height: 6px;
      border-radius: 3px;
      background: #cfd3c8;
      display: inline-block;
    }

    .tr {
      height: 30px;
      display: flex;
      align-items: center;
      padding: 0 11px;
      gap: 10px;
      border-bottom: 1px solid #f1f2ec;
    }

    .tr.last { border-bottom: 0; }

    .av {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #d4e8a0;
      flex-shrink: 0;
    }

    .cell {
      height: 7px;
      border-radius: 4px;
      background: #e3e6dd;
      display: inline-block;
    }

    .badge {
      margin-inline-start: auto;
      height: 17px;
      padding: 0 9px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }

    .badge--ok   { background: rgba(0, 163, 137, .12); color: var(--teal, #00a389); }
    .badge--pend { background: #fff3e6; color: var(--amber, #ff8400); }

    /* ── Floating secure chip ─────────────────────────────────────────────── */
    .secure-chip {
      position: absolute;
      inset-inline-end: -14px;
      top: 26px;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-full, 9999px);
      box-shadow: var(--shadow-lift);
      padding: 8px 13px 8px 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text, #f4f5f0);
    }

    .secure-chip svg { color: var(--dash-green, #537c0f); flex-shrink: 0; }

    /* ── Floating arch card ───────────────────────────────────────────────── */
    .arch {
      position: absolute;
      inset-inline-start: -22px;
      bottom: -26px;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-lg, 12px);
      box-shadow: var(--shadow-lift);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .node {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text, #f4f5f0);
      white-space: nowrap;
    }

    .node-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .n1 .node-icon { background: rgba(11, 132, 181, .14); color: var(--info, #0b84b5); }
    .n2 .node-icon { background: #eef7df; color: var(--dash-green, #537c0f); }
    .n3 .node-icon { background: rgba(0, 163, 137, .14); color: var(--teal, #00a389); }

    .arrow { color: var(--text-faint, #9a9c95); display: flex; }

    /* ── Mobile adjustments ───────────────────────────────────────────────── */
    @media (max-width: 760px) {
      .arch {
        inset-inline-start: 50%;
        transform: translateX(-50%);
        bottom: -28px;
        padding: 10px 12px;
        gap: 8px;
      }

      :host-context([dir="rtl"]) .arch {
        transform: translateX(50%);
      }

      .node-lbl { display: none; }
      .secure-chip { inset-inline-end: -6px; top: 14px; }
    }

    @media (max-width: 420px) {
      .node-icon { width: 26px; height: 26px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .visual-float { animation: none; }
    }
  `],
})
export class ErpProductWindowComponent {
  readonly winTitle = input('Enterprise ERP');
  readonly secureLabel = input('Role-based access');
}
