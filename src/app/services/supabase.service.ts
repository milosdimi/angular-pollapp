import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Survey, Question, Answer } from '../models/survey.interface';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  async getSurveys(): Promise<Survey[]> {
    const { data, error } = await this.client
      .from('surveys')
      .select(`*, questions(*, answers(*))`)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(this.mapSurvey);
  }

  async getSurveyById(id: number): Promise<Survey> {
    const { data, error } = await this.client
      .from('surveys')
      .select(`*, questions(*, answers(*))`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapSurvey(data);
  }

  async createSurvey(payload: {
    title: string;
    description: string;
    end_date: string;
    category: string;
    questions: { text: string; allow_multiple: boolean; answers: string[] }[];
  }): Promise<number> {
    const { data: survey, error: surveyError } = await this.client
      .from('surveys')
      .insert({
        title: payload.title,
        description: payload.description || null,
        end_date: payload.end_date || null,
        category: payload.category || null,
        status: 'published',
      })
      .select('id')
      .single();

    if (surveyError) throw surveyError;

    for (let qi = 0; qi < payload.questions.length; qi++) {
      const q = payload.questions[qi];
      const { data: question, error: qError } = await this.client
        .from('questions')
        .insert({ survey_id: survey.id, text: q.text, allow_multiple: q.allow_multiple, order_index: qi })
        .select('id')
        .single();

      if (qError) throw qError;

      const answerRows = q.answers.map((text, ai) => ({
        question_id: question.id,
        text,
        order_index: ai,
      }));

      const { error: aError } = await this.client.from('answers').insert(answerRows);
      if (aError) throw aError;
    }

    return survey.id;
  }

  async vote(answerId: number): Promise<void> {
    const { error } = await this.client.rpc('increment_vote', { answer_id: answerId });
    if (error) throw error;
  }

  subscribeToAnswers(surveyId: number, callback: () => void) {
    return this.client
      .channel(`survey-${surveyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'answers' }, callback)
      .subscribe();
  }

  private mapSurvey(raw: any): Survey {
    return {
      ...raw,
      questions: (raw.questions ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((q: any) => ({
          ...q,
          answers: (q.answers ?? []).sort((a: any, b: any) => a.order_index - b.order_index),
        })),
    };
  }
}
