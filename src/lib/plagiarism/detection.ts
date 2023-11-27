import equal from "deep-equal";
import { type Project } from "../projects";
import { CHECKERS, DEFAULT_CHECKER_IDS, type Check } from "./checkers";

export class ProjectPlagiarist {
  constructor(
    public parent: Project,
    public project: Project,
    public score: number = 0,
    public maxScore: number = 0,
    public checks: Check[] = []
  ) {}
}

export class PlagiarismDetection {
  constructor(public projects: Project[]) {}
  compare(parent: Project, child: Project, checkerIds = DEFAULT_CHECKER_IDS) {
    const plagiarism = new ProjectPlagiarist(parent, child);
    for (const checker of CHECKERS) {
      if (checkerIds.includes(checker.id)) {
        let check = checker.compare(parent, child);
        plagiarism.checks.push(check);
        plagiarism.score += check.score;
        plagiarism.maxScore += check.maxScore;
      }
    }
    return plagiarism;
  }
  detect(checkerIds = DEFAULT_CHECKER_IDS) {
    const analyzed: [string, string][] = [];
    const sortedProjects = this.projects
      .slice()
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    const result: Project[] = [];
    for (const a of sortedProjects) {
      for (const b of sortedProjects) {
        if (
          a !== b &&
          !analyzed.find((pair) => equal(pair, [a.path, b.path].sort()))
        ) {
          const plagiarism = this.compare(a, b, checkerIds);
          if (plagiarism.score > 0) {
            a.plagiarists.push(plagiarism);
            b.plagiarizer = true;
          }
          analyzed.push([a.path, b.path].sort() as [string, string]);
        }
      }
      if (!a.plagiarizer) {
        result.push(a);
      }
    }
    return result;
  }
}
