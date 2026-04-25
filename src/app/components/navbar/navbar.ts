import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  showCreateButton = input<boolean>(false);
  createClick = output<void>();

  private themeService = inject(ThemeService);
  isDark = this.themeService.isDark;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
