import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { Tag } from '../../core/models/lookup.models';

/** A single contract/system's tag assignments, however the grid row shapes them. */
type TagAssignment = { tag: Tag };

/** Renders every tag attached to the row as a coloured, rounded chip using that tag's own
 *  background/text colour. */
@Component({
  selector: 'app-tag-chips-cell-renderer',
  template: `
    @for (tag of tags; track tag.id) {
      <span
        class="tidalis-tag-chip"
        [style.background-color]="tag.backgroundColor"
        [style.color]="tag.textColor"
        >{{ tag.name }}</span
      >
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: nowrap;
      overflow: hidden;
      gap: 4px;
      align-items: center;
      height: 100%;
    }

    .tidalis-tag-chip {
      flex: 0 0 auto;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class TagChipsCellRendererComponent implements ICellRendererAngularComp {
  protected tags: Tag[] = [];

  agInit(params: ICellRendererParams<unknown, TagAssignment[]>): void {
    this.tags = (params.value ?? []).map((assignment) => assignment.tag);
  }

  refresh(params: ICellRendererParams<unknown, TagAssignment[]>): boolean {
    this.agInit(params);
    return true;
  }
}
