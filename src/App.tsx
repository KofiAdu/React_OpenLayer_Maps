import React, { useState } from "react";
import OpenLayersMap from "./OpenLayersMap";
import Airports from "./components/Airports";
import { Box } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";

function App() {
  const [layer, setLayer] = useState<HTMLElement | null>(null);

  const handleSwitchLayer = () => {};
  return (
    <Box>
      <div>
        <LayersIcon />
        <OpenLayersMap />
      </div>
    </Box>
  );
}

export default App;
