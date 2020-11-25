import React, { useState, useEffect } from 'react';

import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import {parse} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {TripsLayer} from '@deck.gl/geo-layers'
// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
import * as d3 from "d3";
let SYRX = [-88.0433158, 43.0430893]

const AIR_PORTS =
  './woop.csv';
const INITIAL_VIEW_STATE = {
  latitude: 39,
  longitude: -98,
  zoom: 3,
  bearing: 0,
  pitch: 30
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

function Root() {
  const [data, setData] = useState([]);
  const [time, setTime] = useState(0)

  useEffect(() => {
   // Update the document title using the browser API
    let hi = async () => {
      let newData = await parse(fetch(AIR_PORTS), CSVLoader);
      setData(newData)
      window.newData = newData
      //console.log(newData.filter(d => d[4]).length)
    }

    hi()

 });

  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      console.log(info)
    }
  };
  let trips = data.map(d=> {

    return {
      waypoints: [{coordinates: SYRX, timestamp: 0},
                {coordinates: [d[5],d[4]] , timestamp: 1}
    ]
    }
  })
  window.trips = trips

  if(! data.length) return null
  //console.log(data.length)
  const layers = [
    new ScatterplotLayer({
      id: 'airports',
      data: data,
      // Styles
      filled: true,
      getRadius: f => 11,
      getFillColor: [200, 0, 80, 250],
      // Interactive props
      pickable: true,
      radiusMinPixels: 5,
      autoHighlight: true,
      getPosition: d => [d[5], d[4]],

      onClick
    }),

    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: d => d.waypoints.map(p => p.coordinates),

      // Styles
      getTimestamps: d => d.waypoints.map(p => p.timestamp),
   getColor: [253, 128, 93],
   opacity: 0.8,
   widthMinPixels: 5,
   rounded: true,
   trailLength: .05,
   currentTime: time / 100,

      onClick
    }),
  ];
  return (
    <div>
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
      <StaticMap mapStyle={MAP_STYLE} />
    </DeckGL>
    <input type="range" value={time} onChange={(e) => {console.log(e.target.value), setTime(+ e.target.value)}}class="input" style={{position:'absolute'}}/>

    </div>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
