import type { Tr } from './types';

type ResumeConfirmProps = Readonly<{
  boardLabel: string;
  onResume: () => void;
  onRestart: () => void;
  tr: Tr;
}>;

export function ResumeConfirm({ boardLabel, onResume, onRestart, tr }: ResumeConfirmProps) {
  return (
    <dialog
      id="resume-confirm"
      open
      className="popup show"
      aria-modal="true"
      aria-labelledby="resume-confirm-title"
    >
      <div>
        <h2 id="resume-confirm-title">{tr('resumeTitle')}</h2>
        <p>{tr('resumePrompt')}</p>
        {boardLabel && (
          <p id="resume-confirm-board">
            {tr('board')} {boardLabel}
          </p>
        )}
        <div id="resume-confirm-actions">
          <button type="button" id="resume-restart" onClick={onRestart}>
            {tr('resumeRestart')}
          </button>
          <button type="button" id="resume-continue-btn" onClick={onResume}>
            {tr('resumeContinue')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
