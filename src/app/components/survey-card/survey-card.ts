import { Component, input, output } from '@angular/core';
import { Survey } from '../../models/survey.interface';
import { DeadlineBadge } from '../deadline-badge/deadline-badge';

@Component({
  selector: 'app-survey-card',
  imports: [DeadlineBadge],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  survey = input.required<Survey>();
  cardClick = output<number>();

  onClick(): void {
    this.cardClick.emit(this.survey().id);
  }
}
