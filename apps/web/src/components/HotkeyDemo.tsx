// components/HotkeyDemo.tsx
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";

const HotkeyDemo: React.FC = () => {
  useHotkeys("shift+a", () => alert("Shift + A was pressed!"), {
    enableOnFormTags: true,
  });
  useHotkeys("control+s", (event) => {
    event.preventDefault(); // Prevent browser's save dialog
    alert("Ctrl + S was pressed! (Save action)");
  });

  return (
    <div>
      <h1>Hotkey Demo</h1>
      <p>Try pressing "Shift + A" or "Control + S"</p>
      <input type="text" placeholder="Type here..." />
    </div>
  );
};

export default HotkeyDemo;
