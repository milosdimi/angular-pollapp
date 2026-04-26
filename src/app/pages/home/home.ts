import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from './hero/hero';
import { EndingSoon } from './ending-soon/ending-soon';
import { SurveyList } from './survey-list/survey-list';
import { Footer } from '../../components/footer/footer';
import { Survey } from '../../models/survey.interface';
import { SupabaseService } from '../../services/supabase.service';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, EndingSoon, SurveyList, Footer, Spinner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  surveys = signal<Survey[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  endingSoon = computed(() =>
    this.surveys()
      .filter(s => s.end_date)
      .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())
      .slice(0, 3)
  );

  async ngOnInit(): Promise<void> {
    this.titleService.setTitle('PollApp – Umfragen erstellen und teilen');
    this.metaService.updateTag({ name: 'description', content: 'Erstelle, teile und werte Umfragen in Echtzeit aus.' });
    try {
      const data = await this.supabase.getSurveys();
      this.surveys.set(data);
    } catch (err: unknown) {
      this.loadError.set(err instanceof Error ? err.message : 'Could not load surveys.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onCardClick(id: number): void {
    this.router.navigate(['/survey', id]);
  }
}
