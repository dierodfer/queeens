import { fmt } from '../../lib/format';
import type { Tr } from './types';

type WinPopupProps = {
  elapsed: number;
  onRetry: () => void;
  onNext: () => void;
  tr: Tr;
};

export function WinPopup({ elapsed, onRetry, onNext, tr }: WinPopupProps) {
  return (
    <div
      id="win"
      className="popup show"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <div>
        <h2 id="win-title">{tr('congrats')}</h2>
        <p>{tr('allQueensPlaced')}</p>
        <p id="win-time">
          {tr('tookTime')} {fmt(elapsed)}.
        </p>
        <button
          id="retry-board"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
        >
          {tr('retryBoard')}
        </button>
        <button
          id="next-board"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          {tr('nextBoard')}
        </button>
      </div>
    </div>
  );
}
