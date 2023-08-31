import { h } from 'preact';

import { AnswerType, Question, SurveyAnswer, Theme } from '../../types';
import BooleanResponse from './BooleanResponse';
import { CTAResponse } from './CTAResponse';
import DateResponse from './DateResponse';
import RangeResponse from './RangeResponse';
import { SmileyResponse } from './SmileyResponse';
import TextResponse from './TextResponse';
import { ContactFormResponse } from './ContactFormResponse';

interface ResponseProps {
  question: Question;
  onAnswered: (answers: SurveyAnswer[]) => void;
  theme?: Theme;
  submitText?: string;
}

export default function Response({
  question,
  onAnswered,
  theme,
  submitText,
}: ResponseProps) {
  let element: h.JSX.Element | null = null;

  switch (question.type) {
    case AnswerType.TEXT:
      element = (
        <TextResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
          submitText={submitText}
        />
      );
      break;
    case AnswerType.SMILEY_SCALE:
      element = (
        <SmileyResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
        />
      );
      break;
    case AnswerType.DATE:
      element = (
        <DateResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
          submitText={submitText}
        />
      );
      break;
    case AnswerType.CTA:
      element = (
        <CTAResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
        />
      );
      break;
    case AnswerType.NPS:
      element = (
        <RangeResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
        />
      );
      break;
    case AnswerType.RATING:
      element = (
        <RangeResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
        />
      );
      break;
    case AnswerType.CSAT:
      element = <div>CSAT</div>;
      break;
    case AnswerType.MULTIPLE:
      element = <div>Multiple</div>;
      break;
    case AnswerType.SINGLE:
      element = <div></div>;
      break;
    case AnswerType.FORM:
      element = (
        <ContactFormResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
          submitText={submitText}
        />
      );
      break;
    case AnswerType.NUMERICAL_SCALE:
      element = <div>Numerical</div>;
      break;
    case AnswerType.BOOLEAN:
      element = (
        <BooleanResponse
          question={question}
          onAnswered={onAnswered}
          theme={theme}
        />
      );
      break;
  }

  return element;
}
