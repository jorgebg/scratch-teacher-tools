<script lang="ts">
  import { getProjectsFromDirectory, plagiarism, type Project } from "./lib/plagiarism";

  let folder: string;
  let projects: Project[] = []
  const pickAndCheckFolder = async () => {
    const dirHandle = await showDirectoryPicker();
    folder = dirHandle.name
    projects = await getProjectsFromDirectory(dirHandle)
  console.log(await plagiarism(projects));
  }
</script>

<main>
  <h1>Scratch Teacher Tools</h1>
  <h2>Plagiarism Checker</h2>
      <div>
        <button on:click={pickAndCheckFolder}>Check folder</button>
        {#if folder}
        <p>Folder: {folder}</p>
        <ul>
          {#each projects as project}
            <li>{project.path}</li>
          {/each}
        </ul>
        {/if}
      </div>
</main>

