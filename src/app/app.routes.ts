import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SurveyDetail } from './pages/survey-detail/survey-detail';
import { CreateSurvey } from './pages/create-survey/create-survey';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'survey/:id', component: SurveyDetail },
  { path: 'create', component: CreateSurvey },
  { path: '**', component: NotFound },
];
