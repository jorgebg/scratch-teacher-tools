import { BlobReader, TextReader, ZipReader } from "@zip.js/zip.js";
import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

console.log(BlobReader, TextReader, ZipReader);

function App() {
  const [folder, setFolder] = useState("");

  async function loadFolder() {
    const dirHandle = await showDirectoryPicker();
    for await (const entry of dirHandle.values()) {
      if (entry.kind == "file" && entry.name.endsWith(".sb3")) {
        console.log(entry.kind, entry.name);
      }
    }
    setFolder(dirHandle.name);
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => loadFolder()}>folder is {folder}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
