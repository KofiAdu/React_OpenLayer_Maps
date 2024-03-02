import React, { useEffect, useState } from "react";
import Map from "ol/map";
import View from "ol/view";
import TileLayer from "ol/layer/tile";
import OSM from "ol/source/osm";
import FullScreen from "ol/control/fullscreen";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import GeoJSON from "ol/format/geojson";
import Select from "ol/interaction/select";
import Modify from "ol/interaction/modify";
import Style from "ol/style";
import Fill from "ol/style/fill";
import Stroke from "ol/style/stroke";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import "ol/ol.css";

let key = process.env.REACT_APP_API_KEY;

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
    osmStreetView: new TileLayer({
      source: new OSM({
        url: "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=7psNiiTOSN7L4hRijREo",
        tileSize: 512,
        crossOrigin: "anonymous",
      }),
      visible: false,
      title: "osmStreetView",
    }),
  });  

  useEffect(() => {
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson",
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      
    });

    const map = new Map({
      target: "map",
      layers: [...Object.values(tileLayers), vectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 2.5,
        minZoom: 2,
      }),
     // interactions: [selectInteraction, modifyInteraction],
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
      case "osmStreetView":
        return "Street View";
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
              label={getCustomLabel(layer.get("title"))}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <div id="map" style={{ width: "100%", height: "650px" }} />
      <div id="info">&nbsp;</div>
    </div>
  );
};

export default OpenLayersMap;
