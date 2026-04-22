import { Component, input, output, signal, computed, HostListener } from '@angular/core';
import { Survey } from '../../../models/survey.interface';
import { SurveyCard } from '../../../components/survey-card/survey-card';

const CATEGORIES: string[] = [
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preferences',
  'Technology & Innovation',
];

@Component({
  selector: 'app-survey-list',
  imports: [SurveyCard],
  templateUrl: './survey-list.html',
  styleUrl: './survey-list.scss',
})
export class SurveyList {
  surveys = input.required<Survey[]>();
  cardClick = output<number>();

  activeTab = signal<'active' | 'past'>('active');
  selectedCategory = signal<string | null>(null);
  dropdownOpen = signal(false);

  readonly categories = CATEGORIES;

  filteredSurveys = computed(() => {
    const now = new Date();
    const tab = this.activeTab();
    const category = this.selectedCategory();

    return this.surveys().filter((s) => {
      const isActive = !s.end_date || new Date(s.end_date) > now;
      const matchesTab = tab === 'active' ? isActive : !isActive;
      const matchesCategory = !category || s.category === category;
      return matchesTab && matchesCategory;
    });
  });

  setTab(tab: 'active' | 'past'): void {
    this.activeTab.set(tab);
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
    this.dropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-bar__sort')) {
      this.dropdownOpen.set(false);
    }
  }
}
