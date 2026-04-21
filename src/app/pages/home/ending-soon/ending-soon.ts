import { Component, input, output } from '@angular/core';
import { Survey } from '../../../models/survey.interface';
import { HighlightCard } from '../../../components/highlight-card/highlight-card';

@Component({
  selector: 'app-ending-soon',
  imports: [HighlightCard],
  templateUrl: './ending-soon.html',
  styleUrl: './ending-soon.scss',
})
export class EndingSoon {
  surveys = input.required<Survey[]>();
  cardClick = output<number>();
}
