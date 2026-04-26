import { Pipe, PipeTransform } from '@angular/core';

/** Formats an ISO date string to a German long-form date (e.g. "26. April 2026"). Returns "—" for empty values. */
@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  /** @param value ISO date string or null/undefined. */
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
