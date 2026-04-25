import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem('theme');
    const dark = saved !== 'light';
    this.isDark.set(dark);
    document.body.classList.toggle('light-mode', !dark);
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.body.classList.toggle('light-mode', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }
}
