import { fmt } from '../../lib/format';
import type { Tr } from './types';

type WinPopupProps = Readonly<{
  elapsed: number;
  onRetry: () => void;
  onNext: () => void;
  tr: Tr;
}>;

export function WinPopup({ elapsed, onRetry, onNext, tr }: WinPopupProps) {
  return (
    <dialog id="win" open className="popup show" aria-modal="true" aria-labelledby="win-title">
      <div>
        <h2 id="win-title">{tr('congrats')}</h2>
        <p>{tr('allQueensPlaced')}</p>
        <p id="win-time">
          {tr('tookTime')} {fmt(elapsed)}.
        </p>
        <button
          type="button"
          id="retry-board"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
        >
          {tr('retryBoard')}
        </button>
        <button
          type="button"
          id="next-board"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          {tr('nextBoard')}
        </button>
      </div>
    </dialog>
  );
}
