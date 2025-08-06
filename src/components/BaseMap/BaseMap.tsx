import React, { useEffect, useState, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";

import { Map, Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import CircularProgress from "@mui/material/CircularProgress";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import styles from "./BaseMap.module.scss";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";

import { GLOBAL_LULC_URL, REGIONS_URL } from "../../constants";

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

interface BaseMapProps {
  protoLayerOn: boolean;
}

export default function BaseMap({ protoLayerOn }: BaseMapProps) {
  // const {t} = useTranslation()
  // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const defaultLon = 178.4; //TODO: provide functionality to zoom into general user browser location
  const defaultLat = -17.3;
  const defaultMapZoom = 10;
  const mapRef = useRef(null);
  const [viewportBounds, setViewportBounds] = useState([]);

  // Demo for COG protocol: https://github.com/geomatico/maplibre-cog-protocol/blob/main/README.md
  useEffect(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    maplibregl.addProtocol("cog", cogProtocol);
    return () => {
      maplibregl.removeProtocol("pmtiles");
      maplibregl.removeProtocol("cog");
    };
  }, []);

  if (
    !import.meta.env.VITE_MAPTILER_API_KEY ||
    import.meta.env.VITE_MAPTILER_API_KEY.trim() === ""
  ) {
    throw new Error(
      "Missing or empty API key: VITE_MAPTILER_API_KEY. Please set it in your environment variables.",
    );
  }
  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  return (
    <div className={styles["map-wrap"]}>
      {!isMapLoaded && (
        <CircularProgress
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto",
            height: "99%", //rotation causes overflow issues
          }}
        />
      )}
      <Map
        id="satellite-map"
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/basic/style.json?key=${apiKey}`}
        onLoad={() => setIsMapLoaded(true)}
      >
        <Source
          id="lulc-raster"
          type="raster"
          url={`cog://${GLOBAL_LULC_URL}${viewportBounds.length > 0 ? `?bbox=${viewportBounds.join(",")}` : ""}`}
          tileSize={256}
          maxzoom={14}
          minzoom={10}
        >
          <Layer
            id="lulc-layer"
            type="raster"
            source="lulc-raster"
            source-layer="LULC_20202_Reclassified_colored"
          />
        </Source>
      </Map>
    </div>
  );
}
