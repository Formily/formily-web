import { h, render } from 'preact';

import IntegraFlow from '..';
import {
  Context,
  RootFrame,
  RootFrameContainer,
  SdkEvent,
  TagManager,
  TargetingEngine
} from '../core';
import { ID, Survey, SurveyAnswer } from '../types';
import { deferSurveyActivation } from '../utils';

import App from './App';
import { SurveyLogic } from './logic';

export type SurveyManagerState =
  | 'loading'
  | 'ready'
  | 'running';

export class SurveyManager {
  private readonly client: IntegraFlow;
  private readonly context: Context;
  private readonly rootFrame: RootFrame;
  private readonly targetingEngine: TargetingEngine;
  private readonly surveyLogic: SurveyLogic;
  private readonly tagManager: TagManager;

  private surveyContainer: RootFrameContainer;
  private state?: SurveyManagerState;
  private surveys: Survey[];
  private activeSurveys: Survey[];

  constructor(client: IntegraFlow, ctx: Context, rootFrame: RootFrame) {
    this.surveys = [];
    this.activeSurveys = [];

    this.rootFrame = rootFrame;
    this.surveyContainer = rootFrame.createContainer('survey');
    this.client = client;
    this.context = ctx;

    this.targetingEngine = new TargetingEngine(ctx, this.onEventTracked);
    this.surveyLogic = new SurveyLogic();
    this.tagManager = new TagManager(ctx);

    this.setState('loading');
  }

  private onEventTracked = (event: SdkEvent) => {
    console.info('Survey trigger saw event', event);

    if (this.state !== 'ready') {
        console.info('Not ready, waiting on queue');
        return;
    }

    if (event.type === 'audienceUpdated') {
      this.loadSurveys();
      return;
    }

    this.evaluateTriggers();
  }

  private async onEnter(state: SurveyManagerState) {
    switch (state) {
      case 'loading':
        await this.loadSurveys();
        this.setState('ready');
        break;
      case 'ready':
        this.evaluateTriggers();
        this.renderSurvey();
        break;
      case 'running':
        break;
    }
  }

  private onQuestionAnswered = async (surveyId: ID, questionId: ID, answers: SurveyAnswer[]) => {
    await this.client.persistSurveyAnswers(surveyId, questionId, answers);
  }

  private onSurveyDisplayed = async (survey: Survey) => {
    await this.client.markSurveyAsSeen(survey.id, new Date(), survey.settings?.recurring);
  }

  private onSurveyClosed = async (surveyId: ID) => {
    await this.client.closeSurvey(surveyId);
  }

  private onSurveyCompleted = async (surveyId: ID) => {
    await this.client.markSurveyAsCompleted(surveyId);
  }

  private setState(state: SurveyManagerState) {
    console.info('Setting survey manager state:' + state);
    this.state = state;
    this.onEnter(state);
  }

  hideSurvey(surveyId: ID) {
    const name = this.surveyContainer.name;
    this.rootFrame.removeContainer(name);
    this.surveyContainer = this.rootFrame.createContainer(name)

    const idx = this.activeSurveys.findIndex(survey => survey.id === surveyId);
    if (idx === -1) {
      this.setState('ready');
      return;
    }

    this.activeSurveys.splice(idx, 1);

    this.setState('ready');
  }

  private renderSurvey(survey?: Survey) {
    if (survey) {
      this.render(survey);
      return;
    }

    if (this.activeSurveys.length > 0) {
      this.render(this.activeSurveys[0]);
    }
  }

  private render(survey: Survey) {
    if (!this.state || !survey) {
      return;
    }

    if (this.state !== 'ready') {
      return;
    }

    this.setState('running');

    const orderedQuestions = survey.questions.sort((a, b) => a.orderNumber - b.orderNumber);
    survey.questions = orderedQuestions;

    render(
      <App
        survey={survey}
        replaceTags={this.tagManager.replaceTags}
        getNextQuestionId={this.surveyLogic.getNextQuestionId}
        onQuestionAnswered={this.onQuestionAnswered}
        onSurveyDisplayed={this.onSurveyDisplayed}
        onSurveyClosed={this.onSurveyClosed}
        onSurveyCompleted={this.onSurveyCompleted}
      />,
      this.surveyContainer.element
    );
  }

  private async loadSurveys(): Promise<void> {
    const state = this.context.state;

    if (state?.surveys?.length === 0) {
      return Promise.resolve();
    }

    for (let survey of (state?.surveys || [])) {
      const isMatched = this.targetingEngine.evaluateAttributes(survey, state?.user);
      if (isMatched) {
        this.surveys.push(survey);
      }
    }

    return Promise.resolve();
  }

  private evaluateTriggers() {
    const matchedSurveys = this.targetingEngine.filterSurveys(this.surveys);

    this.activateSurveys(matchedSurveys);
  }

  private activateSurvey(survey: Survey) {
    if ((this.activeSurveys.findIndex(activeSurvey => survey.id === activeSurvey.id)) > -1) {
      return;
    }

    this.activeSurveys.push(survey);
  }

  private activateSurveys(surveys: Survey[]) {
    console.info('Will activate surveys: ', surveys);

    for (let i = 0; i < surveys.length; ++i) {
      const survey = surveys[i];

      if (deferSurveyActivation(survey, this.activateDeferredSurvey)) {
        continue;
      }

      this.activateSurvey(survey);
    }

    this.renderSurvey();
  }

  private activateDeferredSurvey(survey: Survey) {
    this.activateSurvey(survey as Survey);
    this.renderSurvey();
  }

  showSurvey(surveyId: ID) {
    const survey = this.context.surveys?.find(survey => survey.id === surveyId);

    if (survey) {
      const idx = this.activeSurveys.findIndex(survey => survey.id === surveyId);
      if (idx >= 0) {
        this.activeSurveys.splice(idx, 1);
      }

      this.activeSurveys.unshift(survey);
      this.renderSurvey();
    }
  }
}
