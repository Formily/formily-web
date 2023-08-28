import { LogicOperator, QuestionOption, Survey } from '../types';

export function onDOMReady(fn: () => void) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
};

export function deferSurveyActivation(
  survey: Survey,
  activateFn: (survey: Survey) => void
) {
  if (
    survey.trigger?.delay === undefined ||
    survey.trigger.delay < 0
  ) {
    return false;
  }

  console.info(
    'Deferring survey activation by ' + survey.trigger.delay
  );

  setTimeout(activateFn, survey.trigger.delay * 1000, survey);

  return true;
}

// See: https://stackoverflow.com/a/2117523
export function uuidv4() {
  if (typeof crypto === 'undefined') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
          c
      ) {
          var r = (Math.random() * 16) | 0,
              v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
      });
  }

  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      c =>
          (
              Number(c) ^
              (crypto.getRandomValues(new Uint8Array(1))[0] &
                  (15 >> (Number(c) / 4)))
          ).toString(16)
  );
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function propConditionsMatched(conditions: boolean[], operator: LogicOperator) {
  let conditionMatched = conditions.some(matched => matched);
  if (operator === LogicOperator.AND) {
    conditionMatched = conditions.every(matched => matched);
  }

  return conditionMatched;
}

function shuffle(options: QuestionOption[]) {
  for (let i = 0; i < options.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
};

export function shuffleArray(options: QuestionOption[], shuffleOption: string) {
  const optionsCopy = [...options];

  if (shuffleOption === "all") {
    shuffle(optionsCopy);
  } else if (shuffleOption === "exceptLast") {
    const lastElement = optionsCopy.pop();
    shuffle(optionsCopy);
  
    optionsCopy.push(lastElement as QuestionOption);
  }

  return optionsCopy;
}
