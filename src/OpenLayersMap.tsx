import React, { useEffect, useState } from "react";
import Map from "ol/map";
import View from "ol/view";
import TileLayer from "ol/layer/tile";
import OSM from "ol/source/osm";
import FullScreen from "ol/control/fullscreen";
import VectorLayer from "ol/layer/vector";
import GeoJSON from "ol/format/geojson";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import "ol/ol.css";

let key = process.env.REACT_APP_API_KEY;
//let googleKey = "AIzaSyAfwLdxM7Vh_v39TYXR60mNDhuslVYds0Y";

const OpenLayersMap: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string>("osmStandardView");
  const [tileLayers, setTileLayers] = useState<{ [key: string]: TileLayer }>({
    osmStandardView: new TileLayer({
      source: new OSM(),
      visible: true,
      title: "osmStandardView",
    }),
    osmHumanitarianView: new TileLayer({
      source: new OSM({
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      }),
      visible: false,
      title: "osmHumanitarianView",
    }),
    osmLibertyView: new TileLayer({
      source: new OSM({
        url: `https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=${key}`,
      }),
      visible: false,
      title: "osmLibertyView",
    }),
    osm3DView: new TileLayer({
      source: new OSM({
        url: `https://maps.geoapify.com/v1/tile/maptiler-3d/{z}/{x}/{y}.png?apiKey=${key}`,
      }),
      visible: false,
      title: "osm3DView",
    }),
    osmBrightView: new TileLayer({
      source: new OSM({
        url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${key}`,
      }),
      visible: false,
      title: "osmBrightView",
    }),
  });

  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: Object.values(tileLayers),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    const fullScreenControl = new FullScreen();
    map.addControl(fullScreenControl);

    return () => {
      map.setTarget(null);
    };
  }, []);

  const changeTile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tileKey: string = event.target.value;
    setSelectedTile(tileKey);

    // Update visibility of layers
    const updatedLayers = { ...tileLayers };
    Object.keys(updatedLayers).forEach((key) => {
      updatedLayers[key].setVisible(key === tileKey);
    });
    setTileLayers(updatedLayers);
  };

  // Function to return custom label for radio button
  const getCustomLabel = (title: string): string => {
    switch (title) {
      case "osmStandardView":
        return "Standard View";
      case "osmHumanitarianView":
        return "Humanitarian View";
      case "osmLibertyView":
        return "Liberty View";
      case "osm3DView":
        return "3D View";
      case "osmBrightView":
        return "OSM Bright View";
      default:
        return "";
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <FormControl>
        <RadioGroup
          row
          name="radio-buttons-group"
          value={selectedTile}
          onChange={changeTile}
        >
          {Object.values(tileLayers).map((layer) => (
            <FormControlLabel
              key={layer.get("title")}
              value={layer.get("title")}
              control={<Radio />}
              label={getCustomLabel(layer.get("title"))} // Pass custom label here
            />
          ))}
        </RadioGroup>
      </FormControl>
      <div id="map" style={{ width: "100%", height: "650px" }} />
    </div>
  );
};

export default OpenLayersMap;
