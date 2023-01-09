import { useState } from "react";
import "./App.css";
import AppleMusic from "./AppleMusic";
import Spotify from "./Spotify";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <AppleMusic />
      <Spotify />
    </div>
  );
}

export default App;
