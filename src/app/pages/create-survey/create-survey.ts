import { Component, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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
export class CreateSurvey {
  private router = inject(Router);
  private fb = inject(FormBuilder);

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

  showPublishedOverlay = false;

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

  onPublish(): void {
    if (this.form.valid) {
      this.showPublishedOverlay = true;
    } else {
      this.form.markAllAsTouched();
    }
  }

  closeOverlay(): void {
    this.showPublishedOverlay = false;
    this.router.navigate(['/']);
  }
}
