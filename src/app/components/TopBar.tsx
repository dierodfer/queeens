import queeensImage from '../../assets/queeens-image.png';
import type { GameMode } from '../../i18n';
import { fmtClock } from '../../lib/format';
import { MODE_LABEL_KEYS } from '../constants';
import type { Tr } from './types';

type TopBarProps = {
  size: number | null;
  mode: GameMode | null;
  elapsed: number;
  queenCount: number;
  boardCount: number;
  version: string;
  blindPreviewActive: boolean;
  blindPreviewRemainingMs: number;
  onMenu: () => void;
  onNewBoard: () => void;
  onSkipBlind: () => void;
  skinEmoji: string;
  skinLabel: string;
  onCycleSkin: () => void;
  tr: Tr;
};

export function TopBar({
  size,
  mode,
  elapsed,
  queenCount,
  boardCount,
  version,
  blindPreviewActive,
  blindPreviewRemainingMs,
  onMenu,
  onNewBoard,
  onSkipBlind,
  skinEmoji,
  skinLabel,
  onCycleSkin,
  tr,
}: TopBarProps) {
  return (
    <>
      <header id="brand-header">
        <img id="brand-image" src={queeensImage} alt="Queeens" />
      </header>

      <div id="top-controls">
        <button id="menu-btn" onClick={onMenu}>
          {tr('menu')}
        </button>
        <button id="shuffle-btn" disabled={!size} onClick={onNewBoard}>
          {tr('newBoard')}
        </button>
        <button id="skin-btn" onClick={onCycleSkin} title={skinLabel}>
          {skinEmoji}
        </button>
      </div>

      <p id="timer">
        {tr('time')}: {fmtClock(elapsed)}
      </p>
      <p id="mode-label">
        {tr('mode')}: {mode ? tr(MODE_LABEL_KEYS[mode]) : tr('noMode')} · {tr('skin')}:{' '}
        {skinEmoji} {skinLabel}
      </p>
      {mode === 'blind' && blindPreviewActive && (
        <div id="blind-preview-wrap">
          <p id="blind-preview">
            {tr('memorizeBoard')}: {fmtClock(blindPreviewRemainingMs)}
          </p>
          <button id="blind-skip" onClick={onSkipBlind}>
            {tr('startNow')}
          </button>
        </div>
      )}
      <p id="queen-counter">
        {tr('queens')}: {queenCount}/{size ?? 0}
      </p>
      {size != null && size > 0 && (
        <p id="board-counter">
          {tr('boardsAvailable')}: {boardCount}
        </p>
      )}
      <p id="app-version">
        {tr('version')}: {version}
      </p>
    </>
  );
}
