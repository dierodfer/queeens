import type { Tr } from './types';

type ExitConfirmProps = Readonly<{
  onCancel: () => void;
  onConfirm: () => void;
  tr: Tr;
}>;

export function ExitConfirm({ onCancel, onConfirm, tr }: ExitConfirmProps) {
  return (
    <dialog
      id="exit-confirm"
      open
      className="popup show"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
    >
      <div>
        <h2 id="exit-confirm-title">{tr('confirmExitTitle')}</h2>
        <p>{tr('confirmExit')}</p>
        <div id="exit-confirm-actions">
          <button type="button" id="exit-cancel" onClick={onCancel}>
            {tr('cancel')}
          </button>
          <button type="button" id="exit-confirm-btn" onClick={onConfirm}>
            {tr('continue')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
