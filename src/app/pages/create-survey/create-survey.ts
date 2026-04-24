import { Component, inject, HostListener, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

function minDateValidator(min: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value >= min ? null : { minDate: true };
  };
}

const CATEGORIES: string[] = [
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preferences',
  'Technology & Innovation',
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Component({
  selector: 'app-create-survey',
  imports: [ReactiveFormsModule],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurvey implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Neue Umfrage erstellen – PollApp');
    this.metaService.updateTag({ name: 'description', content: 'Erstelle eine neue Umfrage mit Fragen und Antwortoptionen.' });
  }

  readonly categories = CATEGORIES;
  readonly LETTERS = LETTERS;
  readonly today = new Date().toISOString().split('T')[0];

  categoryOpen = false;

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    end_date: ['', minDateValidator(this.today)],
    category: [''],
    questions: this.fb.array([this.createQuestion()]),
  });

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  answersOf(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  isAtMaxAnswers(questionIndex: number): boolean {
    return this.answersOf(questionIndex).length >= 6;
  }

  showPublishedOverlay = signal(false);
  isPublishing = signal(false);
  publishError = signal<string | null>(null);
  private newSurveyId: number | null = null;

  clearQuestion(questionIndex: number): void {
    const q = this.questions.at(questionIndex) as FormGroup;
    q.patchValue({ text: '' });
    this.answersOf(questionIndex).controls.forEach(ctrl => ctrl.setValue(''));
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      allow_multiple: [false],
      answers: this.fb.array([this.createAnswer(), this.createAnswer()]),
    });
  }

  createAnswer() {
    return this.fb.control('', Validators.required);
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number): void {
    const answers = this.answersOf(questionIndex);
    if (answers.length < 6) answers.push(this.createAnswer());
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.answersOf(questionIndex);
    if (answers.length > 2) answers.removeAt(answerIndex);
  }

  onDateBlur(): void {
    const ctrl = this.form.get('end_date')!;
    if (ctrl.value && ctrl.value < this.today) ctrl.setValue(this.today);
  }

  selectCategory(cat: string): void {
    this.form.patchValue({ category: cat });
    this.categoryOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-select')) {
      this.categoryOpen = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  async onPublish(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isPublishing.set(true);
    this.publishError.set(null);
    const v = this.form.value;

    try {
      this.newSurveyId = await this.supabase.createSurvey({
        title: v.title,
        description: v.description,
        end_date: v.end_date,
        category: v.category,
        questions: v.questions.map((q: any) => ({
          text: q.text,
          allow_multiple: q.allow_multiple,
          answers: q.answers.filter((a: string) => a.trim() !== ''),
        })),
      });
      this.showPublishedOverlay.set(true);
      setTimeout(() => this.closeOverlay(), 2000);
    } catch (err: any) {
      console.error('Publish failed:', err);
      this.publishError.set(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.isPublishing.set(false);
    }
  }

  closeOverlay(): void {
    this.showPublishedOverlay.set(false);
    this.router.navigate(['/']);
  }
}
