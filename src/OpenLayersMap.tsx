import React, { useEffect, useState } from "react";
import * as ol from "ol";
import * as olStyle from "ol/style";
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
import Style from "ol/style/style";
import Stroke from "ol/style/stroke";
import Fill from "ol/style/fill";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Popover,
  Typography,
} from "@mui/material";
import "ol/ol.css";

let key = process.env.REACT_APP_API_KEY;

const OpenLayersMap: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string>("osmStandardView");
  const [hoveredFeatureProperties, setHoveredFeatureProperties] = useState<
    object | null
  >(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
      url: "https://openlayers.org/data/vector/ecoregions.json",
    });

    /*
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    */

    /*
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature: any) => {
        // You can add logic here to style features based on their properties
        console.log(feature)
        return new Style({
          stroke: new Stroke({
            color: feature.get('COLOR') === 'value' ? '#0000FF' : '#ffcc33',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        });
      },
    });
    */

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature: any) => {
        console.log(feature);
        // Get the background color of the feature
        const bgColor = feature.get("COLOR");

        let fillColor = "rgba(255, 255, 255, 0.2)"; // Default fill color
        if (bgColor) {
          fillColor = bgColor;
        }

        return new Style({
          stroke: new Stroke({
            color: "white", // Stroke color
            width: 0.1,
          }),
          fill: new Fill({
            color: fillColor,
          }),
        });
      },
    });

    const fullScreenControl = new FullScreen();
    const selectInteraction = new Select();
    const modifyInteraction = new Modify({
      features: selectInteraction.getFeatures(),
    });

    const map = new Map({
      target: "map",
      layers: [...Object.values(tileLayers), vectorLayer],
      //controls: [fullScreenControl],
      view: new View({
        center: [0, 0],
        zoom: 2.4,
        minZoom: 2,
      }),
      //this overwrites the default interactions
      //interactions: defaultInteractions().extend([selectInteraction, modifyInteraction]),
    });

    map.addControl(fullScreenControl);
    map.addInteraction(selectInteraction);
    map.addInteraction(modifyInteraction);

    // Highlight feature on hover
    const handleMapPointerMove = (event: any) => {
      const pixel = event.pixel;
      const feature = event.map.forEachFeatureAtPixel(
        pixel,
        (feature: any) => feature
      );

      if (feature) {
        //console.log(feature.getProperties())
        setHoveredFeatureProperties(feature.getProperties());
        setAnchorEl(event.map.getTargetElement());
        setMousePosition({ x: event.pixel[0], y: event.pixel[1] });
      } else {
        setHoveredFeatureProperties(null);
        setAnchorEl(null);
      }
    };

    map.on("pointermove", handleMapPointerMove);

    return () => {
      map.removeInteraction(selectInteraction);
      map.removeInteraction(modifyInteraction);
      map.setTarget(null);
      map.un("pointermove", handleMapPointerMove);
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

  const open = Boolean(hoveredFeatureProperties);

  return (
    <div style={{ position: "relative", width: "100%", height: "95vh" }}>
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
      <div id="map" style={{ width: "100%", height: "calc(100% - 50px)" }} />
      {open && (
        <div
          className="popover"
          style={{
            position: "absolute",
            top: calculatePopoverPosition(
              mousePosition.y,
              window.innerHeight,
              150
            ),
            left: calculatePopoverPosition(
              mousePosition.x,
              window.innerWidth,
              300
            ),
            backgroundColor: hoveredFeatureProperties
              ? hoveredFeatureProperties.COLOR
              : "#fff",
            border: "1px solid #ccc",
            color: "white",
            borderRadius: "4px",
            padding: "10px",
            boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
            zIndex: 999,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <Typography>
            {hoveredFeatureProperties && (
              <ul>
                <li>
                  <strong>BIOME NAME:</strong>{" "}
                  {hoveredFeatureProperties.BIOME_NAME}
                </li>
                <li>
                  <strong>ECO NAME:</strong> {hoveredFeatureProperties.ECO_NAME}
                </li>
                <li>
                  <strong>NNH NAME:</strong> {hoveredFeatureProperties.NNH_NAME}
                </li>
                <li>
                  <strong>REALM:</strong> {hoveredFeatureProperties.REALM}
                </li>
              </ul>
            )}
          </Typography>
        </div>
      )}
    </div>
  );
};
const calculatePopoverPosition = (
  mousePos: number,
  viewportSize: number,
  popoverSize: number
) => {
  const spaceBelowMouse = viewportSize - mousePos;
  const spaceAboveMouse = mousePos;
  const spaceLeftOfMouse = mousePos;
  const spaceRightOfMouse = viewportSize - mousePos;
  const buffer = 10; // Adjust buffer space as needed

  if (spaceBelowMouse > popoverSize + buffer) {
    // Enough space below the mouse
    return mousePos + buffer;
  } else if (spaceAboveMouse > popoverSize + buffer) {
    // Enough space above the mouse
    return mousePos - popoverSize - buffer;
  } else if (spaceLeftOfMouse > popoverSize + buffer) {
    // Enough space to the left of the mouse
    return mousePos - popoverSize - buffer;
  } else {
    // Otherwise, position to the right of the mouse
    return mousePos + buffer;
  }
};

export default OpenLayersMap;
