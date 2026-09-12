import { Component, EventEmitter, Input, Output, ViewChild, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

import { LookupService } from '../../../core/api/lookup.service';
import { SystemService } from '../../../core/api/system.service';
import { CONTRACT_TYPES, CONTRACT_TYPE_LABELS, ContractType } from '../../../core/models/contract.models';
import { Module, Tag, UnLocode } from '../../../core/models/lookup.models';
import {
  System,
  SystemDocument,
  SystemWritePayload,
} from '../../../core/models/system.models';
import { formatFileSize } from '../../../core/util/date-only';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UnlocodeAutocompleteComponent } from '../../../shared/unlocode-autocomplete/unlocode-autocomplete.component';

export type DetailPanelMode = 'view' | 'edit' | 'create';

/**
 * What the panel is showing. Passed as a single object so that every (re)open from the
 * list produces a fresh identity — a plain `mode` input would be dirty-checked by value
 * and so could be skipped after the panel had switched itself into edit mode.
 */
export interface SystemPanelState {
  mode: DetailPanelMode;
  system: System | null;
}

/** Soft guidance limit for the scope field (~200 words). */
const SCOPE_SOFT_WORD_LIMIT = 200;

/**
 * Which form controls live on which tab, so the tab header can flag validation problems
 * the user cannot currently see.
 */
const TAB_CONTROLS: string[][] = [
  ['name', 'systemUnlocode', 'contractType', 'countryId', 'tags'],
  ['scope', 'products', 'description', 'internalNotes'],
  ['ports'],
  ['modules', 'subSystems', 'externalInterfaces'],
  ['pocName', 'pocEmail', 'pocPhone', 'customerDetails', 'endUserDetails', 'people'],
  ['urls'],
  [],
];

@Component({
  selector: 'app-system-detail-panel',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    UnlocodeAutocompleteComponent,
  ],
  templateUrl: './system-detail-panel.component.html',
  styleUrl: './system-detail-panel.component.scss',
})
export class SystemDetailPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SystemService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  protected readonly lookups = inject(LookupService);

  /**
   * Backed by a signal so that `isReadonly()` (and everything derived from it) stays
   * reactive when the panel flips between view and edit mode from inside the component.
   */
  private readonly _mode = signal<DetailPanelMode>('view');
  private lastSystemId: number | null = null;

  @ViewChild('modulesSelect') private moduleSelectRef?: MatSelect;

  @Input({ required: true })
  set state(value: SystemPanelState) {
    const isDifferentSystem = (value.system?.id ?? null) !== this.lastSystemId;

    this._mode.set(value.mode);
    this.currentSystem.set(value.system);
    this.patchForm(value.system);
    this.applyMode();

    if (isDifferentSystem || value.mode === 'create') {
      this.tabIndex.set(0);
      this.selectedFile.set(null);
      this.lastSystemId = value.system?.id ?? null;
    }
  }

  get mode(): DetailPanelMode {
    return this._mode();
  }

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<System>();
  @Output() readonly deleteRequested = new EventEmitter<System>();
  /** Raised when documents change, so the list can refresh its counts. */
  @Output() readonly documentsChanged = new EventEmitter<void>();

  protected readonly contractTypes = CONTRACT_TYPES;
  protected readonly contractTypeLabels = CONTRACT_TYPE_LABELS;
  protected readonly scopeSoftLimit = SCOPE_SOFT_WORD_LIMIT;
  protected readonly formatFileSize = formatFileSize;

  protected readonly tabIndex = signal(0);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly documents = signal<SystemDocument[]>([]);
  protected readonly scopeWords = signal(0);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadDocumentTypeId = signal<number | null>(null);
  protected readonly currentSystem = signal<System | null>(null);
  /** Whether the Modules field currently shows the picker instead of the read-friendly
   *  list — see `showModulesPicker()`. */
  protected readonly editingModules = signal(false);

  protected readonly isReadonly = computed(() => this._mode() === 'view');
  protected readonly scopeOverLimit = computed(() => this.scopeWords() > SCOPE_SOFT_WORD_LIMIT);

  protected readonly form: FormGroup = this.fb.group({
    /* General */
    name: ['', [Validators.required, Validators.maxLength(100)]],
    contractType: [null as ContractType | null, [Validators.required]],
    countryId: [null as number | null, [Validators.required]],
    systemUnlocode: [null as UnLocode | null, [Validators.required]],
    isSensitive: [false],
    canBeUsedAsReference: [true],
    systemDecommissioned: [false],
    tags: [[] as number[]],
    modules: [[] as number[], [minSelectionValidator(1)]],

    /* Scope & description */
    scope: ['', [Validators.required]],
    products: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],

    /* People & contacts */
    pocName: [''],
    pocEmail: ['', [Validators.email]],
    pocPhone: [''],
    customerDetails: [''],
    endUserDetails: [''],

    /* Internal use only — never disclosed outside Tidalis */
    internalNotes: [''],

    /* Repeatable sections */
    ports: this.fb.array([] as FormGroup[]),
    subSystems: this.fb.array([] as FormGroup[]),
    externalInterfaces: this.fb.array([] as FormGroup[]),
    people: this.fb.array([] as FormGroup[]),
    urls: this.fb.array([] as FormGroup[]),
  });

  constructor() {
    this.form.get('scope')?.valueChanges.subscribe((value: string) => {
      this.scopeWords.set(countWords(value));
    });

    // Default the country from the picked UN/LOCODE's own country — the user can still
    // override it afterwards via the Country select.
    this.form.get('systemUnlocode')?.valueChanges.subscribe((value: UnLocode | null) => {
      if (value?.countryId) {
        this.form.get('countryId')?.setValue(value.countryId);
      }
    });
  }

  /* --- Array accessors ------------------------------------------------------------ */

  get ports(): FormArray {
    return this.form.get('ports') as FormArray;
  }

  get subSystems(): FormArray {
    return this.form.get('subSystems') as FormArray;
  }

  get externalInterfaces(): FormArray {
    return this.form.get('externalInterfaces') as FormArray;
  }

  get people(): FormArray {
    return this.form.get('people') as FormArray;
  }

  get urls(): FormArray {
    return this.form.get('urls') as FormArray;
  }

  /** The currently selected tags, resolved against the tags lookup — read live off the
   *  form so the chip row reflects in-progress edits, not just the saved system. */
  selectedTags(): Tag[] {
    const ids = (this.form.get('tags')?.value ?? []) as number[];
    const byId = new Map(this.lookups.tags().map((tag) => [tag.id, tag]));
    return ids.map((id) => byId.get(id)).filter((tag): tag is Tag => !!tag);
  }

  /** The currently selected modules, alphabetised — the mat-select trigger itself only
   *  shows a truncated comma list, so this backs a readable list display alongside it. */
  selectedModules(): Module[] {
    const ids = (this.form.get('modules')?.value ?? []) as number[];
    const byId = new Map(this.lookups.modules().map((module) => [module.id, module]));
    return ids
      .map((id) => byId.get(id))
      .filter((module): module is Module => !!module)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** The Modules field shows the picker whenever there is nothing to list yet (so a
   *  system can never be left with an unreachable "add a module" affordance), or while
   *  the pencil button is actively being used to change an existing selection. Once
   *  something is selected and the picker isn't mid-edit, it collapses to the plain,
   *  readable list instead — the mat-select trigger's own truncated text doesn't scale to
   *  the 10+ modules a system may carry. */
  protected showModulesPicker(): boolean {
    return !this.isReadonly() && (this.editingModules() || this.selectedModules().length === 0);
  }

  startEditingModules(): void {
    this.editingModules.set(true);
    // The mat-select only exists in the DOM once `showModulesPicker()` flips true, so
    // opening it has to wait a tick for that view update to render.
    setTimeout(() => this.moduleSelectRef?.open());
  }

  onModulesSelectClosed(): void {
    if (this.selectedModules().length > 0) {
      this.editingModules.set(false);
    }
  }

  private applyMode(): void {
    if (this.mode === 'view') {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private patchForm(system: System | null): void {
    this.editingModules.set(false);
    this.form.reset(
      {
        name: '',
        contractType: null,
        countryId: null,
        systemUnlocode: null,
        isSensitive: false,
        canBeUsedAsReference: true,
        systemDecommissioned: false,
        tags: [],
        modules: [],
        scope: '',
        products: '',
        description: '',
        pocName: '',
        pocEmail: '',
        pocPhone: '',
        customerDetails: '',
        endUserDetails: '',
        internalNotes: '',
      },
      { emitEvent: false },
    );

    this.ports.clear({ emitEvent: false });
    this.subSystems.clear({ emitEvent: false });
    this.externalInterfaces.clear({ emitEvent: false });
    this.people.clear({ emitEvent: false });
    this.urls.clear({ emitEvent: false });

    if (!system) {
      this.documents.set([]);
      this.scopeWords.set(0);
      return;
    }

    this.form.patchValue(
      {
        name: system.name ?? '',
        contractType: system.contractType ?? null,
        countryId: system.countryId ?? null,
        systemUnlocode: system.systemUnlocode ?? null,
        isSensitive: !!system.isSensitive,
        canBeUsedAsReference: !!system.canBeUsedAsReference,
        systemDecommissioned: !!system.systemDecommissioned,
        tags: (system.tags ?? []).map((assignment) => assignment.tagId),
        modules: (system.modules ?? []).map((assignment) => assignment.moduleId),
        scope: system.scope ?? '',
        products: system.products ?? '',
        description: system.description ?? '',
        pocName: system.pocName ?? '',
        pocEmail: system.pocEmail ?? '',
        pocPhone: system.pocPhone ?? '',
        customerDetails: system.customerDetails ?? '',
        endUserDetails: system.endUserDetails ?? '',
        internalNotes: system.internalNotes ?? '',
      },
      { emitEvent: false },
    );

    (system.ports ?? []).forEach((port) => this.ports.push(this.newPortGroup(port.unlocode)));
    (system.subSystems ?? []).forEach((item) =>
      this.subSystems.push(this.newNameGroup(item.name)),
    );
    (system.externalInterfaces ?? []).forEach((item) =>
      this.externalInterfaces.push(this.newInterfaceGroup(item.name, item.description)),
    );
    (system.people ?? []).forEach((person) =>
      this.people.push(this.newPersonGroup(person.name, person.role, person.email)),
    );
    (system.urls ?? []).forEach((entry) =>
      this.urls.push(this.newUrlGroup(entry.urlTypeId, entry.description, entry.url)),
    );

    this.documents.set(system.documents ?? []);
    this.scopeWords.set(countWords(system.scope ?? ''));
  }

  /* --- Row factories -------------------------------------------------------------- */

  private newPortGroup(unlocode: UnLocode | null = null): FormGroup {
    return this.fb.group({ unlocode: [unlocode, [Validators.required]] });
  }

  private newNameGroup(name = ''): FormGroup {
    return this.fb.group({ name: [name, [Validators.required, Validators.maxLength(100)]] });
  }

  private newInterfaceGroup(name = '', description: string | null = ''): FormGroup {
    return this.fb.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      description: [description ?? ''],
    });
  }

  private newPersonGroup(name = '', role = '', email: string | null = ''): FormGroup {
    return this.fb.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      role: [role, [Validators.required, Validators.maxLength(100)]],
      email: [email ?? '', [Validators.email]],
    });
  }

  addPort(): void {
    this.ports.push(this.newPortGroup());
  }

  addSubSystem(): void {
    this.subSystems.push(this.newNameGroup());
  }

  addExternalInterface(): void {
    this.externalInterfaces.push(this.newInterfaceGroup());
  }

  addPerson(): void {
    this.people.push(this.newPersonGroup());
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
    const existing = this.currentSystem();
    const wasCreate = this.mode === 'create';
    this.saving.set(true);

    const request$ =
      wasCreate || !existing ? this.api.create(payload) : this.api.update(existing.id, payload);

    request$.subscribe({
      next: (system) => {
        this.saving.set(false);
        this.currentSystem.set(system);
        this.documents.set(system.documents ?? []);
        // Drop back to read-only immediately; the parent re-binds `state` as well, but
        // doing it here keeps the panel correct even if the parent chooses not to.
        this._mode.set('view');
        this.lastSystemId = system.id;
        this.snackbar.open(wasCreate ? `Created ${system.name}` : `Saved ${system.name}`, 'Dismiss', {
          duration: 4000,
          panelClass: 'tidalis-snackbar-success',
        });
        this.saved.emit(system);
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

  private buildPayload(): SystemWritePayload {
    const value = this.form.getRawValue();

    const text = (input: unknown): string => (typeof input === 'string' ? input.trim() : '');
    const optional = (input: unknown): string | null => text(input) || null;

    return {
      name: text(value.name),
      scope: text(value.scope),
      contractType: value.contractType,
      products: text(value.products),
      description: optional(value.description),
      customerDetails: optional(value.customerDetails),
      endUserDetails: optional(value.endUserDetails),
      countryId: Number(value.countryId),
      systemUnlocodeId: (value.systemUnlocode as UnLocode | null)?.id ?? null,
      pocName: optional(value.pocName),
      pocEmail: optional(value.pocEmail),
      pocPhone: optional(value.pocPhone),
      internalNotes: optional(value.internalNotes),
      isSensitive: !!value.isSensitive,
      canBeUsedAsReference: !!value.canBeUsedAsReference,
      systemDecommissioned: !!value.systemDecommissioned,
      tags: (value.tags ?? []) as number[],

      ports: (value.ports ?? [])
        .map((row: { unlocode: UnLocode | null }) => row.unlocode)
        .filter((unlocode: UnLocode | null): unlocode is UnLocode => !!unlocode?.id)
        .map((unlocode: UnLocode) => ({ unlocodeId: unlocode.id })),

      modules: (value.modules ?? []) as number[],

      subSystems: (value.subSystems ?? [])
        .map((row: { name: string }) => ({ name: text(row.name) }))
        .filter((row: { name: string }) => !!row.name),

      externalInterfaces: (value.externalInterfaces ?? [])
        .map((row: { name: string; description?: string }) => ({
          name: text(row.name),
          description: optional(row.description),
        }))
        .filter((row: { name: string }) => !!row.name),

      people: (value.people ?? [])
        .map((row: { name: string; role: string; email?: string }) => ({
          name: text(row.name),
          role: text(row.role),
          email: optional(row.email),
        }))
        .filter((row: { name: string }) => !!row.name),

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
    const existing = this.currentSystem();
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
    const existing = this.currentSystem();
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
    const system = this.currentSystem();
    const file = this.selectedFile();
    const documentTypeId = this.uploadDocumentTypeId();

    if (!system || !file || documentTypeId === null) {
      return;
    }

    this.uploading.set(true);
    this.api.uploadDocument(system.id, file, documentTypeId).subscribe({
      next: () => {
        this.uploading.set(false);
        this.clearSelectedFile(input);
        this.snackbar.open('Document uploaded.', 'Dismiss', {
          duration: 4000,
          panelClass: 'tidalis-snackbar-success',
        });
        this.reloadDocuments(system.id);
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
    const system = this.currentSystem();
    return system ? this.api.documentDownloadUrl(system.id, documentId) : '';
  }

  deleteDocument(doc: SystemDocument): void {
    const system = this.currentSystem();
    if (!system) {
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Delete document?',
      message: `“${doc.fileName}” will be permanently removed from this system.`,
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
        this.api.deleteDocument(system.id, doc.id).subscribe({
          next: () => {
            this.snackbar.open('Document deleted.', 'Dismiss', {
              duration: 4000,
              panelClass: 'tidalis-snackbar-success',
            });
            this.reloadDocuments(system.id);
          },
          error: (error: unknown) =>
            this.snackbar.open(extractErrorMessage(error), 'Dismiss', {
              duration: 7000,
              panelClass: 'tidalis-snackbar-error',
            }),
        });
      });
  }

  /** Re-reads the system so the document list (and the list's counts) stay accurate. */
  private reloadDocuments(systemId: number): void {
    this.api.get(systemId).subscribe({
      next: (system) => {
        this.currentSystem.set(system);
        this.documents.set(system.documents ?? []);
        this.documentsChanged.emit();
      },
      error: () => this.documentsChanged.emit(),
    });
  }
}

/* --- Module-level helpers ---------------------------------------------------------- */

/** `Validators.required` treats an empty array as present, so a multi-select field that
 *  must have at least one entry (e.g. modules) needs this instead. */
function minSelectionValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return Array.isArray(value) && value.length >= min ? null : { minSelection: { min } };
  };
}

function countWords(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const matches = value.trim().match(/\S+/g);
  return matches ? matches.length : 0;
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
  return 'The request failed. Please try again.';
}
