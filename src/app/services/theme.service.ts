import { Injectable, signal } from '@angular/core';

/** Manages the dark/light theme preference, persisted in localStorage. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** `true` when the dark theme is active. */
  readonly isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem('theme');
    const dark = saved !== 'light';
    this.isDark.set(dark);
    document.body.classList.toggle('light-mode', !dark);
  }

  /** Toggles between dark and light theme and saves the preference. */
  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.body.classList.toggle('light-mode', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }
}
