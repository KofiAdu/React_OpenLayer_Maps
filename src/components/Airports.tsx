import React, { useEffect, useState } from "react";
import Map from "ol/map";
import View from "ol/view";
import TileLayer from "ol/layer/tile";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import GeoJSON from "ol/format/geojson";
import Select from "ol/interaction/select";
import Modify from "ol/interaction/modify";
import XYZ from "ol/source/xyz";
import Style from "ol/style/style";
import Icon from "ol/style/icon";
import LocalAirportTwoToneIcon from "@mui/icons-material/LocalAirportTwoTone";

function Airports() {
  const [hoveredFeatureProperties, setHoveredFeatureProperties] = useState<
    object | null
  >(null);

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson",
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  //console.log(vectorLayer);
  useEffect(() => {
    const selectInteraction = new Select();
    const modifyInteraction = new Modify({
      features: selectInteraction.getFeatures(),
    });
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            //url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
            url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          }),
          visible: true,
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2.4,
        minZoom: 2,
      }),
    });

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
        setHoveredFeatureProperties(feature.getProperties());
        console.log(hoveredFeatureProperties);
      } else {
        setHoveredFeatureProperties(null);
      }
    };

    map.on("click", handleMapPointerMove);

    return () => {
      map.setTarget(null);
    };
  }, []);
  return <div id="map" style={{ width: "100%", height: "95%" }} />;
}

export default Airports;
