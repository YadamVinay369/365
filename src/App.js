import "./App.css";
import DailyTask from "./DailyTask";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />
      <DailyTask />
    </div>
  );
}

export default App;
