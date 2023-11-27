import equal from "deep-equal";
import type { Project } from "../projects";
import type { Block, Target } from "../scratch";

export type Check = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  values: {
    older: any;
    newer: any;
  };
};

export class Checker {
  constructor(
    public readonly id: string,
    public readonly label: string,
    value?: Checker["value"],
    score?: Checker["score"]
  ) {
    if (value) {
      this.value = value;
    }
    if (score) {
      this.score = score;
    }
  }

  value(project: Project): any {
    return project;
  }
  score(
    older: ReturnType<this["value"]>,
    newer: ReturnType<this["value"]>
  ): Check["score"] {
    return Number(equal(older, newer));
  }
  maxScore(
    older: ReturnType<this["value"]>,
    newer: ReturnType<this["value"]>
  ): Check["maxScore"] {
    return 1;
  }
  compare(olderProject: Project, newerProject: Project): Check {
    const { id, label } = this;
    const older = this.value(olderProject);
    const newer = this.value(newerProject);
    const score = this.score(older, newer);
    const maxScore = this.maxScore(older, newer);
    return {
      id,
      label,
      score,
      maxScore,
      values: { older, newer },
    };
  }
}

export class ArrayChecker<T> extends Checker {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly aggregators: {
      block?: (block: { id: string; block: Block }) => T[];
      target?: (target: Target) => T[];
    }
  ) {
    super(id, label);
  }

  value(project: Project): T[] {
    const aggValue = [];
    for (const target of project.scratch.targets) {
      if (this.aggregators.target) {
        const value = this.aggregators.target(target);
        if (value) aggValue.push(...value);
      }
      if (this.aggregators.block) {
        for (const id in target.blocks) {
          const block = target.blocks[id];
          const value = this.aggregators.block({ id, block });
          if (value) aggValue.push(...value);
        }
      }
    }
    return aggValue;
  }

  score(older: T[], newer: T[]) {
    let score = 0;
    for (const newVal of newer) {
      if (older.find((oldVal) => equal(newVal, oldVal))) {
        score++;
      }
    }
    return score;
  }

  maxScore(older: T[], newer: T[]) {
    return Math.max(older.length, newer.length);
  }
}
export const CHECKERS = [
  new ArrayChecker("blockIds", "Block IDs", { block: ({ id }) => [id] }),
  new ArrayChecker("blockOpcodesInputs", "Block opcodes and inputs", {
    block: ({ block: { opcode, inputs } }) => [{ opcode, inputs }],
  }),
  new ArrayChecker(
    "blockPositions",
    "Starting block positions (defaults are equal)",
    {
      block: ({ block: { topLevel, x, y } }) => (topLevel ? [{ x, y }] : []),
    }
  ),
  new ArrayChecker(
    "targetDirectionPositions",
    "Target directions and positions (defaults are equal)",
    {
      target: ({ direction, x, y }) => (direction ? [{ direction, x, y }] : []),
    }
  ),
  new ArrayChecker(
    "targetVariables",
    "Target variable IDs (defaults are equal)",
    {
      target: ({ variables }) => Object.keys(variables),
    }
  ),
  new ArrayChecker("targetCostumes", "Target costumes (defaults are equal)", {
    target: ({ costumes }) => costumes,
  }),
  new ArrayChecker("targetSounds", "Target sounds (defaults are equal)", {
    target: ({ sounds }) => sounds,
  }),
];

export const DEFAULT_CHECKER_IDS = ["blockIds"];
