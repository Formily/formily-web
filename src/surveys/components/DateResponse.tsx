import { h } from 'preact';
import { Button, Header } from '../../components';
import { Question, SurveyAnswer, Theme } from '../../types';

import { useState } from 'preact/hooks';
import { DatePicker } from '../../components';
import AnswerContainer from './AnswerContainer';

interface DateResponseProps {
  question: Question;
  onAnswered: (answers: SurveyAnswer[]) => void;
  submitText?: string;
  theme?: Theme;
}

export default function DateResponse({
  question,
  onAnswered,
  submitText,
  theme,
}: DateResponseProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>();

  const handleSubmit = (e: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    if (!selectedDate) return;
    onAnswered([{ answer: selectedDate.toISOString() }]);
  };

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      <div className='mr-6'>
        <Header
          title={question.label}
          color={theme?.question}
          description={question.description ?? 'Date'}
        />
      </div>

      <AnswerContainer>
        <DatePicker
          color={theme?.answer}
          clearIcon={null}
          calendarIcon={null}
          dayPlaceholder='DD'
          monthPlaceholder='MM'
          yearPlaceholder='YYYY'
          format='dd/MM/yyyy'
          value={selectedDate}
          onChange={(value) => setSelectedDate(value as Date)}
        />
      </AnswerContainer>

      <Button
        label={submitText ?? 'Submit'}
        color={theme?.button}
        size='full'
      />
    </form>
  );
}
