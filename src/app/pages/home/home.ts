import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from './hero/hero';
import { EndingSoon } from './ending-soon/ending-soon';
import { Survey } from '../../models/survey.interface';

const MOCK_SURVEYS: Survey[] = [
  {
    id: 1, title: "Let's Plan the Next Team Event Together",
    description: null, category: 'Team activities',
    end_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'published', created_at: '', questions: [],
  },
  {
    id: 2, title: 'Fit & wellness survey!',
    description: null, category: 'Health & Wellness',
    end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'published', created_at: '', questions: [],
  },
  {
    id: 3, title: 'Gaming habits and favorite games!',
    description: null, category: 'Gaming & Entertainment',
    end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'published', created_at: '', questions: [],
  },
];

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, EndingSoon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private router = inject(Router);
  endingSoonSurveys: Survey[] = MOCK_SURVEYS;

  onCardClick(id: number): void {
    this.router.navigate(['/survey', id]);
  }
}
