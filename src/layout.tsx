import { BoltIcon, ArrowDownOnSquareIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useState } from "react";
import { invoke } from '@tauri-apps/api/tauri';
import CodeEditor from './editor';
import Folder from "./folder";

export default function Layout() {
  const [editorCode, setEditorCode] = useState("");
  const [svg, setSvg] = useState<string | null>(null);

  async function fetchSvg() {
    try {
      console.log("I am trying to fetch svg")
      const input_data = editorCode;
      const result = await invoke<string>('execute_d2', { inputData: input_data });
      setSvg(result);
    } catch (err) {
      console.error('Error executing d2:', err);
    }
  }

  function handleEditorChange(value: string, event: any) {
    console.log("here is the current model value:", value);
    setEditorCode(value);
  }

  return (
    <>
      <div className="flex h-screen flex-col">
        <header className="shrink-0 bg-gray-50">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <img
              className="h-8 w-auto"
              src="data:image/png;base64,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"
              alt="D2 Desktop"
            />
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
            <Folder />
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

