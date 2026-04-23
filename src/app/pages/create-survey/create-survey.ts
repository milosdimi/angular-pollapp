import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

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
  categoryOpen = false;

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    end_date: [''],
    category: [''],
    questions: this.fb.array([this.createQuestion()]),
  });

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  answersOf(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
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

  selectCategory(cat: string): void {
    this.form.patchValue({ category: cat });
    this.categoryOpen = false;
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  onPublish(): void {
    if (this.form.valid) {
      console.log('Publish:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
