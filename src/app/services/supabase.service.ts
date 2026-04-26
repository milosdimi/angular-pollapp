import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Answer, Question, Survey } from '../models/survey.interface';

type RawAnswer = Answer & { order_index: number };
type RawQuestion = Omit<Question, 'answers'> & { order_index: number; answers: RawAnswer[] };
type RawSurvey = Omit<Survey, 'questions'> & { questions: RawQuestion[] };

/** Wraps all Supabase database and realtime operations for the PollApp. */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  /** Returns all published and past surveys ordered by creation date. */
  async getSurveys(): Promise<Survey[]> {
    const { data, error } = await this.client
      .from('surveys')
      .select(`*, questions(*, answers(*))`)
      .in('status', ['published', 'past'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(this.mapSurvey);
  }

  /** Returns a single survey by its numeric ID, including questions and answers. */
  async getSurveyById(id: number): Promise<Survey> {
    const { data, error } = await this.client
      .from('surveys')
      .select(`*, questions(*, answers(*))`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapSurvey(data);
  }

  /** Inserts a new survey with its questions and answers; returns the new survey ID. */
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

  /** Deletes a survey and all its questions and answers by survey ID. */
  async deleteSurvey(id: number): Promise<void> {
    await this.deleteQuestionsAndAnswers(id);
    const { error } = await this.client.from('surveys').delete().eq('id', id);
    if (error) throw error;
  }

  /** Replaces a survey's metadata and all its questions/answers in one atomic sequence. */
  async updateSurvey(id: number, payload: {
    title: string;
    description: string;
    end_date: string;
    category: string;
    questions: { text: string; allow_multiple: boolean; answers: string[] }[];
  }): Promise<void> {
    const { error: surveyError } = await this.client
      .from('surveys')
      .update({
        title: payload.title,
        description: payload.description || null,
        end_date: payload.end_date || null,
        category: payload.category || null,
      })
      .eq('id', id);

    if (surveyError) throw surveyError;

    await this.deleteQuestionsAndAnswers(id);

    for (let qi = 0; qi < payload.questions.length; qi++) {
      const q = payload.questions[qi];
      const { data: question, error: qError } = await this.client
        .from('questions')
        .insert({ survey_id: id, text: q.text, allow_multiple: q.allow_multiple, order_index: qi })
        .select('id').single();

      if (qError) throw qError;

      const answerRows = q.answers.map((text, ai) => ({ question_id: question.id, text, order_index: ai }));
      const { error: aError } = await this.client.from('answers').insert(answerRows);
      if (aError) throw aError;
    }
  }

  /** Increments the vote count for a single answer via an RPC call. */
  async vote(answerId: number): Promise<void> {
    const { error } = await this.client.rpc('increment_vote', { answer_id: answerId });
    if (error) throw error;
  }

  /** Opens a realtime channel that calls `callback` whenever an answer row is updated. */
  subscribeToAnswers(surveyId: number, callback: () => void) {
    return this.client
      .channel(`survey-${surveyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'answers' }, callback)
      .subscribe();
  }

  /** Removes the given realtime channel to prevent memory leaks. */
  unsubscribe(channel: ReturnType<typeof this.client.channel>): void {
    this.client.removeChannel(channel);
  }

  private async deleteQuestionsAndAnswers(surveyId: number): Promise<void> {
    const { data: questions } = await this.client
      .from('questions').select('id').eq('survey_id', surveyId);

    if (questions?.length) {
      const ids = questions.map((q: { id: number }) => q.id);
      await this.client.from('answers').delete().in('question_id', ids);
      await this.client.from('questions').delete().eq('survey_id', surveyId);
    }
  }

  private mapSurvey(raw: RawSurvey): Survey {
    return {
      ...raw,
      questions: (raw.questions ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          ...q,
          answers: (q.answers ?? []).sort((a, b) => a.order_index - b.order_index),
        })),
    };
  }
}
