import { useRef } from "react";
import Editor from "./Editor";


function App() {
  const quillRef = useRef<any>(null);

  return <Editor ref={quillRef} readOnly={false} />;
}

export default App;
