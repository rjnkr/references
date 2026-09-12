import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/auth/auth.service';

/**
 * Application shell: sticky Tidalis navbar, full-width content area, muted footer.
 * There is deliberately no sidebar — the tool has a single feature area.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly year = new Date().getFullYear();

  constructor() {
    // `ViewportScroller.scrollToAnchor()` (used for routerLink `fragment` navigation, e.g.
    // the User Manual's table of contents) measures the target element directly and isn't
    // affected by CSS `scroll-margin-top` — it lands the element flush with the viewport
    // top, hidden behind the sticky navbar, unless told to back off by this much (60px
    // navbar height, --tidalis-navbar-height, plus a little breathing room).
    inject(ViewportScroller).setOffset([0, 76]);
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }
}
