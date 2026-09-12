import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

import { LookupService } from '../../../core/api/lookup.service';
import { ProjectService } from '../../../core/api/project.service';
import { Tag } from '../../../core/models/lookup.models';
import {
  PROJECT_TAGS,
  PROJECT_TAG_LABELS,
  Project,
  ProjectDocument,
  ProjectTag,
  ProjectWritePayload,
  SystemRef,
} from '../../../core/models/project.models';
import { formatFileSize, parseDateOnly, toDateOnlyString } from '../../../core/util/date-only';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SystemAutocompleteComponent } from '../../../shared/system-autocomplete/system-autocomplete.component';

export type DetailPanelMode = 'view' | 'edit' | 'create';

/**
 * What the panel is showing. Passed as a single object so that every (re)open from the
 * list produces a fresh identity — a plain `mode` input would be dirty-checked by value
 * and so could be skipped after the panel had switched itself into edit mode.
 */
export interface ProjectPanelState {
  mode: DetailPanelMode;
  project: Project | null;
}

/**
 * Which form controls live on which tab, so the tab header can flag validation problems
 * the user cannot currently see.
 */
const TAB_CONTROLS: string[][] = [
  [
    'projectNumber',
    'name',
    'awardDate',
    'endDate',
    'projectType',
    'system',
    'tags',
    'pipedriveNumber',
    'implementationPrice',
    'maintenancePricePerYear',
    'currencyId',
    'completionDates',
  ],
  ['newDevelopments', 'implementationDetails', 'internalNotes'],
  ['urls'],
  [],
];

@Component({
  selector: 'app-project-detail-panel',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    SystemAutocompleteComponent,
  ],
  templateUrl: './project-detail-panel.component.html',
  styleUrl: './project-detail-panel.component.scss',
})
export class ProjectDetailPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  protected readonly lookups = inject(LookupService);

  /**
   * Backed by a signal so that `isReadonly()` (and everything derived from it) stays
   * reactive when the panel flips between view and edit mode from inside the component.
   */
  private readonly _mode = signal<DetailPanelMode>('view');
  private lastProjectId: number | null = null;

  @Input({ required: true })
  set state(value: ProjectPanelState) {
    const isDifferentProject = (value.project?.id ?? null) !== this.lastProjectId;

    this._mode.set(value.mode);
    this.currentProject.set(value.project);
    this.patchForm(value.project);
    this.applyMode();

    if (isDifferentProject || value.mode === 'create') {
      this.tabIndex.set(0);
      this.selectedFile.set(null);
      this.lastProjectId = value.project?.id ?? null;
    }
  }

  get mode(): DetailPanelMode {
    return this._mode();
  }

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<Project>();
  @Output() readonly deleteRequested = new EventEmitter<Project>();
  /** Raised when documents change, so the list can refresh its counts. */
  @Output() readonly documentsChanged = new EventEmitter<void>();

  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly documents = signal<ProjectDocument[]>([]);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadDocumentTypeId = signal<number | null>(null);
  protected readonly currentProject = signal<Project | null>(null);
  protected readonly tabIndex = signal(0);

  protected readonly projectTags = PROJECT_TAGS;
  protected readonly projectTagLabels = PROJECT_TAG_LABELS;
  protected readonly formatFileSize = formatFileSize;

  protected readonly isReadonly = computed(() => this._mode() === 'view');

  protected readonly form: FormGroup = this.fb.group({
    /* General */
    projectNumber: ['', [Validators.maxLength(60)]],
    name: ['', [Validators.maxLength(100)]],
    awardDate: [null as Date | null, [Validators.required]],
    endDate: [null as Date | null],
    projectType: [[] as ProjectTag[]],
    system: [null as SystemRef | null],
    tags: [[] as number[]],
    pipedriveNumber: [''],

    /* Financial */
    implementationPrice: [null as number | null, [Validators.required, Validators.min(0)]],
    maintenancePricePerYear: [null as number | null, [Validators.required, Validators.min(0)]],
    currencyId: [null as number | null, [Validators.required]],

    /* Notes */
    newDevelopments: [''],
    implementationDetails: [''],

    /* Internal use only — never disclosed outside Tidalis */
    internalNotes: [''],

    /* Repeatable sections */
    completionDates: this.fb.array([] as FormGroup[]),
    urls: this.fb.array([] as FormGroup[]),
  });

  /* --- Array accessors ------------------------------------------------------------ */

  get completionDates(): FormArray {
    return this.form.get('completionDates') as FormArray;
  }

  get urls(): FormArray {
    return this.form.get('urls') as FormArray;
  }

  /** The currently selected tags, resolved against the tags lookup — read live off the
   *  form so the chip row reflects in-progress edits, not just the saved project. */
  selectedTags(): Tag[] {
    const ids = (this.form.get('tags')?.value ?? []) as number[];
    const byId = new Map(this.lookups.tags().map((tag) => [tag.id, tag]));
    return ids.map((id) => byId.get(id)).filter((tag): tag is Tag => !!tag);
  }

  private applyMode(): void {
    if (this.mode === 'view') {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private patchForm(project: Project | null): void {
    this.form.reset(
      {
        projectNumber: '',
        name: '',
        awardDate: null,
        endDate: null,
        projectType: [],
        system: null,
        tags: [],
        pipedriveNumber: '',
        implementationPrice: null,
        maintenancePricePerYear: null,
        currencyId: null,
        newDevelopments: '',
        implementationDetails: '',
        internalNotes: '',
      },
      { emitEvent: false },
    );

    this.completionDates.clear({ emitEvent: false });
    this.urls.clear({ emitEvent: false });

    if (!project) {
      this.documents.set([]);
      return;
    }

    this.form.patchValue(
      {
        projectNumber: project.projectNumber ?? '',
        name: project.name ?? '',
        awardDate: parseDateOnly(project.awardDate),
        endDate: parseDateOnly(project.endDate),
        projectType: project.projectType ?? [],
        system: project.system ?? null,
        tags: (project.tags ?? []).map((assignment) => assignment.tagId),
        pipedriveNumber: project.pipedriveNumber ?? '',
        implementationPrice: project.implementationPrice ?? null,
        maintenancePricePerYear: project.maintenancePricePerYear ?? null,
        currencyId: project.currencyId ?? null,
        newDevelopments: project.newDevelopments ?? '',
        implementationDetails: project.implementationDetails ?? '',
        internalNotes: project.internalNotes ?? '',
      },
      { emitEvent: false },
    );

    (project.completionDates ?? []).forEach((entry) =>
      this.completionDates.push(
        this.newCompletionDateGroup(parseDateOnly(entry.completionDate), entry.description),
      ),
    );

    (project.urls ?? []).forEach((entry) =>
      this.urls.push(this.newUrlGroup(entry.urlTypeId, entry.description, entry.url)),
    );

    this.documents.set(project.documents ?? []);
  }

  /* --- Row factories -------------------------------------------------------------- */

  private newCompletionDateGroup(date: Date | null = null, description: string | null = ''): FormGroup {
    return this.fb.group({
      completionDate: [date, [Validators.required]],
      description: [description ?? ''],
    });
  }

  private newUrlGroup(
    urlTypeId: number | null = null,
    description: string | null = '',
    url = '',
  ): FormGroup {
    return this.fb.group({
      urlTypeId: [urlTypeId, [Validators.required]],
      description: [description ?? ''],
      url: [url, [Validators.required]],
    });
  }

  addCompletionDate(): void {
    this.completionDates.push(this.newCompletionDateGroup());
  }

  addUrl(): void {
    this.urls.push(this.newUrlGroup());
  }

  removeAt(array: FormArray, index: number): void {
    array.removeAt(index);
    array.markAsDirty();
  }

  /* --- Tab validation hints -------------------------------------------------------- */

  tabHasError(tabIndex: number): boolean {
    if (this.mode === 'view') {
      return false;
    }
    return (TAB_CONTROLS[tabIndex] ?? []).some((name) => {
      const control = this.form.get(name);
      return !!control && control.invalid && (control.touched || control.dirty);
    });
  }

  /* --- Save / cancel --------------------------------------------------------------- */

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstBadTab = TAB_CONTROLS.findIndex((names) =>
        names.some((name) => this.form.get(name)?.invalid),
      );
      if (firstBadTab >= 0) {
        this.tabIndex.set(firstBadTab);
      }
      this.snackbar.open('Please complete the required fields before saving.', 'Dismiss', {
        duration: 5000,
        panelClass: 'tidalis-snackbar-error',
      });
      return;
    }

    const payload = this.buildPayload();
    const existing = this.currentProject();
    const wasCreate = this.mode === 'create';
    this.saving.set(true);

    const request$ =
      wasCreate || !existing
        ? this.api.create(payload)
        : this.api.update(existing.id, payload);

    request$.subscribe({
      next: (project) => {
        this.saving.set(false);
        this.currentProject.set(project);
        this.documents.set(project.documents ?? []);
        // Drop back to read-only immediately; the parent re-binds `state` as well, but
        // doing it here keeps the panel correct even if the parent chooses not to.
        this._mode.set('view');
        this.lastProjectId = project.id;
        // No project number yet is a valid state now — fall back to the id, which is
        // always present, rather than showing a blank/"null" identifier.
        const label = project.projectNumber ?? `Project #${project.id}`;
        this.snackbar.open(wasCreate ? `Created ${label}` : `Saved ${label}`, 'Dismiss', {
          duration: 4000,
          panelClass: 'tidalis-snackbar-success',
        });
        this.saved.emit(project);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.snackbar.open(extractErrorMessage(error), 'Dismiss', {
          duration: 7000,
          panelClass: 'tidalis-snackbar-error',
        });
      },
    });
  }

  private buildPayload(): ProjectWritePayload {
    const value = this.form.getRawValue();

    const text = (input: unknown): string => (typeof input === 'string' ? input.trim() : '');
    const optional = (input: unknown): string | null => text(input) || null;

    return {
      projectNumber: text(value.projectNumber),
      name: text(value.name),
      awardDate: toDateOnlyString(value.awardDate) ?? undefined,
      endDate: toDateOnlyString(value.endDate),
      projectType: (value.projectType ?? []) as ProjectTag[],
      systemId: (value.system as SystemRef | null)?.id ?? null,
      tags: (value.tags ?? []) as number[],
      implementationPrice: Number(value.implementationPrice),
      maintenancePricePerYear: Number(value.maintenancePricePerYear),
      currencyId: Number(value.currencyId),
      newDevelopments: optional(value.newDevelopments),
      implementationDetails: optional(value.implementationDetails),
      pipedriveNumber: optional(value.pipedriveNumber),
      internalNotes: optional(value.internalNotes),

      completionDates: (value.completionDates ?? [])
        .filter((row: { completionDate: Date | null }) => !!row.completionDate)
        .map((row: { completionDate: Date; description?: string }) => ({
          completionDate: toDateOnlyString(row.completionDate) as string,
          description: optional(row.description),
        })),

      urls: (value.urls ?? [])
        .filter((row: { urlTypeId: number | null; url: string }) => !!row.urlTypeId && !!text(row.url))
        .map((row: { urlTypeId: number; description?: string; url: string }) => ({
          urlTypeId: Number(row.urlTypeId),
          description: optional(row.description),
          url: text(row.url),
        })),
    };
  }

  cancel(): void {
    const existing = this.currentProject();
    if (this.mode === 'create' || !existing) {
      this.closed.emit();
      return;
    }
    // Revert local edits and drop back to view mode.
    this._mode.set('view');
    this.patchForm(existing);
    this.applyMode();
  }

  startEdit(): void {
    this._mode.set('edit');
    this.applyMode();
  }

  requestDelete(): void {
    const existing = this.currentProject();
    if (existing) {
      this.deleteRequested.emit(existing);
    }
  }

  close(): void {
    this.closed.emit();
  }

  /* --- Documents ------------------------------------------------------------------- */

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  clearSelectedFile(input?: HTMLInputElement): void {
    this.selectedFile.set(null);
    if (input) {
      input.value = '';
    }
  }

  uploadDocument(input?: HTMLInputElement): void {
    const project = this.currentProject();
    const file = this.selectedFile();
    const documentTypeId = this.uploadDocumentTypeId();

    if (!project || !file || documentTypeId === null) {
      return;
    }

    this.uploading.set(true);
    this.api.uploadDocument(project.id, file, documentTypeId).subscribe({
      next: () => {
        this.uploading.set(false);
        this.clearSelectedFile(input);
        this.snackbar.open('Document uploaded.', 'Dismiss', {
          duration: 4000,
          panelClass: 'tidalis-snackbar-success',
        });
        this.reloadDocuments(project.id);
      },
      error: (error: unknown) => {
        this.uploading.set(false);
        this.snackbar.open(extractErrorMessage(error), 'Dismiss', {
          duration: 7000,
          panelClass: 'tidalis-snackbar-error',
        });
      },
    });
  }

  downloadUrl(documentId: number): string {
    const project = this.currentProject();
    return project ? this.api.documentDownloadUrl(project.id, documentId) : '';
  }

  deleteDocument(doc: ProjectDocument): void {
    const project = this.currentProject();
    if (!project) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Delete document?',
      message: `“${doc.fileName}” will be permanently removed from this project.`,
      confirmLabel: 'Delete',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '440px', autoFocus: false })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.api.deleteDocument(project.id, doc.id).subscribe({
          next: () => {
            this.snackbar.open('Document deleted.', 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.reloadDocuments(project.id);
          },
          error: (error: unknown) =>
            this.snackbar.open(extractErrorMessage(error), 'Dismiss', {
              duration: 7000,
              panelClass: 'tidalis-snackbar-error',
            }),
        });
      });
  }

  /** Re-reads the project so the document list (and the list's counts) stay accurate. */
  private reloadDocuments(projectId: number): void {
    this.api.get(projectId).subscribe({
      next: (project) => {
        this.currentProject.set(project);
        this.documents.set(project.documents ?? []);
        this.documentsChanged.emit();
      },
      error: () => this.documentsChanged.emit(),
    });
  }
}

function extractErrorMessage(error: unknown): string {
  const body = (error as { error?: { message?: string | string[] } } | null)?.error;
  const message = body?.message;
  if (Array.isArray(message) && message.length > 0) {
    return message.join(' · ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  const status = (error as { status?: number } | null)?.status;
  if (status === 409) {
    return 'That project number already exists.';
  }
  return 'The request failed. Please try again.';
}
