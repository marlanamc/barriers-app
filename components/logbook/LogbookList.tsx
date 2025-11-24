'use client';

import { ThoughtItem } from './ThoughtItem';
import type { Thought } from '@/hooks/useThoughts';

interface LogbookListProps {
  thoughts: Thought[];
  onConvertToTask: (id: string) => void;
  onConvertToNote: (id: string) => void;
  onArchive: (id: string) => void;
}

export function LogbookList({
  thoughts,
  onConvertToTask,
  onConvertToNote,
  onArchive,
}: LogbookListProps) {
  return (
    <div className="space-y-3">
      {thoughts.map((thought) => (
        <ThoughtItem
          key={thought.id}
          thought={thought}
          onConvertToTask={onConvertToTask}
          onConvertToNote={onConvertToNote}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
