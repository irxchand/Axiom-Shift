import { TimeWindow, StudyBlock } from './planning.types.js';

export function checkTimeOverlap(window1: TimeWindow, window2: TimeWindow): boolean {
  return window1.startTime < window2.endTime && window1.endTime > window2.startTime;
}

export function validateStudyPlanCalendar(
  proposedBlocks: StudyBlock[],
  existingClasses: TimeWindow[]
): { isValid: boolean; collisions: string[] } {
  const collisions: string[] = [];

  for (let i = 0; i < proposedBlocks.length; i++) {
    const block = proposedBlocks[i];
    const blockDurationMs = block.window.endTime.getTime() - block.window.startTime.getTime();
    
    // Check 1: Did the AI propose a physically impossible time window?
    if (blockDurationMs <= 0) {
      collisions.push(`Task ${block.taskId} has an inverted or zero-duration time window.`);
      continue;
    }

    // Check 2: Does it overlap with a hardcoded lecture?
    for (const classWindow of existingClasses) {
      if (checkTimeOverlap(block.window, classWindow)) {
        collisions.push(`Task ${block.taskId} overlaps with a scheduled class.`);
      }
    }

    // Check 3: Does it overlap with another proposed study block?
    for (let j = i + 1; j < proposedBlocks.length; j++) {
      const other = proposedBlocks[j];
      if (checkTimeOverlap(block.window, other.window)) {
        collisions.push(`Task ${block.taskId} overlaps internally with proposed Task ${other.taskId}.`);
      }
    }
  }

  return {
    isValid: collisions.length === 0,
    collisions
  };
}