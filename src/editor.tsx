import Editor from "@monaco-editor/react";
import "./App.css";

export default function CodeEditor(props: any) {

  const { editorCode, handleEditorChange } = props;

  return (
    <>
      <Editor
        value={editorCode}
        onChange={handleEditorChange}
      />
    </>
  )
}



