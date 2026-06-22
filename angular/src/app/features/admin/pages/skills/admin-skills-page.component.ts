import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import {
  AdminCreateUpdatePortfolioSkillRequest,
  AdminPortfolioSkill,
} from '@features/admin/models';
import { AdminSkillsApiService } from '@features/admin/services/admin-skills-api.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';

type NoticeTone = 'success' | 'error';

type SkillEditorFormGroup = FormGroup<{
  name: FormControl<string>;
  category: FormControl<number>;
  displayOrder: FormControl<number>;
  isPrimary: FormControl<boolean>;
  isActive: FormControl<boolean>;
}>;

const SKILL_CATEGORY_VALUES = [1, 2, 3, 4, 5, 6] as const;

function trimmedRequiredValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  return control.value?.trim() ? null : { required: true };
}

@Component({
  selector: 'app-admin-skills-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skills-admin" [attr.data-theme]="theme.theme()">
      <section class="hero surface">
        <div class="hero__copy">
          <span class="badge">{{ copy().storyBadge }}</span>
          <p class="eyebrow">{{ copy().eyebrow }}</p>
          <h2>{{ copy().title }}</h2>
          <p class="summary">{{ copy().summary }}</p>
        </div>

        <div class="hero__metrics" [attr.aria-label]="copy().metricsAriaLabel">
          <article class="metric-card">
            <span>{{ copy().metrics.totalSkills }}</span>
            <strong>{{ formatCount(skills().length) }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.activeSkills }}</span>
            <strong>{{ formatCount(activeSkillsCount()) }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.primarySkills }}</span>
            <strong>{{ formatCount(primarySkillsCount()) }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.categories }}</span>
            <strong>{{ formatCount(categoryCount()) }}</strong>
          </article>
        </div>
      </section>

      @if (notice(); as activeNotice) {
        <section class="notice" [class.notice--error]="activeNotice.tone === 'error'">
          <strong>{{ activeNotice.message }}</strong>
        </section>
      }

      <div class="workspace">
        <section class="surface board">
          <header class="section-head">
            <div>
              <p class="section-head__eyebrow">{{ copy().tableEyebrow }}</p>
              <h3>{{ copy().tableTitle }}</h3>
              <p>{{ copy().tableDescription }}</p>
            </div>

            <div class="section-head__actions">
              <button type="button" class="button button--ghost" (click)="reloadList()">
                {{ copy().refresh }}
              </button>
              <button type="button" class="button button--primary" (click)="openCreateEditor()">
                {{ copy().createSkill }}
              </button>
            </div>
          </header>

          <div class="filters" [attr.aria-label]="copy().filtersAriaLabel">
            <label class="field">
              <span>{{ copy().filters.searchLabel }}</span>
              <input
                type="search"
                [value]="searchText()"
                [placeholder]="copy().filters.searchPlaceholder"
                (input)="searchText.set($any($event.target).value)"
              />
            </label>

            <label class="field">
              <span>{{ copy().filters.categoryLabel }}</span>
              <select [value]="categoryFilter()" (change)="categoryFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allCategories }}</option>
                @for (option of categoryOptions(); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </label>

            <label class="field">
              <span>{{ copy().filters.statusLabel }}</span>
              <select [value]="activeFilter()" (change)="activeFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allStatuses }}</option>
                <option value="true">{{ copy().filters.activeOnly }}</option>
                <option value="false">{{ copy().filters.inactiveOnly }}</option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy().filters.priorityLabel }}</span>
              <select [value]="primaryFilter()" (change)="primaryFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allPriorities }}</option>
                <option value="true">{{ copy().filters.primaryOnly }}</option>
                <option value="false">{{ copy().filters.secondaryOnly }}</option>
              </select>
            </label>
          </div>

          <div class="filters__footer">
            <span>
              {{ filteredSkills().length }}
              {{ filteredSkills().length === 1 ? copy().results.single : copy().results.plural }}
            </span>

            @if (hasActiveFilters()) {
              <button type="button" class="button button--text" (click)="clearFilters()">
                {{ copy().filters.clear }}
              </button>
            }
          </div>

          @if (isListLoading()) {
            <div class="loading-grid" aria-hidden="true">
              @for (item of skeletonItems; track $index) {
                <article class="loading-card"></article>
              }
            </div>
          } @else if (listError()) {
            <div class="state-card">
              <strong>{{ copy().errorTitle }}</strong>
              <p>{{ listError() }}</p>
              <button type="button" class="button button--primary" (click)="reloadList()">
                {{ copy().retry }}
              </button>
            </div>
          } @else if (!skills().length) {
            <div class="state-card">
              <strong>{{ copy().emptyTitle }}</strong>
              <p>{{ copy().emptyDescription }}</p>
            </div>
          } @else if (!filteredSkills().length) {
            <div class="state-card">
              <strong>{{ copy().emptyFilteredTitle }}</strong>
              <p>{{ copy().emptyFilteredDescription }}</p>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{{ copy().columns.name }}</th>
                    <th>{{ copy().columns.category }}</th>
                    <th>{{ copy().columns.priority }}</th>
                    <th>{{ copy().columns.status }}</th>
                    <th>{{ copy().columns.order }}</th>
                    <th>{{ copy().columns.actions }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (skill of filteredSkills(); track skill.id) {
                    <tr [class.is-selected]="selectedSkillId() === skill.id">
                      <td class="cell cell--title">
                        <button type="button" class="item-link" (click)="openEditEditor(skill.id)">
                          <span>{{ skill.name }}</span>
                          <small>{{ skill.id }}</small>
                        </button>
                      </td>
                      <td class="cell">{{ skill.categoryLabel }}</td>
                      <td class="cell">
                        <span class="status-chip" [class.status-chip--primary]="skill.isPrimary">
                          {{ skill.isPrimary ? copy().status.primary : copy().status.secondary }}
                        </span>
                      </td>
                      <td class="cell">
                        <span class="status-chip" [class.status-chip--success]="skill.isActive">
                          {{ skill.isActive ? copy().status.active : copy().status.inactive }}
                        </span>
                      </td>
                      <td class="cell">{{ skill.displayOrder }}</td>
                      <td class="cell">
                        <div class="row-actions">
                          <button type="button" class="button button--text" (click)="openEditEditor(skill.id)">
                            {{ copy().actions.edit }}
                          </button>
                          <button
                            type="button"
                            class="button button--text"
                            [disabled]="busyActionId() === skill.id"
                            (click)="toggleSkillStatus(skill)"
                          >
                            {{ skill.isActive ? copy().actions.deactivate : copy().actions.activate }}
                          </button>
                          <button
                            type="button"
                            class="button button--text"
                            [disabled]="busyActionId() === skill.id"
                            (click)="toggleSkillPriority(skill)"
                          >
                            {{ skill.isPrimary ? copy().actions.demote : copy().actions.promote }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="item-cards">
              @for (skill of filteredSkills(); track skill.id) {
                <article class="item-card" [class.is-selected]="selectedSkillId() === skill.id">
                  <div class="item-card__head">
                    <div>
                      <strong>{{ skill.name }}</strong>
                      <span>{{ skill.categoryLabel }}</span>
                    </div>
                    <span class="order-pill">#{{ skill.displayOrder }}</span>
                  </div>

                  <div class="status-stack">
                    <span class="status-chip" [class.status-chip--primary]="skill.isPrimary">
                      {{ skill.isPrimary ? copy().status.primary : copy().status.secondary }}
                    </span>
                    <span class="status-chip" [class.status-chip--success]="skill.isActive">
                      {{ skill.isActive ? copy().status.active : copy().status.inactive }}
                    </span>
                  </div>

                  <div class="row-actions">
                    <button type="button" class="button button--text" (click)="openEditEditor(skill.id)">
                      {{ copy().actions.edit }}
                    </button>
                    <button
                      type="button"
                      class="button button--text"
                      [disabled]="busyActionId() === skill.id"
                      (click)="toggleSkillStatus(skill)"
                    >
                      {{ skill.isActive ? copy().actions.deactivate : copy().actions.activate }}
                    </button>
                    <button
                      type="button"
                      class="button button--text"
                      [disabled]="busyActionId() === skill.id"
                      (click)="toggleSkillPriority(skill)"
                    >
                      {{ skill.isPrimary ? copy().actions.demote : copy().actions.promote }}
                    </button>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <section class="surface editor">
          @if (!editorMode()) {
            <div class="editor-empty">
              <span class="badge">{{ copy().editor.emptyBadge }}</span>
              <h3>{{ copy().editor.emptyTitle }}</h3>
              <p>{{ copy().editor.emptyDescription }}</p>
              <button type="button" class="button button--primary" (click)="openCreateEditor()">
                {{ copy().createSkill }}
              </button>
            </div>
          } @else {
            <header class="section-head section-head--editor">
              <div>
                <p class="section-head__eyebrow">
                  {{ isCreateMode() ? copy().editor.createEyebrow : copy().editor.editEyebrow }}
                </p>
                <h3>{{ isCreateMode() ? copy().editor.createTitle : copy().editor.editTitle }}</h3>
                <p>
                  {{ isCreateMode() ? copy().editor.createDescription : copy().editor.editDescription }}
                </p>
              </div>

              <button type="button" class="button button--ghost" (click)="closeEditor()">
                {{ copy().editor.close }}
              </button>
            </header>

            @if (isDetailsLoading()) {
              <div class="editor-loading">
                <div class="loading-card loading-card--tall"></div>
              </div>
            } @else if (editorError()) {
              <div class="state-card">
                <strong>{{ copy().editor.errorTitle }}</strong>
                <p>{{ editorError() }}</p>
                @if (!isCreateMode()) {
                  <button type="button" class="button button--primary" (click)="reloadSelectedSkill()">
                    {{ copy().retry }}
                  </button>
                }
              </div>
            } @else {
              <form class="editor-form" [formGroup]="form" (ngSubmit)="saveSkill()">
                <section class="form-section">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.basics }}</h4>
                    <p>{{ copy().editor.sections.basicsHint }}</p>
                  </div>

                  <div class="form-grid">
                    <label class="field">
                      <span>{{ copy().editor.fields.name }}</span>
                      <input type="text" formControlName="name" [placeholder]="copy().editor.placeholders.name" />
                      @if (shouldShowError(form.controls.name)) {
                        <small>{{ validationMessage(form.controls.name) }}</small>
                      }
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.category }}</span>
                      <select formControlName="category">
                        @for (option of categoryOptions(); track option.value) {
                          <option [value]="option.value">{{ option.label }}</option>
                        }
                      </select>
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.displayOrder }}</span>
                      <input type="number" min="0" formControlName="displayOrder" />
                    </label>
                  </div>
                </section>

                <section class="form-section">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.visibility }}</h4>
                    <p>{{ copy().editor.sections.visibilityHint }}</p>
                  </div>

                  <div class="toggle-grid">
                    <label class="toggle-card">
                      <input type="checkbox" formControlName="isPrimary" />
                      <div>
                        <strong>{{ copy().editor.fields.isPrimary }}</strong>
                        <p>{{ copy().editor.hints.isPrimary }}</p>
                      </div>
                    </label>

                    <label class="toggle-card">
                      <input type="checkbox" formControlName="isActive" />
                      <div>
                        <strong>{{ copy().editor.fields.isActive }}</strong>
                        <p>{{ copy().editor.hints.isActive }}</p>
                      </div>
                    </label>
                  </div>
                </section>

                @if (saveError()) {
                  <div class="inline-state inline-state--error">
                    <strong>{{ saveError() }}</strong>
                  </div>
                }

                <div class="editor-actions">
                  @if (!isCreateMode()) {
                    <button type="button" class="button button--danger" (click)="requestDeleteConfirmation()">
                      {{ copy().editor.actions.delete }}
                    </button>
                  }

                  <button type="submit" class="button button--primary" [disabled]="isSaving()">
                    {{
                      isSaving()
                        ? (isCreateMode() ? copy().editor.actions.creating : copy().editor.actions.saving)
                        : (isCreateMode() ? copy().editor.actions.create : copy().editor.actions.save)
                    }}
                  </button>
                </div>

                @if (showDeleteConfirmation()) {
                  <section class="danger-zone">
                    <strong>{{ copy().deleteConfirmation.title }}</strong>
                    <p>{{ copy().deleteConfirmation.description }}</p>
                    <div class="danger-zone__actions">
                      <button type="button" class="button button--ghost" (click)="cancelDeleteConfirmation()">
                        {{ copy().deleteConfirmation.cancel }}
                      </button>
                      <button
                        type="button"
                        class="button button--danger"
                        [disabled]="isDeleting()"
                        (click)="deleteSelectedSkill()"
                      >
                        {{
                          isDeleting()
                            ? copy().deleteConfirmation.deleting
                            : copy().deleteConfirmation.confirm
                        }}
                      </button>
                    </div>
                  </section>
                }
              </form>
            }
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .skills-admin {
        display: grid;
        gap: 1rem;
        color: var(--admin-text);
      }

      .surface,
      .notice,
      .state-card,
      .inline-state,
      .item-card,
      .metric-card,
      .toggle-card,
      .danger-zone {
        border: 1px solid var(--admin-border);
        box-shadow: var(--admin-shadow);
      }

      .surface,
      .notice {
        position: relative;
        overflow: hidden;
        border-radius: 1.8rem;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--admin-panel-soft) 92%, transparent),
          color-mix(in srgb, var(--admin-panel) 90%, transparent)
        );
        backdrop-filter: blur(16px);
      }

      .surface {
        padding: clamp(1.2rem, 3vw, 1.8rem);
      }

      .hero,
      .workspace,
      .hero__copy,
      .hero__metrics,
      .metric-card,
      .board,
      .editor,
      .section-head,
      .filters,
      .field,
      .row-actions,
      .item-cards,
      .item-card,
      .item-card__head,
      .status-stack,
      .editor-empty,
      .editor-form,
      .form-section,
      .form-section__head,
      .toggle-grid,
      .toggle-card,
      .editor-actions,
      .danger-zone,
      .danger-zone__actions,
      .loading-grid,
      .state-card,
      .inline-state {
        display: grid;
        gap: 1rem;
      }

      .hero {
        grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
        align-items: start;
      }

      .hero__metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .badge,
      .eyebrow,
      .section-head__eyebrow {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .badge {
        padding: 0.5rem 0.8rem;
        background: color-mix(in srgb, var(--admin-primary) 16%, transparent);
        color: var(--admin-primary);
      }

      .eyebrow,
      .section-head__eyebrow {
        margin: 0;
        color: var(--admin-accent);
      }

      h2,
      h3,
      h4,
      p,
      strong,
      span,
      small,
      table {
        margin: 0;
      }

      h2,
      h3,
      h4,
      strong {
        color: var(--admin-text);
        text-wrap: balance;
      }

      p,
      span,
      small,
      td,
      th,
      label {
        color: var(--admin-muted);
        line-height: 1.65;
      }

      h2 {
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1.02;
      }

      .summary {
        max-width: 56rem;
        font-size: 1rem;
      }

      .metric-card {
        padding: 1rem;
        border-radius: 1.3rem;
        background: color-mix(in srgb, var(--admin-panel) 84%, transparent);
      }

      .metric-card span {
        font-size: 0.84rem;
      }

      .metric-card strong {
        font-size: clamp(1.3rem, 3vw, 2rem);
      }

      .notice,
      .state-card,
      .inline-state {
        padding: 1rem 1.1rem;
      }

      .notice {
        background: color-mix(in srgb, #4aa972 14%, var(--admin-panel));
      }

      .notice--error,
      .inline-state--error {
        background: color-mix(in srgb, #d45555 14%, var(--admin-panel));
      }

      .workspace {
        grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
        align-items: start;
      }

      .section-head {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .section-head__actions,
      .row-actions,
      .status-stack,
      .editor-actions,
      .danger-zone__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .filters {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .filters__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-block-end: 0.35rem;
      }

      .field {
        gap: 0.45rem;
      }

      .field span {
        font-size: 0.86rem;
        font-weight: 700;
      }

      .field input,
      .field select {
        min-height: 3rem;
        border: 1px solid var(--admin-border);
        border-radius: 1rem;
        padding: 0.8rem 0.95rem;
        background: color-mix(in srgb, var(--admin-panel) 80%, transparent);
        color: var(--admin-text);
      }

      .field small {
        color: #d45555;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.85rem;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 0.7rem 1rem;
        cursor: pointer;
        text-decoration: none;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          color 180ms ease,
          opacity 180ms ease;
      }

      .button:hover,
      .button:focus-visible {
        transform: translateY(-1px);
      }

      .button:disabled {
        cursor: wait;
        opacity: 0.62;
        transform: none;
      }

      .button--primary {
        background: linear-gradient(135deg, var(--admin-primary), var(--admin-accent));
        color: var(--admin-primary-contrast);
      }

      .button--ghost {
        border-color: var(--admin-border);
        background: transparent;
        color: var(--admin-text);
      }

      .button--text {
        background: transparent;
        color: var(--admin-primary);
        padding-inline: 0;
        min-height: auto;
      }

      .button--danger {
        background: color-mix(in srgb, #d45555 88%, #7b1b1b);
        color: #fff;
      }

      .table-wrap {
        overflow: auto;
        border: 1px solid var(--admin-border);
        border-radius: 1.3rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }

      th,
      td {
        padding: 1rem;
        border-block-end: 1px solid color-mix(in srgb, var(--admin-border) 70%, transparent);
        text-align: start;
        vertical-align: top;
      }

      tbody tr.is-selected {
        background: color-mix(in srgb, var(--admin-primary) 9%, transparent);
      }

      .cell--title {
        min-width: 16rem;
      }

      .item-link {
        display: grid;
        gap: 0.2rem;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        text-align: start;
        cursor: pointer;
      }

      .item-link span {
        color: var(--admin-text);
        font-weight: 800;
      }

      .status-chip,
      .order-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        border-radius: 999px;
        padding: 0.42rem 0.72rem;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .status-chip {
        border: 1px solid var(--admin-border);
        background: color-mix(in srgb, var(--admin-panel) 82%, transparent);
        color: var(--admin-text);
      }

      .status-chip--success {
        background: color-mix(in srgb, #4aa972 16%, transparent);
        color: #4aa972;
      }

      .status-chip--primary {
        background: color-mix(in srgb, var(--admin-primary) 16%, transparent);
        color: var(--admin-primary);
      }

      .item-cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .item-card {
        padding: 1rem;
        border-radius: 1.4rem;
        background: color-mix(in srgb, var(--admin-panel) 84%, transparent);
      }

      .item-card.is-selected {
        background: color-mix(in srgb, var(--admin-primary) 10%, var(--admin-panel));
      }

      .item-card__head {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .item-card__head strong {
        display: block;
      }

      .item-card__head span {
        font-size: 0.92rem;
      }

      .order-pill {
        background: color-mix(in srgb, var(--admin-accent) 20%, transparent);
        color: var(--admin-text);
      }

      .editor-empty,
      .state-card,
      .inline-state {
        place-items: start;
      }

      .editor-empty {
        min-height: 26rem;
        align-content: center;
      }

      .editor-form {
        gap: 1.25rem;
      }

      .form-section {
        padding: 1rem;
        border: 1px solid var(--admin-border);
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--admin-panel) 80%, transparent);
      }

      .form-grid,
      .toggle-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .toggle-card {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
        padding: 1rem;
        border-radius: 1.2rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 82%, transparent);
      }

      .toggle-card input {
        margin-block-start: 0.2rem;
      }

      .danger-zone {
        padding: 1rem;
        border-radius: 1.2rem;
        background: color-mix(in srgb, #d45555 10%, var(--admin-panel));
      }

      .loading-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .loading-card {
        min-height: 9rem;
        border-radius: 1.3rem;
        background:
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--admin-panel-soft) 80%, transparent) 0%,
            color-mix(in srgb, #fff 28%, var(--admin-panel-soft)) 50%,
            color-mix(in srgb, var(--admin-panel-soft) 80%, transparent) 100%
          );
        background-size: 220% 100%;
        animation: loading-sheen 1.3s linear infinite;
      }

      .loading-card--tall {
        min-height: 24rem;
      }

      @keyframes loading-sheen {
        to {
          background-position: -220% 0;
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .surface,
        .notice {
          animation: surface-rise 420ms ease both;
        }

        .metric-card,
        .item-card,
        .form-section,
        .toggle-card {
          animation: card-rise 520ms ease both;
        }

        @keyframes surface-rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes card-rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      @media (max-width: 1220px) {
        .workspace,
        .hero {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 920px) {
        .filters,
        .form-grid,
        .toggle-grid,
        .item-cards {
          grid-template-columns: 1fr;
        }

        .section-head {
          grid-template-columns: 1fr;
        }

        .hero__metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .table-wrap {
          display: none;
        }

        .item-cards {
          display: grid;
        }

        .hero__metrics {
          grid-template-columns: 1fr;
        }

        .filters__footer,
        .section-head__actions,
        .row-actions,
        .editor-actions,
        .danger-zone__actions {
          flex-direction: column;
          align-items: stretch;
        }
      }

      @media (min-width: 721px) {
        .item-cards {
          display: none;
        }
      }
    `,
  ],
})
export class AdminSkillsPageComponent {
  private readonly api = inject(AdminSkillsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminSkillsPage'));

  readonly skeletonItems = Array.from({ length: 4 });
  readonly searchText = signal('');
  readonly categoryFilter = signal('all');
  readonly activeFilter = signal('all');
  readonly primaryFilter = signal('all');
  readonly editorMode = signal<'create' | 'edit' | null>(null);
  readonly selectedSkillId = signal<string | null>(null);
  readonly skills = signal<AdminPortfolioSkill[]>([]);
  readonly isListLoading = signal(true);
  readonly isDetailsLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly listError = signal<string | null>(null);
  readonly editorError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly busyActionId = signal<string | null>(null);
  readonly showDeleteConfirmation = signal(false);
  readonly notice = signal<{ tone: NoticeTone; message: string } | null>(null);
  readonly submitAttempted = signal(false);

  readonly form: SkillEditorFormGroup = this.createForm();

  readonly categoryOptions = computed(() =>
    SKILL_CATEGORY_VALUES.map(value => ({
      value,
      label: this.getCategoryLabel(value),
    })),
  );

  readonly filteredSkills = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    const category = this.parseNumberFilter(this.categoryFilter());
    const isActive = this.parseBooleanFilter(this.activeFilter());
    const isPrimary = this.parseBooleanFilter(this.primaryFilter());

    return this.skills().filter(skill => {
      if (term) {
        const haystack = `${skill.name} ${skill.categoryLabel}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      if (category != null && skill.category !== category) {
        return false;
      }

      if (isActive != null && skill.isActive !== isActive) {
        return false;
      }

      if (isPrimary != null && skill.isPrimary !== isPrimary) {
        return false;
      }

      return true;
    });
  });

  readonly activeSkillsCount = computed(() => this.skills().filter(skill => skill.isActive).length);
  readonly primarySkillsCount = computed(() => this.skills().filter(skill => skill.isPrimary).length);
  readonly categoryCount = computed(() => new Set(this.skills().map(skill => skill.category)).size);
  readonly hasActiveFilters = computed(
    () =>
      !!this.searchText().trim() ||
      this.categoryFilter() !== 'all' ||
      this.activeFilter() !== 'all' ||
      this.primaryFilter() !== 'all',
  );
  readonly isCreateMode = computed(() => this.editorMode() === 'create');

  constructor() {
    this.loadList();
  }

  reloadList(): void {
    this.loadList();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.categoryFilter.set('all');
    this.activeFilter.set('all');
    this.primaryFilter.set('all');
  }

  openCreateEditor(): void {
    this.editorMode.set('create');
    this.selectedSkillId.set(null);
    this.editorError.set(null);
    this.saveError.set(null);
    this.notice.set(null);
    this.showDeleteConfirmation.set(false);
    this.submitAttempted.set(false);
    this.form.reset({
      name: '',
      category: SKILL_CATEGORY_VALUES[0],
      displayOrder: this.getDefaultDisplayOrder(),
      isPrimary: false,
      isActive: true,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  openEditEditor(skillId: string): void {
    this.editorMode.set('edit');
    this.selectedSkillId.set(skillId);
    this.editorError.set(null);
    this.saveError.set(null);
    this.notice.set(null);
    this.showDeleteConfirmation.set(false);
    this.submitAttempted.set(false);
    this.isDetailsLoading.set(true);

    this.api
      .get(skillId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: skill => {
          this.isDetailsLoading.set(false);
          this.populateForm(skill);
        },
        error: error => {
          this.isDetailsLoading.set(false);
          this.editorError.set(this.extractErrorMessage(error, this.copy().editor.errorDescription));
        },
      });
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.selectedSkillId.set(null);
    this.editorError.set(null);
    this.saveError.set(null);
    this.showDeleteConfirmation.set(false);
    this.submitAttempted.set(false);
  }

  reloadSelectedSkill(): void {
    const selectedSkillId = this.selectedSkillId();

    if (selectedSkillId) {
      this.openEditEditor(selectedSkillId);
    }
  }

  requestDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(true);
  }

  cancelDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(false);
  }

  saveSkill(): void {
    this.submitAttempted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    const selectedSkillId = this.selectedSkillId();
    const mode = this.editorMode();

    if (!mode) {
      return;
    }

    this.isSaving.set(true);

    const operation =
      mode === 'create'
        ? this.api.create(request)
        : this.api.update(selectedSkillId ?? '', request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: skill => {
        this.isSaving.set(false);
        this.editorMode.set('edit');
        this.selectedSkillId.set(skill.id);
        this.populateForm(skill);
        this.showDeleteConfirmation.set(false);
        this.notice.set({
          tone: 'success',
          message: mode === 'create' ? this.copy().messages.createSuccess : this.copy().messages.updateSuccess,
        });
        this.loadList(skill.id);
      },
      error: error => {
        this.isSaving.set(false);
        this.saveError.set(this.extractErrorMessage(error, this.copy().messages.saveError));
      },
    });
  }

  deleteSelectedSkill(): void {
    const selectedSkillId = this.selectedSkillId();

    if (!selectedSkillId) {
      return;
    }

    this.isDeleting.set(true);

    this.api
      .delete(selectedSkillId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.notice.set({
            tone: 'success',
            message: this.copy().messages.deleteSuccess,
          });
          this.closeEditor();
          this.loadList();
        },
        error: error => {
          this.isDeleting.set(false);
          this.saveError.set(this.extractErrorMessage(error, this.copy().messages.deleteError));
        },
      });
  }

  toggleSkillStatus(skill: AdminPortfolioSkill): void {
    this.quickUpdate(skill, {
      ...this.buildRequestFromSkill(skill),
      isActive: !skill.isActive,
    });
  }

  toggleSkillPriority(skill: AdminPortfolioSkill): void {
    this.quickUpdate(skill, {
      ...this.buildRequestFromSkill(skill),
      isPrimary: !skill.isPrimary,
    });
  }

  shouldShowError(control: AbstractControl<unknown> | null): boolean {
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  validationMessage(control: AbstractControl<unknown> | null): string {
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return this.copy().validation.required;
    }

    return this.copy().validation.invalid;
  }

  formatCount(value: number): string {
    return String(value).padStart(2, '0');
  }

  private createForm(): SkillEditorFormGroup {
    return new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      category: new FormControl<number>(SKILL_CATEGORY_VALUES[0], { nonNullable: true }),
      displayOrder: new FormControl(0, { nonNullable: true }),
      isPrimary: new FormControl(false, { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
    });
  }

  private loadList(preferredSkillId?: string): void {
    this.isListLoading.set(true);
    this.listError.set(null);

    this.api
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: skills => {
          this.isListLoading.set(false);
          this.skills.set(skills);

          if (preferredSkillId && this.selectedSkillId() === preferredSkillId) {
            const refreshed = skills.find(skill => skill.id === preferredSkillId);
            if (refreshed && this.editorMode() === 'edit' && !this.isDetailsLoading()) {
              this.populateForm(refreshed);
            }
          }
        },
        error: error => {
          this.isListLoading.set(false);
          this.listError.set(this.extractErrorMessage(error, this.copy().errorDescription));
        },
      });
  }

  private populateForm(skill: AdminPortfolioSkill): void {
    this.form.reset({
      name: skill.name,
      category: skill.category,
      displayOrder: skill.displayOrder,
      isPrimary: skill.isPrimary,
      isActive: skill.isActive,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitAttempted.set(false);
  }

  private buildRequest(): AdminCreateUpdatePortfolioSkillRequest {
    return {
      name: this.form.controls.name.value.trim(),
      category: this.form.controls.category.value,
      displayOrder: this.form.controls.displayOrder.value,
      isPrimary: this.form.controls.isPrimary.value,
      isActive: this.form.controls.isActive.value,
    };
  }

  private buildRequestFromSkill(skill: AdminPortfolioSkill): AdminCreateUpdatePortfolioSkillRequest {
    return {
      name: skill.name,
      category: skill.category,
      displayOrder: skill.displayOrder,
      isPrimary: skill.isPrimary,
      isActive: skill.isActive,
    };
  }

  private quickUpdate(skill: AdminPortfolioSkill, request: AdminCreateUpdatePortfolioSkillRequest): void {
    this.busyActionId.set(skill.id);

    this.api
      .update(skill.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updatedSkill => {
          this.busyActionId.set(null);
          this.notice.set({
            tone: 'success',
            message: this.copy().messages.quickUpdateSuccess,
          });
          if (this.selectedSkillId() === updatedSkill.id && this.editorMode() === 'edit') {
            this.populateForm(updatedSkill);
          }
          this.loadList(updatedSkill.id);
        },
        error: error => {
          this.busyActionId.set(null);
          this.notice.set({
            tone: 'error',
            message: this.extractErrorMessage(error, this.copy().messages.quickUpdateError),
          });
        },
      });
  }

  private getDefaultDisplayOrder(): number {
    const displayOrders = this.skills().map(skill => skill.displayOrder);
    return displayOrders.length ? Math.max(...displayOrders) + 1 : 0;
  }

  private getCategoryLabel(value: number): string {
    switch (value) {
      case 1:
        return this.copy().options.categories.backendApis;
      case 2:
        return this.copy().options.categories.frontend;
      case 3:
        return this.copy().options.categories.database;
      case 4:
        return this.copy().options.categories.architecture;
      case 5:
        return this.copy().options.categories.tools;
      case 6:
        return this.copy().options.categories.businessAndSoftSkills;
      default:
        return `${value}`;
    }
  }

  private parseBooleanFilter(value: string): boolean | null {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return null;
  }

  private parseNumberFilter(value: string): number | null {
    if (value === 'all') {
      return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private extractErrorMessage(fallback: string): string;
  private extractErrorMessage(error: unknown, fallback: string): string;
  private extractErrorMessage(errorOrFallback: unknown, maybeFallback?: string): string {
    const error = maybeFallback ? errorOrFallback : null;
    const fallback = (maybeFallback ?? errorOrFallback) as string;

    if (!error) {
      return fallback;
    }

    if (error instanceof HttpErrorResponse) {
      const remoteMessage =
        (error.error as { error?: { message?: string }; message?: string } | null)?.error?.message ??
        (error.error as { error?: { message?: string }; message?: string } | null)?.message;

      if (remoteMessage) {
        return remoteMessage;
      }
    }

    if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }

    return fallback;
  }
}
