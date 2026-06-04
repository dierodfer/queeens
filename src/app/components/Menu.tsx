import type { BlindLevel, GameMode, Lang } from '../../i18n';
import {
  BLIND_LEVEL_LABEL_KEYS,
  LEVEL_OPTIONS,
  MODE_LABEL_KEYS,
  MODE_RULE_KEYS,
} from '../constants';
import type { Tr } from './types';

const MODES: GameMode[] = ['classic', 'twister', 'blind'];
const BLIND_LEVELS: BlindLevel[] = ['easy', 'medium', 'hard'];

type MenuProps = {
  lang: Lang;
  onToggleLang: () => void;
  mode: GameMode | null;
  onSelectMode: (mode: GameMode) => void;
  blindLevel: BlindLevel | null;
  onSelectBlindLevel: (level: BlindLevel) => void;
  onStartGame: (n: number) => void;
  tr: Tr;
};

export function Menu({
  lang,
  onToggleLang,
  mode,
  onSelectMode,
  blindLevel,
  onSelectBlindLevel,
  onStartGame,
  tr,
}: MenuProps) {
  return (
    <div id="menu" className="popup show">
      <div id="lang-switch" aria-label={tr('languageAria')}>
        <button className="mode-btn active lang-toggle-btn" onClick={onToggleLang}>
          {lang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
      </div>

      <div id="mode-switch" role="tablist" aria-label={tr('modeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? 'mode-btn active' : 'mode-btn'}
            onClick={() => onSelectMode(m)}
          >
            {tr(MODE_LABEL_KEYS[m])}
          </button>
        ))}
      </div>

      {mode ? (
        <>
          <section id="mode-rules" aria-live="polite">
            <h4>
              {tr('rules')}: {tr(MODE_LABEL_KEYS[mode])}
            </h4>
            <ul>
              {MODE_RULE_KEYS[mode].map((ruleKey) => (
                <li key={ruleKey}>{tr(ruleKey)}</li>
              ))}
            </ul>
          </section>

          {mode === 'blind' && (
            <section id="blind-levels" aria-live="polite">
              <h4>{tr('difficulty')}</h4>
              <div id="blind-level-switch" role="tablist" aria-label={tr('blindDifficultyAria')}>
                {BLIND_LEVELS.map((level) => (
                  <button
                    key={level}
                    role="tab"
                    aria-selected={blindLevel === level}
                    className={blindLevel === level ? 'mode-btn active' : 'mode-btn'}
                    onClick={() => onSelectBlindLevel(level)}
                  >
                    {tr(BLIND_LEVEL_LABEL_KEYS[level])}
                  </button>
                ))}
              </div>
              {!blindLevel && <p id="blind-hint">{tr('pickDifficulty')}</p>}
            </section>
          )}

          {(mode !== 'blind' || blindLevel) &&
            LEVEL_OPTIONS.map((n) => (
              <button key={n} className="size-btn" onClick={() => onStartGame(n)}>
                {n}×{n}
              </button>
            ))}
        </>
      ) : null}
    </div>
  );
}
