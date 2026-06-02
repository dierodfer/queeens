import type { RankingEntry } from '../../lib/ranking';
import { fmt } from '../../lib/format';
import type { Tr } from './types';

type RankingProps = {
  entries: RankingEntry[];
  boardLabel: string;
  tr: Tr;
};

export function Ranking({ entries, boardLabel, tr }: RankingProps) {
  if (entries.length === 0) return null;

  return (
    <section id="ranking" aria-label={tr('rankingAria')}>
      <h3>{tr('localRanking')}</h3>
      <p id="ranking-board">
        {tr('board')} {boardLabel}
      </p>
      <ol id="ranking-list">
        {entries.map((entry, idx) => (
          <li key={idx} className={`rank-item${idx === 0 ? ' is-top' : ''}`}>
            {fmt(entry.timeMs)}
          </li>
        ))}
      </ol>
    </section>
  );
}
