import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Survey, Question, Answer } from '../../models/survey.interface';
import { SupabaseService } from '../../services/supabase.service';
import { Spinner } from '../../components/spinner/spinner';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

@Component({
  selector: 'app-survey-detail',
  imports: [Navbar, TitleCasePipe, Spinner, FormatDatePipe],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);

  survey = signal<Survey | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  isVoting = signal(false);
  hasVoted = signal(false);
  linkCopied = signal(false);

  private selections = signal<Map<number, Set<number>>>(new Map());
  private channel: any = null;

  readonly LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  hasResults = computed(() => {
    const s = this.survey();
    if (!s) return false;
    return s.questions.some(q => q.answers.some(a => a.vote_count > 0));
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.hasVotedFor(id)) this.hasVoted.set(true);
    await this.loadSurvey(id);
    this.channel = this.supabase.subscribeToAnswers(id, () => this.loadSurvey(id));
  }

  ngOnDestroy(): void {
    if (this.channel) this.supabase.unsubscribe(this.channel);
  }

  private async loadSurvey(id: number): Promise<void> {
    try {
      const data = await this.supabase.getSurveyById(id);
      this.survey.set(data);
    } catch (err: any) {
      this.loadError.set(err?.message ?? 'Could not load survey.');
    } finally {
      this.isLoading.set(false);
    }
  }

  isSelected(questionId: number, answerId: number): boolean {
    return this.selections().get(questionId)?.has(answerId) ?? false;
  }

  toggleAnswer(question: Question, answerId: number): void {
    if (this.hasVoted()) return;
    const map = new Map(this.selections());
    const set = new Set(map.get(question.id) ?? []);

    if (question.allow_multiple) {
      set.has(answerId) ? set.delete(answerId) : set.add(answerId);
    } else {
      set.clear();
      set.add(answerId);
    }
    map.set(question.id, set);
    this.selections.set(map);
  }

  async onComplete(): Promise<void> {
    if (this.isVoting() || this.hasVoted()) return;
    this.isVoting.set(true);
    try {
      const allSelected = [...this.selections().values()].flatMap(s => [...s]);
      await Promise.all(allSelected.map(id => this.supabase.vote(id)));
      const surveyId = Number(this.route.snapshot.paramMap.get('id'));
      this.markVotedFor(surveyId);
      this.hasVoted.set(true);
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      this.isVoting.set(false);
    }
  }

  private hasVotedFor(surveyId: number): boolean {
    const voted = JSON.parse(localStorage.getItem('pollapp_voted') ?? '[]') as number[];
    return voted.includes(surveyId);
  }

  private markVotedFor(surveyId: number): void {
    const voted = JSON.parse(localStorage.getItem('pollapp_voted') ?? '[]') as number[];
    if (!voted.includes(surveyId)) {
      localStorage.setItem('pollapp_voted', JSON.stringify([...voted, surveyId]));
    }
  }

  totalVotes(question: Question): number {
    return question.answers.reduce((sum, a) => sum + a.vote_count, 0);
  }

  percentage(answer: Answer, question: Question): number {
    const total = this.totalVotes(question);
    if (total === 0) return 0;
    return Math.round((answer.vote_count / total) * 100);
  }

  onShare(): void {
    navigator.clipboard.writeText(window.location.href);
    this.linkCopied.set(true);
    setTimeout(() => this.linkCopied.set(false), 2000);
  }

  onCreateClick(): void {
    this.router.navigate(['/create']);
  }
}
