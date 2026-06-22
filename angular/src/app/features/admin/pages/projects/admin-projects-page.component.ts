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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import {
  AdminCreateUpdatePortfolioProjectRequest,
  AdminPortfolioProject,
  AdminPortfolioProjectList,
  AdminPortfolioProjectListFilters,
  AdminPortfolioProjectListItem,
} from '@features/admin/models';
import { AdminProjectsApiService } from '@features/admin/services/admin-projects-api.service';
import { getPortfolioCopy } from '@localization/index';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';

type NoticeTone = 'success' | 'error';

type HighlightCardFormGroup = FormGroup<{
  type: FormControl<number>;
  title: FormControl<string>;
  summary: FormControl<string>;
  displayOrder: FormControl<number>;
}>;

type GalleryItemFormGroup = FormGroup<{
  type: FormControl<number>;
  title: FormControl<string>;
  summary: FormControl<string>;
  imageUrl: FormControl<string>;
  displayOrder: FormControl<number>;
}>;

type ProjectEditorFormGroup = FormGroup<{
  title: FormControl<string>;
  slug: FormControl<string>;
  projectType: FormControl<number>;
  displayOrder: FormControl<number>;
  shortSummary: FormControl<string>;
  businessValue: FormControl<string>;
  techStackText: FormControl<string>;
  gitHubUrl: FormControl<string>;
  liveDemoUrl: FormControl<string>;
  isFeatured: FormControl<boolean>;
  isActive: FormControl<boolean>;
  caseStudy: FormGroup<{
    overview: FormControl<string>;
    businessProblem: FormControl<string>;
    solution: FormControl<string>;
    roleSummary: FormControl<string>;
    roleResponsibilitiesText: FormControl<string>;
    keyFeaturesText: FormControl<string>;
    architectureNotesText: FormControl<string>;
    resultsText: FormControl<string>;
    highlightCards: FormArray<HighlightCardFormGroup>;
    galleryItems: FormArray<GalleryItemFormGroup>;
  }>;
}>;

const PROJECT_TYPE_VALUES = [1, 2, 3, 4] as const;
const HIGHLIGHT_TYPE_VALUES = [1, 2, 3, 4, 5] as const;
const GALLERY_TYPE_VALUES = [1, 2] as const;

function trimmedRequiredValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  return control.value?.trim() ? null : { required: true };
}

function multilineRequiredValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  return parseMultilineValue(control.value ?? '').length ? null : { required: true };
}

function optionalUrlValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
}

function parseMultilineValue(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(entry => entry.trim())
    .filter(Boolean);
}

function formatMultilineValue(items: string[] | null | undefined): string {
  return (items ?? []).join('\n');
}

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="projects-admin" [attr.data-theme]="theme.theme()">
      <section class="hero surface">
        <div class="hero__copy">
          <span class="badge">{{ copy().storyBadge }}</span>
          <p class="eyebrow">{{ copy().eyebrow }}</p>
          <h2>{{ copy().title }}</h2>
          <p class="summary">{{ copy().summary }}</p>
        </div>

        <div class="hero__metrics" [attr.aria-label]="copy().metricsAriaLabel">
          <article class="metric-card">
            <span>{{ copy().metrics.totalProjects }}</span>
            <strong>{{ totalProjects() }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.publishedProjects }}</span>
            <strong>{{ publishedProjects() }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.featuredProjects }}</span>
            <strong>{{ featuredProjects() }}</strong>
          </article>
          <article class="metric-card">
            <span>{{ copy().metrics.caseStudiesReady }}</span>
            <strong>{{ caseStudiesReady() }}</strong>
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
                {{ copy().createProject }}
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
              <span>{{ copy().filters.projectTypeLabel }}</span>
              <select [value]="projectTypeFilter()" (change)="projectTypeFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allProjectTypes }}</option>
                @for (option of projectTypeOptions(); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </label>

            <label class="field">
              <span>{{ copy().filters.activeLabel }}</span>
              <select [value]="activeFilter()" (change)="activeFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allPublicationStates }}</option>
                <option value="true">{{ copy().filters.publishedOnly }}</option>
                <option value="false">{{ copy().filters.unpublishedOnly }}</option>
              </select>
            </label>

            <label class="field">
              <span>{{ copy().filters.featuredLabel }}</span>
              <select [value]="featuredFilter()" (change)="featuredFilter.set($any($event.target).value)">
                <option value="all">{{ copy().filters.allFeaturedStates }}</option>
                <option value="true">{{ copy().filters.featuredOnly }}</option>
                <option value="false">{{ copy().filters.nonFeaturedOnly }}</option>
              </select>
            </label>
          </div>

          <div class="filters__footer">
            <span>
              {{ filteredCount() }}
              {{ filteredCount() === 1 ? copy().results.single : copy().results.plural }}
            </span>

            @if (hasActiveFilters()) {
              <button type="button" class="button button--text" (click)="clearFilters()">
                {{ copy().filters.clear }}
              </button>
            }
          </div>

          @if (listError() && projects().length) {
            <div class="inline-state inline-state--warning">
              <strong>{{ copy().warningTitle }}</strong>
              <p>{{ listError() }}</p>
            </div>
          }

          @if (isListLoading() && !projects().length) {
            <div class="loading-grid" aria-hidden="true">
              @for (item of skeletonItems; track $index) {
                <article class="loading-card"></article>
              }
            </div>
          } @else if (listError() && !projects().length) {
            <div class="state-card">
              <strong>{{ copy().errorTitle }}</strong>
              <p>{{ listError() }}</p>
              <button type="button" class="button button--primary" (click)="reloadList()">
                {{ copy().retry }}
              </button>
            </div>
          } @else if (!projects().length) {
            <div class="state-card">
              <strong>{{ copy().emptyTitle }}</strong>
              <p>{{ copy().emptyDescription }}</p>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{{ copy().columns.title }}</th>
                    <th>{{ copy().columns.type }}</th>
                    <th>{{ copy().columns.summary }}</th>
                    <th>{{ copy().columns.techStack }}</th>
                    <th>{{ copy().columns.status }}</th>
                    <th>{{ copy().columns.order }}</th>
                    <th>{{ copy().columns.actions }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (project of projects(); track project.id) {
                    <tr [class.is-selected]="selectedProjectId() === project.id">
                      <td class="cell cell--title">
                        <button type="button" class="project-link" (click)="openEditEditor(project.id)">
                          <span>{{ project.title }}</span>
                          <small>{{ project.slug }}</small>
                        </button>
                      </td>
                      <td class="cell cell--truncate" [title]="project.projectTypeLabel">{{ project.projectTypeLabel }}</td>
                      <td class="cell cell--truncate" [title]="project.shortSummaryPreview">
                        {{ project.shortSummaryPreview }}
                      </td>
                      <td class="cell">
                        <div class="chips">
                          @for (technology of project.techStack; track technology) {
                            <span class="chip">{{ technology }}</span>
                          }
                        </div>
                      </td>
                      <td class="cell">
                        <div class="status-stack">
                          <span class="status-chip" [class.status-chip--success]="project.isActive">
                            {{ project.isActive ? copy().status.published : copy().status.unpublished }}
                          </span>
                          <span class="status-chip" [class.status-chip--featured]="project.isFeatured">
                            {{ project.isFeatured ? copy().status.featured : copy().status.standard }}
                          </span>
                          <span class="status-chip" [class.status-chip--info]="project.hasCaseStudyContent">
                            {{
                              project.hasCaseStudyContent
                                ? copy().status.caseStudyReady
                                : copy().status.caseStudyMissing
                            }}
                          </span>
                        </div>
                      </td>
                      <td class="cell">{{ project.displayOrder }}</td>
                      <td class="cell">
                        <div class="row-actions">
                          <button type="button" class="button button--text" (click)="openEditEditor(project.id)">
                            {{ copy().actions.edit }}
                          </button>
                          <button
                            type="button"
                            class="button button--text"
                            [disabled]="busyProjectActionId() === project.id"
                            (click)="toggleProjectPublication(project)"
                          >
                            {{
                              project.isActive
                                ? copy().actions.unpublish
                                : copy().actions.publish
                            }}
                          </button>
                          <button
                            type="button"
                            class="button button--text"
                            [disabled]="busyProjectActionId() === project.id"
                            (click)="toggleProjectFeatured(project)"
                          >
                            {{
                              project.isFeatured
                                ? copy().actions.unfeature
                                : copy().actions.feature
                            }}
                          </button>
                          @if (project.hasCaseStudyContent) {
                            <a class="button button--text" [routerLink]="project.caseStudyRoute">
                              {{ copy().actions.preview }}
                            </a>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="project-cards">
              @for (project of projects(); track project.id) {
                <article class="project-card" [class.is-selected]="selectedProjectId() === project.id">
                  <div class="project-card__head">
                    <div>
                      <strong>{{ project.title }}</strong>
                      <span>{{ project.projectTypeLabel }}</span>
                    </div>
                    <span class="order-pill">#{{ project.displayOrder }}</span>
                  </div>

                  <p>{{ project.shortSummaryPreview }}</p>

                  <div class="chips">
                    @for (technology of project.techStack; track technology) {
                      <span class="chip">{{ technology }}</span>
                    }
                  </div>

                  <div class="status-stack">
                    <span class="status-chip" [class.status-chip--success]="project.isActive">
                      {{ project.isActive ? copy().status.published : copy().status.unpublished }}
                    </span>
                    <span class="status-chip" [class.status-chip--featured]="project.isFeatured">
                      {{ project.isFeatured ? copy().status.featured : copy().status.standard }}
                    </span>
                  </div>

                  <div class="row-actions">
                    <button type="button" class="button button--text" (click)="openEditEditor(project.id)">
                      {{ copy().actions.edit }}
                    </button>
                    <button
                      type="button"
                      class="button button--text"
                      [disabled]="busyProjectActionId() === project.id"
                      (click)="toggleProjectPublication(project)"
                    >
                      {{ project.isActive ? copy().actions.unpublish : copy().actions.publish }}
                    </button>
                    <button
                      type="button"
                      class="button button--text"
                      [disabled]="busyProjectActionId() === project.id"
                      (click)="toggleProjectFeatured(project)"
                    >
                      {{ project.isFeatured ? copy().actions.unfeature : copy().actions.feature }}
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
                {{ copy().createProject }}
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
                  <button type="button" class="button button--primary" (click)="reloadSelectedProject()">
                    {{ copy().retry }}
                  </button>
                }
              </div>
            } @else {
              <form class="editor-form" [formGroup]="form" (ngSubmit)="saveProject()">
                <section class="form-section">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.basics }}</h4>
                    <p>{{ copy().editor.sections.basicsHint }}</p>
                  </div>

                  <div class="form-grid">
                    <label class="field">
                      <span>{{ copy().editor.fields.title }}</span>
                      <input type="text" formControlName="title" [placeholder]="copy().editor.placeholders.title" />
                      @if (shouldShowError(form.controls.title)) {
                        <small>{{ validationMessage(form.controls.title) }}</small>
                      }
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.slug }}</span>
                      <input type="text" formControlName="slug" [placeholder]="copy().editor.placeholders.slug" />
                      @if (shouldShowError(form.controls.slug)) {
                        <small>{{ validationMessage(form.controls.slug) }}</small>
                      }
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.projectType }}</span>
                      <select formControlName="projectType">
                        @for (option of projectTypeOptions(); track option.value) {
                          <option [ngValue]="option.value">{{ option.label }}</option>
                        }
                      </select>
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.displayOrder }}</span>
                      <input type="number" min="0" formControlName="displayOrder" />
                    </label>
                  </div>

                  <div class="toggle-grid">
                    <label class="toggle-card">
                      <input type="checkbox" formControlName="isActive" />
                      <div>
                        <strong>{{ copy().editor.fields.isActive }}</strong>
                        <span>{{ copy().editor.hints.isActive }}</span>
                      </div>
                    </label>

                    <label class="toggle-card">
                      <input type="checkbox" formControlName="isFeatured" />
                      <div>
                        <strong>{{ copy().editor.fields.isFeatured }}</strong>
                        <span>{{ copy().editor.hints.isFeatured }}</span>
                      </div>
                    </label>
                  </div>

                  <div class="route-preview">
                    <span>{{ copy().editor.fields.caseStudyRoute }}</span>
                    <code>{{ caseStudyRoutePreview() }}</code>
                  </div>
                </section>

                <section class="form-section">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.summary }}</h4>
                    <p>{{ copy().editor.sections.summaryHint }}</p>
                  </div>

                  <label class="field field--full">
                    <span>{{ copy().editor.fields.shortSummary }}</span>
                    <textarea rows="4" formControlName="shortSummary"></textarea>
                    @if (shouldShowError(form.controls.shortSummary)) {
                      <small>{{ validationMessage(form.controls.shortSummary) }}</small>
                    }
                  </label>

                  <label class="field field--full">
                    <span>{{ copy().editor.fields.businessValue }}</span>
                    <textarea rows="4" formControlName="businessValue"></textarea>
                    @if (shouldShowError(form.controls.businessValue)) {
                      <small>{{ validationMessage(form.controls.businessValue) }}</small>
                    }
                  </label>

                  <label class="field field--full">
                    <span>{{ copy().editor.fields.techStack }}</span>
                    <textarea
                      rows="4"
                      formControlName="techStackText"
                      [placeholder]="copy().editor.placeholders.multiline"
                    ></textarea>
                    <small class="field-hint">{{ copy().editor.hints.techStack }}</small>
                    @if (shouldShowError(form.controls.techStackText)) {
                      <small>{{ validationMessage(form.controls.techStackText) }}</small>
                    }
                  </label>
                </section>

                <section class="form-section">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.links }}</h4>
                    <p>{{ copy().editor.sections.linksHint }}</p>
                  </div>

                  <div class="form-grid">
                    <label class="field">
                      <span>{{ copy().editor.fields.gitHubUrl }}</span>
                      <input type="url" formControlName="gitHubUrl" [placeholder]="copy().editor.placeholders.url" />
                      @if (shouldShowError(form.controls.gitHubUrl)) {
                        <small>{{ validationMessage(form.controls.gitHubUrl) }}</small>
                      }
                    </label>

                    <label class="field">
                      <span>{{ copy().editor.fields.liveDemoUrl }}</span>
                      <input type="url" formControlName="liveDemoUrl" [placeholder]="copy().editor.placeholders.url" />
                      @if (shouldShowError(form.controls.liveDemoUrl)) {
                        <small>{{ validationMessage(form.controls.liveDemoUrl) }}</small>
                      }
                    </label>
                  </div>
                </section>

                <section class="form-section" formGroupName="caseStudy">
                  <div class="form-section__head">
                    <h4>{{ copy().editor.sections.caseStudy }}</h4>
                    <p>{{ copy().editor.sections.caseStudyHint }}</p>
                  </div>

                  <div class="form-grid">
                    <label class="field field--full">
                      <span>{{ copy().editor.fields.overview }}</span>
                      <textarea rows="4" formControlName="overview"></textarea>
                      @if (shouldShowError(caseStudyGroup.controls.overview)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.overview) }}</small>
                      }
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.businessProblem }}</span>
                      <textarea rows="4" formControlName="businessProblem"></textarea>
                      @if (shouldShowError(caseStudyGroup.controls.businessProblem)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.businessProblem) }}</small>
                      }
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.solution }}</span>
                      <textarea rows="4" formControlName="solution"></textarea>
                      @if (shouldShowError(caseStudyGroup.controls.solution)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.solution) }}</small>
                      }
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.roleSummary }}</span>
                      <textarea rows="4" formControlName="roleSummary"></textarea>
                      @if (shouldShowError(caseStudyGroup.controls.roleSummary)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.roleSummary) }}</small>
                      }
                    </label>
                  </div>

                  <div class="form-grid form-grid--lists">
                    <label class="field field--full">
                      <span>{{ copy().editor.fields.roleResponsibilities }}</span>
                      <textarea
                        rows="5"
                        formControlName="roleResponsibilitiesText"
                        [placeholder]="copy().editor.placeholders.multiline"
                      ></textarea>
                      <small class="field-hint">{{ copy().editor.hints.multiline }}</small>
                      @if (shouldShowError(caseStudyGroup.controls.roleResponsibilitiesText)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.roleResponsibilitiesText) }}</small>
                      }
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.keyFeatures }}</span>
                      <textarea
                        rows="5"
                        formControlName="keyFeaturesText"
                        [placeholder]="copy().editor.placeholders.multiline"
                      ></textarea>
                      <small class="field-hint">{{ copy().editor.hints.optionalMultiline }}</small>
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.architectureNotes }}</span>
                      <textarea
                        rows="5"
                        formControlName="architectureNotesText"
                        [placeholder]="copy().editor.placeholders.multiline"
                      ></textarea>
                      <small class="field-hint">{{ copy().editor.hints.optionalMultiline }}</small>
                    </label>

                    <label class="field field--full">
                      <span>{{ copy().editor.fields.results }}</span>
                      <textarea
                        rows="5"
                        formControlName="resultsText"
                        [placeholder]="copy().editor.placeholders.multiline"
                      ></textarea>
                      <small class="field-hint">{{ copy().editor.hints.multiline }}</small>
                      @if (shouldShowError(caseStudyGroup.controls.resultsText)) {
                        <small>{{ validationMessage(caseStudyGroup.controls.resultsText) }}</small>
                      }
                    </label>
                  </div>

                  <div class="nested-section">
                    <div class="nested-section__head">
                      <div>
                        <h5>{{ copy().editor.sections.highlights }}</h5>
                        <p>{{ copy().editor.sections.highlightsHint }}</p>
                      </div>
                      <button type="button" class="button button--ghost" (click)="addHighlightCard()">
                        {{ copy().editor.actions.addHighlight }}
                      </button>
                    </div>

                    @if (!highlightCards.controls.length) {
                      <p class="nested-empty">{{ copy().editor.emptyHighlights }}</p>
                    }

                    <div class="nested-grid">
                      @for (group of highlightCards.controls; track $index) {
                        <article class="nested-card" [formGroup]="group">
                          <div class="nested-card__toolbar">
                            <strong>{{ copy().editor.sections.highlightCard }} {{ $index + 1 }}</strong>
                            <button type="button" class="button button--text" (click)="removeHighlightCard($index)">
                              {{ copy().editor.actions.remove }}
                            </button>
                          </div>

                          <div class="form-grid">
                            <label class="field">
                              <span>{{ copy().editor.fields.highlightType }}</span>
                              <select formControlName="type">
                                @for (option of highlightTypeOptions(); track option.value) {
                                  <option [ngValue]="option.value">{{ option.label }}</option>
                                }
                              </select>
                            </label>

                            <label class="field">
                              <span>{{ copy().editor.fields.displayOrder }}</span>
                              <input type="number" min="0" formControlName="displayOrder" />
                            </label>
                          </div>

                          <label class="field field--full">
                            <span>{{ copy().editor.fields.highlightTitle }}</span>
                            <input type="text" formControlName="title" />
                            @if (shouldShowError(group.controls.title)) {
                              <small>{{ validationMessage(group.controls.title) }}</small>
                            }
                          </label>

                          <label class="field field--full">
                            <span>{{ copy().editor.fields.highlightSummary }}</span>
                            <textarea rows="3" formControlName="summary"></textarea>
                            @if (shouldShowError(group.controls.summary)) {
                              <small>{{ validationMessage(group.controls.summary) }}</small>
                            }
                          </label>
                        </article>
                      }
                    </div>
                  </div>

                  <div class="nested-section">
                    <div class="nested-section__head">
                      <div>
                        <h5>{{ copy().editor.sections.gallery }}</h5>
                        <p>{{ copy().editor.sections.galleryHint }}</p>
                      </div>
                      <button type="button" class="button button--ghost" (click)="addGalleryItem()">
                        {{ copy().editor.actions.addGallery }}
                      </button>
                    </div>

                    @if (!galleryItems.controls.length) {
                      <p class="nested-empty">{{ copy().editor.emptyGallery }}</p>
                    }

                    <div class="nested-grid">
                      @for (group of galleryItems.controls; track $index) {
                        <article class="nested-card" [formGroup]="group">
                          <div class="nested-card__toolbar">
                            <strong>{{ copy().editor.sections.galleryItem }} {{ $index + 1 }}</strong>
                            <button type="button" class="button button--text" (click)="removeGalleryItem($index)">
                              {{ copy().editor.actions.remove }}
                            </button>
                          </div>

                          <div class="form-grid">
                            <label class="field">
                              <span>{{ copy().editor.fields.galleryType }}</span>
                              <select formControlName="type">
                                @for (option of galleryTypeOptions(); track option.value) {
                                  <option [ngValue]="option.value">{{ option.label }}</option>
                                }
                              </select>
                            </label>

                            <label class="field">
                              <span>{{ copy().editor.fields.displayOrder }}</span>
                              <input type="number" min="0" formControlName="displayOrder" />
                            </label>
                          </div>

                          <label class="field field--full">
                            <span>{{ copy().editor.fields.galleryTitle }}</span>
                            <input type="text" formControlName="title" />
                            @if (shouldShowError(group.controls.title)) {
                              <small>{{ validationMessage(group.controls.title) }}</small>
                            }
                          </label>

                          <label class="field field--full">
                            <span>{{ copy().editor.fields.gallerySummary }}</span>
                            <textarea rows="3" formControlName="summary"></textarea>
                            @if (shouldShowError(group.controls.summary)) {
                              <small>{{ validationMessage(group.controls.summary) }}</small>
                            }
                          </label>

                          <label class="field field--full">
                            <span>{{ copy().editor.fields.imageUrl }}</span>
                            <input type="url" formControlName="imageUrl" [placeholder]="copy().editor.placeholders.url" />
                            @if (shouldShowError(group.controls.imageUrl)) {
                              <small>{{ validationMessage(group.controls.imageUrl) }}</small>
                            }
                          </label>
                        </article>
                      }
                    </div>
                  </div>
                </section>

                @if (saveError()) {
                  <div class="inline-state inline-state--error">
                    <strong>{{ saveError() }}</strong>
                  </div>
                }

                @if (showDeleteConfirmation()) {
                  <div class="confirm-card">
                    <div>
                      <strong>{{ copy().deleteConfirmation.title }}</strong>
                      <p>{{ copy().deleteConfirmation.description }}</p>
                    </div>
                    <div class="confirm-card__actions">
                      <button type="button" class="button button--ghost" (click)="cancelDeleteConfirmation()">
                        {{ copy().deleteConfirmation.cancel }}
                      </button>
                      <button
                        type="button"
                        class="button button--danger"
                        [disabled]="isDeleting()"
                        (click)="deleteSelectedProject()"
                      >
                        {{ isDeleting() ? copy().deleteConfirmation.deleting : copy().deleteConfirmation.confirm }}
                      </button>
                    </div>
                  </div>
                }

                <footer class="editor-footer">
                  @if (!isCreateMode()) {
                    <button type="button" class="button button--danger-ghost" (click)="requestDeleteConfirmation()">
                      {{ copy().editor.actions.delete }}
                    </button>
                  }

                  <div class="editor-footer__actions">
                    <button type="button" class="button button--ghost" (click)="closeEditor()">
                      {{ copy().editor.close }}
                    </button>
                    <button type="submit" class="button button--primary" [disabled]="isSaving()">
                      {{
                        isSaving()
                          ? (isCreateMode() ? copy().editor.actions.creating : copy().editor.actions.saving)
                          : (isCreateMode() ? copy().editor.actions.create : copy().editor.actions.save)
                      }}
                    </button>
                  </div>
                </footer>
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

      .projects-admin {
        display: grid;
        gap: 1.2rem;
        color: var(--admin-text);
        animation: page-enter 260ms ease;
      }

      .surface {
        border: 1px solid var(--admin-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--admin-panel) 92%, transparent);
        box-shadow: var(--admin-shadow);
        backdrop-filter: blur(16px);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.8fr);
        gap: 1.1rem;
        padding: 1.4rem;
        position: relative;
        overflow: clip;
      }

      .hero::after {
        content: '';
        position: absolute;
        inset-inline-end: -4rem;
        top: -4rem;
        width: 16rem;
        aspect-ratio: 1;
        border-radius: 999px;
        background: color-mix(in srgb, var(--admin-primary) 18%, transparent);
        filter: blur(40px);
        opacity: 0.8;
        pointer-events: none;
      }

      .hero__copy,
      .hero__metrics {
        position: relative;
        z-index: 1;
      }

      .badge,
      .eyebrow,
      .section-head__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        margin: 0;
        color: var(--admin-primary);
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .badge {
        margin-bottom: 0.9rem;
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--admin-primary) 12%, transparent);
      }

      .hero h2,
      .section-head h3,
      .editor-empty h3,
      .form-section h4,
      .nested-section h5 {
        margin: 0;
        color: var(--admin-text);
      }

      .hero h2 {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        max-width: 20ch;
      }

      .summary,
      .section-head p,
      .editor-empty p,
      .form-section__head p,
      .nested-section__head p,
      .nested-empty,
      .route-preview span,
      .field-hint {
        color: var(--admin-muted);
      }

      .summary {
        margin: 0.85rem 0 0;
        max-width: 62ch;
        line-height: 1.7;
      }

      .hero__metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
        align-content: start;
      }

      .metric-card {
        display: grid;
        gap: 0.55rem;
        padding: 1rem;
        border-radius: 1.2rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 84%, transparent);
        border: 1px solid color-mix(in srgb, var(--admin-border) 88%, transparent);
        min-height: 7rem;
      }

      .metric-card span {
        color: var(--admin-muted);
        font-size: 0.84rem;
      }

      .metric-card strong {
        font-size: clamp(1.65rem, 3vw, 2.3rem);
      }

      .notice,
      .inline-state,
      .state-card,
      .confirm-card {
        border-radius: 1.3rem;
        border: 1px solid color-mix(in srgb, var(--admin-primary) 18%, transparent);
        background: color-mix(in srgb, var(--admin-primary) 10%, transparent);
      }

      .notice {
        padding: 0.95rem 1rem;
      }

      .notice--error,
      .inline-state--error,
      .button--danger,
      .button--danger-ghost {
        border-color: rgba(210, 75, 75, 0.36);
      }

      .notice--error,
      .inline-state--error {
        background: rgba(210, 75, 75, 0.12);
      }

      .workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.18fr) minmax(22rem, 0.82fr);
        gap: 1.2rem;
        align-items: start;
      }

      .board,
      .editor {
        padding: 1.2rem;
      }

      .editor {
        position: sticky;
        top: 6.2rem;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .section-head__actions,
      .editor-footer__actions,
      .row-actions,
      .confirm-card__actions {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .filters {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.9rem;
        margin-top: 1.2rem;
      }

      .filters__footer {
        margin-top: 0.85rem;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        color: var(--admin-muted);
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .field span {
        color: var(--admin-text);
        font-weight: 600;
        font-size: 0.95rem;
      }

      .field input,
      .field select,
      .field textarea {
        width: 100%;
        border-radius: 1rem;
        border: 1px solid color-mix(in srgb, var(--admin-border) 94%, transparent);
        background: color-mix(in srgb, var(--admin-panel-soft) 76%, transparent);
        color: var(--admin-text);
        padding: 0.9rem 1rem;
        font: inherit;
        resize: vertical;
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: color-mix(in srgb, var(--admin-primary) 40%, transparent);
        box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--admin-primary) 18%, transparent);
      }

      .field small {
        color: #d24b4b;
      }

      .field--full {
        grid-column: 1 / -1;
      }

      .button {
        appearance: none;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 0.82rem 1.1rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition:
          transform 180ms ease,
          background 180ms ease,
          border-color 180ms ease,
          color 180ms ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .button:disabled {
        opacity: 0.62;
        cursor: wait;
      }

      .button--primary {
        color: var(--admin-primary-contrast);
        background: linear-gradient(135deg, var(--admin-primary), color-mix(in srgb, var(--admin-accent) 72%, var(--admin-primary)));
      }

      .button--ghost,
      .button--text,
      .button--danger-ghost {
        color: var(--admin-text);
        border-color: color-mix(in srgb, var(--admin-border) 94%, transparent);
        background: color-mix(in srgb, var(--admin-panel-soft) 72%, transparent);
      }

      .button--text {
        padding-inline: 0.85rem;
        min-height: 2.5rem;
      }

      .button--danger {
        color: #fff;
        background: linear-gradient(135deg, #cf4b4b, #b73535);
      }

      .button--danger-ghost {
        color: #b73535;
      }

      .table-wrap {
        margin-top: 1rem;
        overflow-x: auto;
        border-radius: 1.2rem;
        border: 1px solid color-mix(in srgb, var(--admin-border) 90%, transparent);
      }

      table {
        width: 100%;
        min-width: 70rem;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 1rem 0.95rem;
        border-bottom: 1px solid color-mix(in srgb, var(--admin-border) 78%, transparent);
        text-align: start;
        vertical-align: top;
      }

      thead th {
        color: var(--admin-muted);
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        background: color-mix(in srgb, var(--admin-panel-soft) 76%, transparent);
      }

      tbody tr {
        transition: background 180ms ease;
      }

      tbody tr:hover,
      tbody tr.is-selected {
        background: color-mix(in srgb, var(--admin-primary) 7%, transparent);
      }

      .cell {
        color: var(--admin-text);
      }

      .cell--title {
        min-width: 15rem;
      }

      .cell--truncate {
        max-width: 16rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .project-link {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        color: inherit;
        display: grid;
        gap: 0.2rem;
        text-align: start;
        cursor: pointer;
        font: inherit;
      }

      .project-link span {
        font-weight: 700;
      }

      .project-link small {
        color: var(--admin-muted);
      }

      .chips,
      .status-stack {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
      }

      .chip,
      .status-chip,
      .order-pill {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        font-size: 0.82rem;
      }

      .chip,
      .order-pill {
        background: color-mix(in srgb, var(--admin-panel-soft) 80%, transparent);
        color: var(--admin-text);
      }

      .status-chip {
        background: color-mix(in srgb, var(--admin-border) 50%, transparent);
        color: var(--admin-text);
      }

      .status-chip--success {
        background: rgba(57, 166, 111, 0.18);
        color: #2a875a;
      }

      .status-chip--featured {
        background: rgba(255, 163, 87, 0.18);
        color: #d16b1d;
      }

      .status-chip--info {
        background: color-mix(in srgb, var(--admin-primary) 14%, transparent);
        color: var(--admin-primary);
      }

      .project-cards {
        display: none;
        margin-top: 1rem;
        gap: 0.9rem;
      }

      .project-card,
      .nested-card,
      .toggle-card,
      .route-preview,
      .editor-empty {
        border-radius: 1.3rem;
        border: 1px solid color-mix(in srgb, var(--admin-border) 90%, transparent);
        background: color-mix(in srgb, var(--admin-panel-soft) 78%, transparent);
      }

      .project-card {
        display: grid;
        gap: 0.9rem;
        padding: 1rem;
      }

      .project-card.is-selected {
        border-color: color-mix(in srgb, var(--admin-primary) 38%, transparent);
      }

      .project-card__head {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .project-card__head strong {
        display: block;
      }

      .project-card__head span,
      .project-card p {
        color: var(--admin-muted);
      }

      .project-card p {
        margin: 0;
        line-height: 1.7;
      }

      .editor-empty {
        display: grid;
        gap: 1rem;
        padding: 1.4rem;
      }

      .editor-form {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .form-section {
        display: grid;
        gap: 1rem;
        padding: 1.1rem;
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 68%, transparent);
        border: 1px solid color-mix(in srgb, var(--admin-border) 82%, transparent);
      }

      .form-section__head {
        display: grid;
        gap: 0.35rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.95rem;
      }

      .form-grid--lists {
        grid-template-columns: 1fr;
      }

      .toggle-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
      }

      .toggle-card {
        display: flex;
        gap: 0.9rem;
        align-items: start;
        padding: 1rem;
      }

      .toggle-card input {
        inline-size: 1.15rem;
        block-size: 1.15rem;
        margin-top: 0.15rem;
      }

      .toggle-card span {
        color: var(--admin-muted);
      }

      .route-preview {
        padding: 0.95rem 1rem;
        display: grid;
        gap: 0.35rem;
      }

      .route-preview code {
        color: var(--admin-primary);
        word-break: break-word;
      }

      .nested-section {
        display: grid;
        gap: 0.85rem;
      }

      .nested-section__head,
      .nested-card__toolbar,
      .editor-footer {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .nested-grid {
        display: grid;
        gap: 0.85rem;
      }

      .nested-card {
        display: grid;
        gap: 0.8rem;
        padding: 1rem;
      }

      .inline-state,
      .state-card,
      .confirm-card {
        padding: 1rem;
      }

      .inline-state--warning {
        margin-top: 1rem;
      }

      .state-card {
        display: grid;
        gap: 0.85rem;
        margin-top: 1rem;
      }

      .state-card p,
      .inline-state p,
      .confirm-card p {
        margin: 0.25rem 0 0;
        color: var(--admin-muted);
      }

      .confirm-card {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .editor-loading {
        margin-top: 1rem;
      }

      .loading-grid {
        margin-top: 1rem;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .loading-card {
        min-height: 10rem;
        border-radius: 1.25rem;
        background:
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--admin-panel-soft) 90%, transparent) 25%,
            color-mix(in srgb, var(--admin-primary) 10%, var(--admin-panel-soft)) 50%,
            color-mix(in srgb, var(--admin-panel-soft) 90%, transparent) 75%
          );
        background-size: 220% 100%;
        animation: shimmer 1.5s linear infinite;
      }

      .loading-card--tall {
        min-height: 28rem;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }

        100% {
          background-position: -200% 0;
        }
      }

      @keyframes page-enter {
        from {
          opacity: 0;
          transform: translateY(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 1240px) {
        .workspace {
          grid-template-columns: 1fr;
        }

        .editor {
          position: static;
        }
      }

      @media (max-width: 1100px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .table-wrap {
          display: none;
        }

        .project-cards {
          display: grid;
        }
      }

      @media (max-width: 760px) {
        .hero,
        .board,
        .editor {
          padding: 1rem;
        }

        .section-head,
        .nested-section__head,
        .nested-card__toolbar,
        .editor-footer,
        .confirm-card {
          flex-direction: column;
        }

        .hero__metrics,
        .filters,
        .form-grid,
        .toggle-grid,
        .loading-grid {
          grid-template-columns: 1fr;
        }

        .filters__footer {
          flex-direction: column;
          align-items: start;
        }

        .section-head__actions,
        .editor-footer__actions,
        .confirm-card__actions {
          width: 100%;
        }

        .section-head__actions .button,
        .editor-footer__actions .button,
        .confirm-card__actions .button {
          flex: 1 1 auto;
        }
      }
    `,
  ],
})
export class AdminProjectsPageComponent {
  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminProjectsPage'));
  readonly skeletonItems = [0, 1, 2, 3];
  readonly searchText = signal('');
  readonly projectTypeFilter = signal('all');
  readonly activeFilter = signal('all');
  readonly featuredFilter = signal('all');
  readonly isListLoading = signal(true);
  readonly isDetailsLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly notice = signal<{ tone: NoticeTone; message: string } | null>(null);
  readonly listError = signal<string | null>(null);
  readonly editorError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly listData = signal<AdminPortfolioProjectList | null>(null);
  readonly selectedProjectId = signal<string | null>(null);
  readonly editorMode = signal<'create' | 'edit' | null>(null);
  readonly showDeleteConfirmation = signal(false);
  readonly busyProjectActionId = signal<string | null>(null);
  readonly submitAttempted = signal(false);
  private readonly api = inject(AdminProjectsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reloadVersion = signal(0);

  readonly form: ProjectEditorFormGroup = this.createForm();

  readonly listQuery = computed(() => ({
    reload: this.reloadVersion(),
    searchText: this.searchText().trim() || null,
    projectType: this.parseNumberFilter(this.projectTypeFilter()),
    isActive: this.parseBooleanFilter(this.activeFilter()),
    isFeatured: this.parseBooleanFilter(this.featuredFilter()),
  }));

  readonly projects = computed(() => this.listData()?.items ?? []);
  readonly filteredCount = computed(() => this.listData()?.totalCount ?? this.projects().length);
  readonly totalProjects = computed(() => this.projects().length);
  readonly publishedProjects = computed(() => this.projects().filter(project => project.isActive).length);
  readonly featuredProjects = computed(() => this.projects().filter(project => project.isFeatured).length);
  readonly caseStudiesReady = computed(() => this.projects().filter(project => project.hasCaseStudyContent).length);
  readonly hasActiveFilters = computed(
    () =>
      !!this.searchText().trim() ||
      this.projectTypeFilter() !== 'all' ||
      this.activeFilter() !== 'all' ||
      this.featuredFilter() !== 'all',
  );
  readonly isCreateMode = computed(() => this.editorMode() === 'create');
  readonly projectTypeOptions = computed(() =>
    PROJECT_TYPE_VALUES.map(value => ({
      value,
      label:
        this.listData()?.availableProjectTypes.find(option => option.value === value)?.label ??
        this.getProjectTypeFallbackLabel(value),
    })),
  );
  readonly highlightTypeOptions = computed(() =>
    HIGHLIGHT_TYPE_VALUES.map(value => ({
      value,
      label: this.getHighlightTypeLabel(value),
    })),
  );
  readonly galleryTypeOptions = computed(() =>
    GALLERY_TYPE_VALUES.map(value => ({
      value,
      label: this.getGalleryTypeLabel(value),
    })),
  );

  get caseStudyGroup(): ProjectEditorFormGroup['controls']['caseStudy'] {
    return this.form.controls.caseStudy;
  }

  get highlightCards(): FormArray<HighlightCardFormGroup> {
    return this.caseStudyGroup.controls.highlightCards;
  }

  get galleryItems(): FormArray<GalleryItemFormGroup> {
    return this.caseStudyGroup.controls.galleryItems;
  }

  constructor() {
    toObservable(this.listQuery)
      .pipe(
        debounceTime(180),
        tap(() => {
          this.isListLoading.set(true);
          this.listError.set(null);
        }),
        switchMap(({ reload: _reload, ...filters }) =>
          this.api.getList(filters as AdminPortfolioProjectListFilters).pipe(
            map(data => ({ data, error: null as string | null })),
            tap(({ data }) => {
              this.listData.set(data);
            }),
            catchError((error: unknown) =>
              of({
                data: null,
                error: this.extractErrorMessage(error, this.copy().errorDescription),
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.isListLoading.set(false);

        if (result.error) {
          this.listError.set(result.error);
        }
      });
  }

  reloadList(): void {
    this.reloadVersion.update(value => value + 1);
  }

  clearFilters(): void {
    this.searchText.set('');
    this.projectTypeFilter.set('all');
    this.activeFilter.set('all');
    this.featuredFilter.set('all');
  }

  openCreateEditor(): void {
    this.editorMode.set('create');
    this.selectedProjectId.set(null);
    this.editorError.set(null);
    this.saveError.set(null);
    this.notice.set(null);
    this.showDeleteConfirmation.set(false);
    this.submitAttempted.set(false);
    this.resetFormForCreate();
  }

  openEditEditor(projectId: string): void {
    this.editorMode.set('edit');
    this.selectedProjectId.set(projectId);
    this.showDeleteConfirmation.set(false);
    this.saveError.set(null);
    this.editorError.set(null);
    this.submitAttempted.set(false);
    this.loadProject(projectId);
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.selectedProjectId.set(null);
    this.editorError.set(null);
    this.saveError.set(null);
    this.showDeleteConfirmation.set(false);
    this.submitAttempted.set(false);
  }

  reloadSelectedProject(): void {
    const selectedProjectId = this.selectedProjectId();

    if (!selectedProjectId) {
      return;
    }

    this.loadProject(selectedProjectId);
  }

  addHighlightCard(): void {
    this.highlightCards.push(
      this.createHighlightCardGroup({
        displayOrder: this.highlightCards.length,
      }),
    );
  }

  removeHighlightCard(index: number): void {
    this.highlightCards.removeAt(index);
  }

  addGalleryItem(): void {
    this.galleryItems.push(
      this.createGalleryItemGroup({
        displayOrder: this.galleryItems.length,
      }),
    );
  }

  removeGalleryItem(index: number): void {
    this.galleryItems.removeAt(index);
  }

  requestDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(true);
  }

  cancelDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(false);
  }

  saveProject(): void {
    this.submitAttempted.set(true);
    this.saveError.set(null);
    this.editorError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    const selectedProjectId = this.selectedProjectId();
    const mode = this.editorMode();

    if (!mode) {
      return;
    }

    this.isSaving.set(true);

    const operation =
      mode === 'create'
        ? this.api.create(request)
        : this.api.update(selectedProjectId ?? '', request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: project => {
        this.isSaving.set(false);
        this.editorMode.set('edit');
        this.selectedProjectId.set(project.id);
        this.populateForm(project);
        this.showDeleteConfirmation.set(false);
        this.notice.set({
          tone: 'success',
          message: mode === 'create' ? this.copy().messages.createSuccess : this.copy().messages.updateSuccess,
        });
        this.reloadList();
      },
      error: error => {
        this.isSaving.set(false);
        this.saveError.set(this.extractErrorMessage(error, this.copy().messages.saveError));
      },
    });
  }

  deleteSelectedProject(): void {
    const selectedProjectId = this.selectedProjectId();

    if (!selectedProjectId) {
      return;
    }

    this.isDeleting.set(true);

    this.api.delete(selectedProjectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.notice.set({
          tone: 'success',
          message: this.copy().messages.deleteSuccess,
        });
        this.closeEditor();
        this.reloadList();
      },
      error: error => {
        this.isDeleting.set(false);
        this.saveError.set(this.extractErrorMessage(error, this.copy().messages.deleteError));
      },
    });
  }

  toggleProjectPublication(project: AdminPortfolioProjectListItem): void {
    this.busyProjectActionId.set(project.id);
    this.api
      .setPublicationStatus(project.id, { isActive: !project.isActive })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updatedProject => {
          this.busyProjectActionId.set(null);
          this.notice.set({
            tone: 'success',
            message: this.copy().messages.publicationUpdated,
          });
          this.refreshEditorIfSelected(updatedProject);
          this.reloadList();
        },
        error: error => {
          this.busyProjectActionId.set(null);
          this.notice.set({
            tone: 'error',
            message: this.extractErrorMessage(error, this.copy().messages.publicationError),
          });
        },
      });
  }

  toggleProjectFeatured(project: AdminPortfolioProjectListItem): void {
    this.busyProjectActionId.set(project.id);
    this.api
      .setFeaturedStatus(project.id, { isFeatured: !project.isFeatured })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updatedProject => {
          this.busyProjectActionId.set(null);
          this.notice.set({
            tone: 'success',
            message: this.copy().messages.featureUpdated,
          });
          this.refreshEditorIfSelected(updatedProject);
          this.reloadList();
        },
        error: error => {
          this.busyProjectActionId.set(null);
          this.notice.set({
            tone: 'error',
            message: this.extractErrorMessage(error, this.copy().messages.featureError),
          });
        },
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

    if (control.errors['url']) {
      return this.copy().validation.url;
    }

    return this.copy().validation.invalid;
  }

  caseStudyRoutePreview(): string {
    const slug = this.form.controls.slug.value.trim();
    return slug ? `/projects/${slug}` : this.copy().editor.placeholders.caseStudyRoute;
  }

  private loadProject(projectId: string): void {
    this.isDetailsLoading.set(true);
    this.editorError.set(null);
    this.saveError.set(null);

    this.api.get(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: project => {
        this.isDetailsLoading.set(false);
        this.populateForm(project);
      },
      error: error => {
        this.isDetailsLoading.set(false);
        this.editorError.set(this.extractErrorMessage(error, this.copy().editor.errorDescription));
      },
    });
  }

  private refreshEditorIfSelected(project: AdminPortfolioProject): void {
    if (this.selectedProjectId() === project.id && this.editorMode() === 'edit') {
      this.populateForm(project);
    }
  }

  private createForm(): ProjectEditorFormGroup {
    return new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      slug: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      projectType: new FormControl<number>(PROJECT_TYPE_VALUES[0], { nonNullable: true }),
      displayOrder: new FormControl(0, { nonNullable: true }),
      shortSummary: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      businessValue: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      techStackText: new FormControl('', { nonNullable: true, validators: [multilineRequiredValidator] }),
      gitHubUrl: new FormControl('', { nonNullable: true, validators: [optionalUrlValidator] }),
      liveDemoUrl: new FormControl('', { nonNullable: true, validators: [optionalUrlValidator] }),
      isFeatured: new FormControl(false, { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
      caseStudy: new FormGroup({
        overview: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
        businessProblem: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
        solution: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
        roleSummary: new FormControl('', { nonNullable: true, validators: [trimmedRequiredValidator] }),
        roleResponsibilitiesText: new FormControl('', {
          nonNullable: true,
          validators: [multilineRequiredValidator],
        }),
        keyFeaturesText: new FormControl('', { nonNullable: true }),
        architectureNotesText: new FormControl('', { nonNullable: true }),
        resultsText: new FormControl('', { nonNullable: true, validators: [multilineRequiredValidator] }),
        highlightCards: new FormArray<HighlightCardFormGroup>([]),
        galleryItems: new FormArray<GalleryItemFormGroup>([]),
      }),
    });
  }

  private createHighlightCardGroup(
    value?: Partial<{ type: number; title: string; summary: string; displayOrder: number }>,
  ): HighlightCardFormGroup {
    return new FormGroup({
      type: new FormControl(value?.type ?? HIGHLIGHT_TYPE_VALUES[0], { nonNullable: true }),
      title: new FormControl(value?.title ?? '', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      summary: new FormControl(value?.summary ?? '', {
        nonNullable: true,
        validators: [trimmedRequiredValidator],
      }),
      displayOrder: new FormControl(value?.displayOrder ?? 0, { nonNullable: true }),
    });
  }

  private createGalleryItemGroup(
    value?: Partial<{ type: number; title: string; summary: string; imageUrl: string; displayOrder: number }>,
  ): GalleryItemFormGroup {
    return new FormGroup({
      type: new FormControl(value?.type ?? GALLERY_TYPE_VALUES[0], { nonNullable: true }),
      title: new FormControl(value?.title ?? '', { nonNullable: true, validators: [trimmedRequiredValidator] }),
      summary: new FormControl(value?.summary ?? '', {
        nonNullable: true,
        validators: [trimmedRequiredValidator],
      }),
      imageUrl: new FormControl(value?.imageUrl ?? '', { nonNullable: true, validators: [optionalUrlValidator] }),
      displayOrder: new FormControl(value?.displayOrder ?? 0, { nonNullable: true }),
    });
  }

  private resetFormForCreate(): void {
    this.highlightCards.clear();
    this.galleryItems.clear();

    this.form.reset({
      title: '',
      slug: '',
      projectType: PROJECT_TYPE_VALUES[0],
      displayOrder: this.getDefaultDisplayOrder(),
      shortSummary: '',
      businessValue: '',
      techStackText: '',
      gitHubUrl: '',
      liveDemoUrl: '',
      isFeatured: false,
      isActive: true,
      caseStudy: {
        overview: '',
        businessProblem: '',
        solution: '',
        roleSummary: '',
        roleResponsibilitiesText: '',
        keyFeaturesText: '',
        architectureNotesText: '',
        resultsText: '',
        highlightCards: [],
        galleryItems: [],
      },
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private populateForm(project: AdminPortfolioProject): void {
    this.highlightCards.clear();
    this.galleryItems.clear();

    for (const highlight of project.caseStudy.highlightCards) {
      this.highlightCards.push(
        this.createHighlightCardGroup({
          type: highlight.type,
          title: highlight.title,
          summary: highlight.summary,
          displayOrder: highlight.displayOrder,
        }),
      );
    }

    for (const galleryItem of project.caseStudy.galleryItems) {
      this.galleryItems.push(
        this.createGalleryItemGroup({
          type: galleryItem.type,
          title: galleryItem.title,
          summary: galleryItem.summary,
          imageUrl: galleryItem.imageUrl ?? '',
          displayOrder: galleryItem.displayOrder,
        }),
      );
    }

    this.form.reset({
      title: project.title,
      slug: project.slug,
      projectType: project.projectType,
      displayOrder: project.displayOrder,
      shortSummary: project.shortSummary,
      businessValue: project.businessValue,
      techStackText: formatMultilineValue(project.techStack),
      gitHubUrl: project.gitHubUrl ?? '',
      liveDemoUrl: project.liveDemoUrl ?? '',
      isFeatured: project.isFeatured,
      isActive: project.isActive,
      caseStudy: {
        overview: project.caseStudy.overview,
        businessProblem: project.caseStudy.businessProblem,
        solution: project.caseStudy.solution,
        roleSummary: project.caseStudy.roleSummary,
        roleResponsibilitiesText: formatMultilineValue(project.caseStudy.roleResponsibilities),
        keyFeaturesText: formatMultilineValue(project.caseStudy.keyFeatures),
        architectureNotesText: formatMultilineValue(project.caseStudy.architectureNotes),
        resultsText: formatMultilineValue(project.caseStudy.results),
        highlightCards: [],
        galleryItems: [],
      },
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitAttempted.set(false);
  }

  private buildRequest(): AdminCreateUpdatePortfolioProjectRequest {
    return {
      title: this.form.controls.title.value.trim(),
      slug: this.form.controls.slug.value.trim(),
      projectType: this.form.controls.projectType.value,
      shortSummary: this.form.controls.shortSummary.value.trim(),
      businessValue: this.form.controls.businessValue.value.trim(),
      techStack: parseMultilineValue(this.form.controls.techStackText.value),
      isFeatured: this.form.controls.isFeatured.value,
      isActive: this.form.controls.isActive.value,
      gitHubUrl: this.normalizeOptionalValue(this.form.controls.gitHubUrl.value),
      liveDemoUrl: this.normalizeOptionalValue(this.form.controls.liveDemoUrl.value),
      displayOrder: this.form.controls.displayOrder.value,
      caseStudy: {
        overview: this.caseStudyGroup.controls.overview.value.trim(),
        businessProblem: this.caseStudyGroup.controls.businessProblem.value.trim(),
        solution: this.caseStudyGroup.controls.solution.value.trim(),
        roleSummary: this.caseStudyGroup.controls.roleSummary.value.trim(),
        roleResponsibilities: parseMultilineValue(this.caseStudyGroup.controls.roleResponsibilitiesText.value),
        keyFeatures: parseMultilineValue(this.caseStudyGroup.controls.keyFeaturesText.value),
        architectureNotes: parseMultilineValue(this.caseStudyGroup.controls.architectureNotesText.value),
        results: parseMultilineValue(this.caseStudyGroup.controls.resultsText.value),
        highlightCards: this.highlightCards.controls.map(control => ({
          type: control.controls.type.value,
          title: control.controls.title.value.trim(),
          summary: control.controls.summary.value.trim(),
          displayOrder: control.controls.displayOrder.value,
        })),
        galleryItems: this.galleryItems.controls.map(control => ({
          type: control.controls.type.value,
          title: control.controls.title.value.trim(),
          summary: control.controls.summary.value.trim(),
          imageUrl: this.normalizeOptionalValue(control.controls.imageUrl.value),
          displayOrder: control.controls.displayOrder.value,
        })),
      },
    };
  }

  private getDefaultDisplayOrder(): number {
    const displayOrders = this.projects().map(project => project.displayOrder);
    return displayOrders.length ? Math.max(...displayOrders) + 1 : 0;
  }

  private getProjectTypeFallbackLabel(value: number): string {
    switch (value) {
      case 1:
        return this.copy().options.projectTypes.erpSystem;
      case 2:
        return this.copy().options.projectTypes.eCommercePlatform;
      case 3:
        return this.copy().options.projectTypes.operationsSystem;
      case 4:
        return this.copy().options.projectTypes.portfolioPlatform;
      default:
        return `${value}`;
    }
  }

  private getHighlightTypeLabel(value: number): string {
    switch (value) {
      case 1:
        return this.copy().options.highlightTypes.frontendBackendIntegration;
      case 2:
        return this.copy().options.highlightTypes.roleBasedSecurity;
      case 3:
        return this.copy().options.highlightTypes.reportingAndData;
      case 4:
        return this.copy().options.highlightTypes.businessWorkflowAutomation;
      case 5:
        return this.copy().options.highlightTypes.abpLayeredArchitecture;
      default:
        return `${value}`;
    }
  }

  private getGalleryTypeLabel(value: number): string {
    switch (value) {
      case 1:
        return this.copy().options.galleryTypes.screenshot;
      case 2:
        return this.copy().options.galleryTypes.placeholder;
      default:
        return `${value}`;
    }
  }

  private parseNumberFilter(value: string): number | null {
    if (value === 'all') {
      return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
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

  private normalizeOptionalValue(value: string): string | null {
    const trimmedValue = value.trim();
    return trimmedValue || null;
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
