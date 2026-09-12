import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** One entry in the on-page table of contents — `id` must match a `<section id="...">`
 *  in the template. */
interface ManualSection {
  id: string;
  icon: string;
  label: string;
}

/**
 * Static reference documentation at `/manual`. Plain content, no backend calls — a
 * built-in alternative to a separate wiki page that stays in the app and can be kept in
 * sync with the UI as it changes.
 */
@Component({
  selector: 'app-user-manual-page',
  imports: [MatIconModule, RouterLink],
  templateUrl: './user-manual-page.component.html',
  styleUrl: './user-manual-page.component.scss',
})
export class UserManualPageComponent {
  protected readonly sections: ManualSection[] = [
    { id: 'overview', icon: 'info', label: 'Overview' },
    { id: 'systems', icon: 'dns', label: 'Systems' },
    { id: 'projects', icon: 'table_view', label: 'Projects' },
    { id: 'world-map', icon: 'public', label: 'World Map' },
    { id: 'reference-data', icon: 'tune', label: 'Reference Data' },
    { id: 'audit-trail', icon: 'history', label: 'Audit Trail' },
    { id: 'claude-integration', icon: 'smart_toy', label: 'Connect Claude' },
    { id: 'tips', icon: 'lightbulb', label: 'Tips & FAQ' },
  ];
}
