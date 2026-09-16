import PromptBar from "./components/PromptBar.jsx";
import TopBar from "./components/TopBar.jsx";
import Viewport from "./components/Viewport.jsx";
import Toolbar from "./components/Toolbar.jsx";
import InspectorPanel from "./components/InspectorPanel.jsx";

export default function App() {
  return (
    <div className="relative w-screen h-screen">
      <Viewport />
      <Toolbar />
      <InspectorPanel />
      <TopBar />
      <PromptBar />
    </div>
  );
}