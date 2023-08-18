import { h, VNode } from 'preact';

export interface LabelProps {
  text: string;
  color: string;
}

export function Label({ text, color }: LabelProps): VNode {
  return (
    <h2 style={{ color }} className='text-xl font-medium'>
      {text}
    </h2>
  );
}
