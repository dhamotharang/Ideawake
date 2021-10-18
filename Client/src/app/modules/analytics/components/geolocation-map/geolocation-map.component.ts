import { first, nth } from 'lodash';
import * as mapboxgl from 'mapbox-gl';

import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-geolocation-map',
  templateUrl: './geolocation-map.component.html',
  styleUrls: ['./geolocation-map.component.scss']
})
export class GeolocationMapComponent implements OnInit, OnChanges {
  @Input() analytics;
  @Input() style = 'mapbox://styles/mapbox/dark-v10';
  @Input() height_500 = false;
  @Input() zoom = 2;

  private map: mapboxgl.Map;
  center;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    if (this.analytics) {
      const features = [];
      this.analytics.forEach((element) => {
        features.push({
          type: 'feature',
          properties: {
            mag: element.points
          },
          geometry: {
            type: 'Point',
            coordinates: [
              nth(first(element.coordinates), 1),
              first(first(element.coordinates))
            ]
          }
        });
      });

      const mapData = {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
          }
        },
        features
      };

      this.center = first(features).geometry.coordinates;

      this.drawMap();
      this.addLayers(mapData);
      this.addMapControls();
    }
  }

  private drawMap() {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessKey,
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: this.center
    });
  }

  private addLayers(mapData) {
    this.map.on('load', () => {
      this.map.addSource('earthquakes', {
        type: 'geojson',
        data: mapData
      });

      this.map.addLayer(
        {
          id: 'earthquakes-heat',
          type: 'heatmap',
          source: 'earthquakes',
          maxzoom: 10,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'mag'],
              0,
              0,
              6,
              1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1,
              9,
              3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.2,
              'rgb(103,169,207)',
              0.4,
              'rgb(209,229,240)',
              0.6,
              'rgb(253,219,199)',
              0.8,
              'rgb(239,138,98)',
              1,
              'rgb(178,24,43)'
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              2,
              9,
              20
            ],
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
          }
        },
        'waterway-label'
      );

      this.map.addLayer(
        {
          id: 'earthquakes-point',
          type: 'circle',
          source: 'earthquakes',
          minzoom: 7,
          paint: {
            // Size circle radius by earthquake magnitude and zoom level
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7,
              ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
              16,
              ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
            ],
            // Color circle by earthquake magnitude
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'mag'],
              1,
              'rgba(33,102,172,0)',
              2,
              'rgb(103,169,207)',
              3,
              'rgb(209,229,240)',
              4,
              'rgb(253,219,199)',
              5,
              'rgb(239,138,98)',
              6,
              'rgb(178,24,43)'
            ],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            // Transition from heatmap to circle layer by zoom level
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
          }
        },
        'waterway-label'
      );
    });
  }

  private addMapControls() {
    this.map.addControl(new mapboxgl.NavigationControl());
  }
}
