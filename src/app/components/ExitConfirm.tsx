import type { Tr } from './types';

type ExitConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
  tr: Tr;
};

export function ExitConfirm({ onCancel, onConfirm, tr }: ExitConfirmProps) {
  return (
    <div
      id="exit-confirm"
      className="popup show"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
    >
      <div>
        <h2 id="exit-confirm-title">{tr('confirmExitTitle')}</h2>
        <p>{tr('confirmExit')}</p>
        <div id="exit-confirm-actions">
          <button id="exit-cancel" onClick={onCancel}>
            {tr('cancel')}
          </button>
          <button id="exit-confirm-btn" onClick={onConfirm}>
            {tr('continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
