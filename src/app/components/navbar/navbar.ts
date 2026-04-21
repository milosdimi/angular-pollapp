import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  /** 'dark' = orange logo (dark bg), 'light' = purple logo (light bg) */
  theme = input<'dark' | 'light'>('dark');
}
