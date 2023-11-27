import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
import { ProjectPlagiarist } from "./plagiarism/detection";
import type { ScratchProjectObject } from "./scratch";

export type Project = {
  path: string;
  date: Date;
  scratch: ScratchProjectObject;
  plagiarists: ProjectPlagiarist[];
  plagiarizer: boolean;
};

export type FinderStrategy = "zip" | "folder";
export type AllowedFileTypes = FileSystemDirectoryHandle | File | Blob;

export const findProjects = async (
  strategy: FinderStrategy,
  file: AllowedFileTypes
) => {
  switch (strategy) {
    case "zip":
      return await findProjectsInZipFile(file as File);
    case "folder":
      return await findProjectsInDirectory(file as FileSystemDirectoryHandle);
  }
};

export const findProjectsInDirectory = async (
  dirHandle: FileSystemDirectoryHandle,
  basePath = ""
) => {
  const projects: Project[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind == "file" && entry.name.endsWith(".sb3")) {
      const project = await Project(
        await entry.getFile(),
        `/${basePath}${entry.name}`
      );
      if (project !== undefined) {
        projects.push(project);
      }
    } else if (entry.kind == "directory") {
      projects.push(
        ...(await findProjectsInDirectory(entry, `${entry.name}/`))
      );
    }
  }
  return projects;
};

export const findProjectsInZipFile = async (file: File) => {
  const projects: Project[] = [];
  const zipFileReader = new BlobReader(file);
  const zipReader = new ZipReader(zipFileReader);
  const zipEntries = await zipReader.getEntries();
  for await (const entry of zipEntries) {
    if (entry.filename.endsWith(".sb3")) {
      const zipWriter = new BlobWriter();
      const project = await Project(
        await entry.getData(zipWriter),
        entry.filename
      );
      if (project !== undefined) {
        projects.push(project);
      }
    }
  }
  return projects;
};

const Project = async (
  blob: Blob,
  path: string
): Promise<Project | undefined> => {
  const zipFileReader = new BlobReader(blob);
  const zipReader = new ZipReader(zipFileReader);
  const zipEntries = await zipReader.getEntries();
  const projectJSONEntry = zipEntries.find((e) => e.filename == "project.json");
  if (projectJSONEntry !== undefined) {
    const zipWriter = new TextWriter();
    const projectJSONBlob = await projectJSONEntry.getData(zipWriter);
    const scratch = JSON.parse(projectJSONBlob);
    const project = {
      path,
      date: projectJSONEntry.lastModDate,
      scratch,
      plagiarists: [],
      plagiarizer: false,
    };
    return project;
  } else {
    console.error(`${path} does't have a "project.json" file`);
  }
  zipReader.close();
};
