import { Component, input, computed } from '@angular/core';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-deadline-badge',
  imports: [],
  templateUrl: './deadline-badge.html',
  styleUrl: './deadline-badge.scss',
})
export class DeadlineBadge {
  endDate = input<string | null>(null);

  daysLeft = computed(() => {
    const date = this.endDate();
    if (!date) return null;
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / MS_PER_DAY);
  });

  label = computed(() => {
    const days = this.daysLeft();
    if (days === null) return '';
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });
}
