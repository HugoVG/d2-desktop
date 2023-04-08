import { BoltIcon, ArrowDownOnSquareIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useState } from "react";
import { invoke } from '@tauri-apps/api/tauri';
import CodeEditor from './editor';
import Folder from "./folder";
// import { D2Logo } from './d2-logo.svg';

export default function Layout() {
  const [editorCode, setEditorCode] = useState("");
  const [svg, setSvg] = useState<string | null>(null);
  //Set the current file name to something random so that it doesn't match any file 
  const [currentFile, setCurrentFile] = useState<string>(RandomFileName());
  const [isNewFile, setIsNewFile] = useState<boolean>(true);
  async function fetchSvg() {
    try {
      console.log("I am trying to fetch svg")
      const input_data = editorCode;
      const result = await invoke<string>('execute_d2', { inputData: input_data, fileName: currentFile });
      setSvg(result);
    } catch (err) {
      console.error('Error executing d2:', err);
    }
  }

  function handleEditorChange(value: string, event: any) {
    console.log("here is the current model value:", value);
    setEditorCode(value);
  }

  function handleFileChange(value: string, event: any) {
    setIsNewFile(false);
    setCurrentFile(value);
  }
  function newFile(){
    setCurrentFile(RandomFileName());
    setIsNewFile(true);
    setEditorCode("");
  }

  return (
    <>
      <div className="flex h-screen flex-col">
        <header className="shrink-0 bg-gray-50">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 justify-self-start">
            <img
              className="h-8 w-auto justify-self-start"
              src="d2-logo.svg"
              alt="D2 Desktop"
            />
            { isNewFile === true ? 
              <input type="text" className="" value={currentFile} onChange={(e) => handleFileChange(e.target.textContent!,e)} />
              :
                <span className="truncate">{currentFile}</span>
            }
            <div className="flex items-center gap-x-8">
              <button onClick={(e) => {
                e.preventDefault();
                fetchSvg();
              }}
                type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300">
                <span className="sr-only">Generate</span>
                <BoltIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300">
                <span className="sr-only">Export</span>
                <ArrowDownOnSquareIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300">
                <span className="sr-only">Share</span>
                <ShareIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* 3 column wrapper */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left sidebar & main wrapper */}
          <div className="w-1/6">
            {/* Left column area */}
            <Folder setIsNewFile={newFile} currentFileName={currentFile} handleFileChange={handleFileChange} handleEditorChange={handleEditorChange} />
          </div>

          <div className="w-2/6">
            {/* Main area */}
            <CodeEditor editorCode={editorCode} handleEditorChange={handleEditorChange} />
          </div>


          <div className="w-3/6 overflow-auto">
            {/* Right column area */}
            {svg && (
              <div
                className="h-full object-contain"
                dangerouslySetInnerHTML={{ __html: svg }}
              ></div>
            )}

          </div>
        </div>
      </div >
    </>
  )
}

function RandomFileName() {
  let temp =  Math.random().toString(12).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  return temp + ".d2";
}

