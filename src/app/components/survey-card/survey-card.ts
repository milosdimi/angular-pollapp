import { Component, input, output } from '@angular/core';
import { Survey } from '../../models/survey.interface';
import { DeadlineBadge } from '../deadline-badge/deadline-badge';

const CATEGORY_ICONS: Record<string, string> = {
  'Team Activities': 'svgs/handshake.svg',
  'Health & Wellness': 'svgs/leaf.svg',
  'Gaming & Entertainment': 'svgs/game-controller.svg',
  'Education & Learning': 'svgs/book-open-text.svg',
  'Lifestyle & Preferences': 'svgs/sparkle.svg',
  'Technology & Innovation': 'svgs/lightbulb.svg',
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
    return CATEGORY_ICONS[category] ?? 'svgs/clipboard-text.svg';
  }

  onClick(): void {
    this.cardClick.emit(this.survey().id);
  }
}
