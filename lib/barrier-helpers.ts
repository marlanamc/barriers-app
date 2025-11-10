import type { BarrierSelectionState } from './checkin-context';

export function hasBarrierSelection(barrier?: BarrierSelectionState | null): boolean {
  return Boolean(
    barrier &&
      (
        barrier.barrierTypeSlug ||
        barrier.barrierTypeId ||
        barrier.custom?.trim()
      )
  );
}
