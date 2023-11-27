<script lang="ts">
  import { CHECKERS, DEFAULT_CHECKER_IDS } from "./lib/plagiarism/checkers";
  import { PlagiarismDetection } from "./lib/plagiarism/detection";
  import {
    findProjects,
    type AllowedFileTypes,
    type FinderStrategy,
    type Project,
  } from "./lib/projects";

  const EXAMPLE_ZIP_FILE_URL = `${window.location.href}examples.zip`;

  let strategy: FinderStrategy;
  let file: AllowedFileTypes;
  let fetchStatus: string | null;
  let projects: Project[];
  let checkedProjects: Project[];
  let checkerIds = DEFAULT_CHECKER_IDS.slice();

  const pickAndCheckLocalFolder = async () => {
    file = await showDirectoryPicker();
    strategy = "folder";
    if (file) {
      await checkProjects();
    }
  };

  const uploadAndCheckZipFile = async (e: Event) => {
    const inputFiles = (e.target as HTMLInputElement).files;
    if (inputFiles != null && inputFiles.length > 0) {
      file = inputFiles[0];
      strategy = "zip";
      await checkProjects();
    }
  };

  const fetchAndCheckRemoteZipFile = async (e: Event) => {
    const url = prompt("Enter the URL of the ZIP file", EXAMPLE_ZIP_FILE_URL);
    if (url) {
      fetchStatus = `Fetching ${url}..`;
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        if (blob) {
          file = blob;
          strategy = "zip";
          fetchStatus = url;
          await checkProjects();
        }
      } catch (error) {
        fetchStatus = `Couldn't fetch ${url}`;
      }
    }
  };

  const checkProjects = async () => {
    projects = await findProjects(strategy, file);
    checkedProjects = new PlagiarismDetection(projects).detect(checkerIds);
  };
</script>

<div>
  <fieldset class="checkers">
    <legend>Checks to make</legend>

    {#each CHECKERS as checker}
      <div>
        <label
          ><input type="checkbox" bind:group={checkerIds} value={checker.id} />
          {checker.label}</label
        >
      </div>
    {/each}
    <button
      on:click={() => (checkerIds = DEFAULT_CHECKER_IDS.slice())}
      style:float="right">Reset</button
    >
  </fieldset>
  <fieldset class="target">
    <legend>Target to check</legend>
    <div>
      <label for="pick">Pick local folder: </label>
      <button id="pick" on:click={pickAndCheckLocalFolder}>Choose Folder</button
      >
      {strategy == "folder" && file instanceof FileSystemDirectoryHandle
        ? file?.name
        : "No folder chosen"}
    </div>
    <div>
      <label for="upload">Upload ZIP file:</label>
      <input
        id="upload"
        on:change={uploadAndCheckZipFile}
        type="file"
        accept=".zip"
      />
    </div>
    <div>
      <label for="fetch">Fetch ZIP URL:</label>
      <button id="fetch" on:click={fetchAndCheckRemoteZipFile}
        >Choose URL</button
      >
      {fetchStatus || "No URL chosen"}
    </div>
    <button
      on:click={checkProjects}
      disabled={projects === undefined}
      style:float="right">Rerun check</button
    >
  </fieldset>
  {#if checkedProjects !== undefined}
    <fieldset>
      <legend>Plagiarism checks</legend>
      {#each checkedProjects as project}
        <details>
          <summary>
            <code>{project.path}</code>
            <div style:color="grey">{project.date.toLocaleString()}</div>
            <div style:color={project.plagiarists.length ? "red" : "green"}>
              Plagiarists: {project.plagiarists.length}
            </div>
          </summary>
          {#if project.plagiarists.length > 0}
            {#each project.plagiarists as plagiarist}
              <details class="plagiarist">
                <summary>
                  <code>{plagiarist.project.path}</code>
                  <div style:color="grey">
                    {plagiarist.project.date.toLocaleString()}
                  </div>
                  <div style:color={plagiarist.score ? "red" : "green"}>
                    Score: {plagiarist.score}/{plagiarist.maxScore}
                  </div>
                </summary>
                <div>
                  {#each plagiarist.checks as check}
                    {check.label}:
                    <span style:color={check.score ? "red" : "green"}
                      >{check.score}/{check.maxScore}</span
                    >
                    <div class="compare">
                      <div>
                        Original
                        <pre>{JSON.stringify(
                            check.values.older,
                            undefined,
                            2
                          )}</pre>
                      </div>
                      <div>
                        Copy
                        <pre>{JSON.stringify(
                            check.values.newer,
                            undefined,
                            2
                          )}</pre>
                      </div>
                    </div>
                  {/each}
                </div>
              </details>
            {/each}
          {:else}
            No plagiarists
          {/if}
        </details>
      {/each}
    </fieldset>
    <fieldset>
      <legend>Scratch project.json documents</legend>
      {#each projects as project}
        <details>
          <summary><code>{project.path}</code></summary>
          <pre>
              {JSON.stringify(project.scratch, undefined, 2)}
            </pre>
        </details>
      {/each}
    </fieldset>
  {/if}
</div>

<style>
  details {
    cursor: pointer;
  }

  details > div {
    margin-left: 1em;
    border: 1px solid grey;
    padding: 1em;
  }

  summary > div {
    margin-left: 1em;
  }

  fieldset.target label {
    width: 7em;
    display: inline-block;
  }

  .plagiarist {
    margin-left: 1em;
  }

  .compare {
    display: flex;
    justify-content: center;
  }

  .compare > div:first-child {
    background-color: rgba(230, 97, 0, 0.25);
  }
  .compare > div:last-child {
    background-color: rgba(93, 58, 155, 0.25);
  }
</style>
