import { BlobReader, TextWriter, ZipReader, type Entry } from "@zip.js/zip.js";
import type { ScratchProjectObject } from "./scratch";

export type Project = {
  path: string;
  entry: FileSystemFileHandle;
  projectJSONEntry: Entry;
  projectObject: ScratchProjectObject;
};

type Match = {
  score: number;
  checks?: Check[];
  projectA: Project;
  projectB: Project;
};

type MatchGroup = Match[];

type Check = {
  subject: string;
  score: number;
};

export const getProjectsFromDirectory = async (
  dirHandle: FileSystemDirectoryHandle,
  path = ""
) => {
  const projects: Project[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind == "file" && entry.name.endsWith(".sb3")) {
      const zipFileReader = new BlobReader(await entry.getFile());
      const zipReader = new ZipReader(zipFileReader);
      const zipEntries = await zipReader.getEntries();
      const projectJSONEntry = zipEntries.find(
        (e) => e.filename == "project.json"
      );
      if (projectJSONEntry !== undefined) {
        const zipWriter = new TextWriter();
        const projectJSONBlob = await projectJSONEntry.getData(zipWriter);
        const projectObject = JSON.parse(projectJSONBlob);
        const project = {
          path: path + entry.name,
          entry,
          projectJSONEntry,
          projectObject,
        };
        projects.push(project);
      } else {
        console.log(`${path}/${entry.name} does't have a "project.json" file`);
      }
      zipReader.close();
    } else if (entry.kind == "directory") {
      projects.push(
        ...(await getProjectsFromDirectory(entry, `${entry.name}/`))
      );
    }
  }
  return projects;
};

export const plagiarism = async (projects: Project[]) => {
  const matchGroups: MatchGroup[] = [];
  const sortedProjects = projects
    .slice()
    .sort((a, b) =>
      a.projectJSONEntry.lastModDate > b.projectJSONEntry.lastModDate ? 1 : -1
    );
  for (const projectA of projects) {
    let group: MatchGroup;
    for (const projectB of projects) {
      if (projectA !== projectB) {
        let score = 0;
        const projectABlocks = getBlockIds(projectA.projectObject);
        const projectBBlocks = getBlockIds(projectB.projectObject);
        for (const block of projectBBlocks) {
          if (projectABlocks.indexOf(block)) {
            score++;
          }
        }
        matchGroups.push([{ projectA, projectB, score }]);
      }
    }
  }
  console.log(projects);
  return matchGroups;
};

function getBlockIds(project: ScratchProjectObject) {
  const blocks: string[] = [];
  for (const target of project.targets) {
    for (const key in target.blocks) {
      if (Object.prototype.hasOwnProperty.call(target.blocks, key)) {
        blocks.push(`${key} ${target.blocks[key].opcode}`);
      }
    }
  }
  return blocks;
}
