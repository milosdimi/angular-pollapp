import { Component, input, output } from '@angular/core';
import { Survey } from '../../models/survey.interface';
import { DeadlineBadge } from '../deadline-badge/deadline-badge';

const CATEGORY_ICONS: Record<string, string> = {
  'Team Activities': '🤝',
  'Health & Wellness': '🌿',
  'Gaming & Entertainment': '🎮',
  'Education & Learning': '📚',
  'Lifestyle & Preferences': '✨',
  'Technology & Innovation': '💡',
};

@Component({
  selector: 'app-survey-card',
  imports: [DeadlineBadge],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  survey = input.required<Survey>();
  cardClick = output<number>();

  categoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? '📋';
  }

  onClick(): void {
    this.cardClick.emit(this.survey().id);
  }
}
