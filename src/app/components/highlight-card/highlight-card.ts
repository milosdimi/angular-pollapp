import { Component, input, output } from '@angular/core';
import { Survey } from '../../models/survey.interface';
import { DeadlineBadge } from '../deadline-badge/deadline-badge';

@Component({
  selector: 'app-highlight-card',
  imports: [DeadlineBadge],
  templateUrl: './highlight-card.html',
  styleUrl: './highlight-card.scss',
})
export class HighlightCard {
  survey = input.required<Survey>();
  cardClick = output<number>();

  onClick(): void {
    this.cardClick.emit(this.survey().id);
  }
}
