import { Injectable } from '@angular/core';
import PocketBase, { RecordModel, UnsubscribeFunc } from 'pocketbase';
import { environment } from '../../environments/environment';
import { Answer, Question, Survey, SurveyPayload } from '../models/survey.interface';

const EXPAND = 'questions_via_survey.answers_via_question';

type RawAnswer = RecordModel & Omit<Answer, 'id'> & { order_index: number };
type RawQuestion = RecordModel & Omit<Question, 'id' | 'answers'> & {
  order_index: number;
  expand?: { answers_via_question?: RawAnswer[] };
};
type RawSurvey = RecordModel & Omit<Survey, 'id' | 'questions'> & {
  expand?: { questions_via_survey?: RawQuestion[] };
};

/** Wraps all PocketBase database and realtime operations for the PollApp. */
@Injectable({ providedIn: 'root' })
export class PollService {
  private pb = new PocketBase(environment.pocketbaseUrl);

  constructor() {
    // Parallel requests to the same endpoint (e.g. creating answers, realtime reloads) must not cancel each other.
    this.pb.autoCancellation(false);
  }

  /** Returns all published and past surveys ordered by creation date. */
  async getSurveys(): Promise<Survey[]> {
    const records = await this.pb.collection('surveys').getFullList<RawSurvey>({
      filter: 'status = "published" || status = "past"',
      sort: '-created',
      expand: EXPAND,
    });
    return records.map((r) => this.mapSurvey(r));
  }

  /** Returns a single survey by its ID, including questions and answers. */
  async getSurveyById(id: string): Promise<Survey> {
    const record = await this.pb.collection('surveys').getOne<RawSurvey>(id, { expand: EXPAND });
    return this.mapSurvey(record);
  }

  /** Creates a new survey with its questions and answers; returns the new survey ID. */
  async createSurvey(payload: SurveyPayload): Promise<string> {
    const survey = await this.pb.collection('surveys').create({
      title: payload.title,
      description: payload.description,
      end_date: payload.end_date,
      category: payload.category,
      status: 'published',
    });
    await this.createQuestionsAndAnswers(survey.id, payload.questions);
    return survey.id;
  }

  /** Replaces a survey's metadata and all its questions/answers. */
  async updateSurvey(id: string, payload: SurveyPayload): Promise<void> {
    await this.pb.collection('surveys').update(id, {
      title: payload.title,
      description: payload.description,
      end_date: payload.end_date,
      category: payload.category,
    });
    await this.deleteQuestions(id);
    await this.createQuestionsAndAnswers(id, payload.questions);
  }

  /** Deletes a survey; questions and answers are removed by cascade delete. */
  async deleteSurvey(id: string): Promise<void> {
    await this.pb.collection('surveys').delete(id);
  }

  /** Atomically increments the vote count for a single answer. */
  async vote(answerId: string): Promise<void> {
    await this.pb.collection('answers').update(answerId, { 'vote_count+': 1 });
  }

  /** Subscribes to answer changes of the given survey; resolves to an unsubscribe function. */
  subscribeToAnswers(surveyId: string, callback: () => void): Promise<UnsubscribeFunc> {
    return this.pb.collection('answers').subscribe('*', () => callback(), {
      filter: this.pb.filter('question.survey = {:surveyId}', { surveyId }),
    });
  }

  /** Removes the given realtime subscription to prevent memory leaks. */
  async unsubscribe(unsubscribeFn: UnsubscribeFunc): Promise<void> {
    await unsubscribeFn();
  }

  private async createQuestionsAndAnswers(
    surveyId: string,
    questions: SurveyPayload['questions']
  ): Promise<void> {
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const question = await this.pb.collection('questions').create({
        survey: surveyId,
        text: q.text,
        allow_multiple: q.allow_multiple,
        order_index: qi,
      });
      await Promise.all(
        q.answers.map((text, ai) =>
          this.pb.collection('answers').create({
            question: question.id,
            text,
            vote_count: 0,
            order_index: ai,
          })
        )
      );
    }
  }

  /** Deletes all questions of a survey; their answers are removed by cascade delete. */
  private async deleteQuestions(surveyId: string): Promise<void> {
    const questions = await this.pb.collection('questions').getFullList({
      filter: this.pb.filter('survey = {:surveyId}', { surveyId }),
      fields: 'id',
    });
    await Promise.all(questions.map((q) => this.pb.collection('questions').delete(q.id)));
  }

  private mapSurvey(raw: RawSurvey): Survey {
    const questions = [...(raw.expand?.questions_via_survey ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q): Question => ({
        id: q.id,
        survey: q.survey,
        text: q.text,
        allow_multiple: q.allow_multiple,
        answers: [...(q.expand?.answers_via_question ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((a): Answer => ({
            id: a.id,
            question: a.question,
            text: a.text,
            vote_count: a.vote_count,
          })),
      }));

    return {
      id: raw.id,
      title: raw.title,
      description: raw.description || null,
      category: raw.category || null,
      // PocketBase returns dates as "YYYY-MM-DD HH:mm:ss.sssZ" or "" when empty.
      end_date: raw.end_date ? raw.end_date.slice(0, 10) : null,
      status: raw.status,
      created: raw.created,
      questions,
    };
  }
}
