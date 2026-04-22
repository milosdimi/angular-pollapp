import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Survey, Question, Answer } from '../../models/survey.interface';

const MOCK_SURVEY: Survey = {
  id: 1,
  title: "Let's Plan the Next Team Event Together",
  description: "We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.",
  category: 'Team activities',
  end_date: '2025-09-01',
  status: 'published',
  created_at: '',
  questions: [
    {
      id: 1, survey_id: 1,
      text: 'Which date would work best for you?',
      allow_multiple: true,
      answers: [
        { id: 1, question_id: 1, text: '19.09.2025, Friday', vote_count: 27 },
        { id: 2, question_id: 1, text: '10.10.2025, Friday', vote_count: 44 },
        { id: 3, question_id: 1, text: '11.10.2025, Saturday', vote_count: 3 },
        { id: 4, question_id: 1, text: '31.10.2025, Friday', vote_count: 26 },
      ],
    },
    {
      id: 2, survey_id: 1,
      text: 'Choose the activities you prefer',
      allow_multiple: true,
      answers: [
        { id: 5, question_id: 2, text: 'Outdoor adventure like kayaking', vote_count: 60 },
        { id: 6, question_id: 2, text: 'Office Costume Party', vote_count: 0 },
        { id: 7, question_id: 2, text: 'Bowling, mini-golf, volleyball', vote_count: 14 },
        { id: 8, question_id: 2, text: 'Beach party, Music & cocktails', vote_count: 26 },
        { id: 9, question_id: 2, text: 'Escape room', vote_count: 0 },
      ],
    },
    {
      id: 3, survey_id: 1,
      text: "What's most important to you in a team event?",
      allow_multiple: false,
      answers: [
        { id: 10, question_id: 3, text: 'Team bonding', vote_count: 44 },
        { id: 11, question_id: 3, text: 'Food and drinks', vote_count: 3 },
        { id: 12, question_id: 3, text: 'Trying something new', vote_count: 26 },
        { id: 13, question_id: 3, text: 'Keeping it low-key and stress-free', vote_count: 27 },
      ],
    },
    {
      id: 4, survey_id: 1,
      text: 'How long would you prefer the event to last?',
      allow_multiple: false,
      answers: [
        { id: 14, question_id: 4, text: 'Half a day', vote_count: 14 },
        { id: 15, question_id: 4, text: 'Full day', vote_count: 86 },
        { id: 16, question_id: 4, text: 'Evening only', vote_count: 0 },
      ],
    },
  ],
};

@Component({
  selector: 'app-survey-detail',
  imports: [Navbar, TitleCasePipe],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  private router = inject(Router);
  survey = signal<Survey>(MOCK_SURVEY);
  hasResults = signal<boolean>(true);

  readonly LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  totalVotes(question: Question): number {
    return question.answers.reduce((sum, a) => sum + a.vote_count, 0);
  }

  percentage(answer: Answer, question: Question): number {
    const total = this.totalVotes(question);
    if (total === 0) return 0;
    return Math.round((answer.vote_count / total) * 100);
  }

  onCreateClick(): void {
    this.router.navigate(['/create']);
  }
}
