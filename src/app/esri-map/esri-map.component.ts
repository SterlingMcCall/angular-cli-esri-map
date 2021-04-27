/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { loadModules } from "esri-loader";
import esri = __esri; // Esri TypeScript Types

import { counts, countsSmall } from './shape-id-counts.json';



import Map from "@arcgis/core/Map";
import config from "@arcgis/core/config";
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import * as watchUtils from '@arcgis/core/core/watchUtils';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FieldInfoFormat from '@arcgis/core/popup/support/FieldInfoFormat';
import FieldInfo from '@arcgis/core/popup/FieldInfo';
import FieldsContent from '@arcgis/core/popup/content/FieldsContent';
import * as esriColor from '@arcgis/core/smartMapping/renderers/color';

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit {

  esriMap: esri.Map;

  ngOnInit() {

    config.apiKey = "<<REDACTED>>";

    this.esriMap = new Map({
      basemap: "dark-gray-vector"
    });

    const view = new MapView({
      map: this.esriMap,
      center: [-7, 53],
      zoom: 10,
      container: "esri-map"
    });

    let choroplethLayer = new FeatureLayer({
      url: 'https://services3.arcgis.com/L1ZxtnKjdtyq5SLi/arcgis/rest/services/ireland_level_2/FeatureServer',
      popupTemplate: {
        title: "Block Group {shapeName}",
        content: [
          new FieldsContent({
            fieldInfos: [
              new FieldInfo({
                fieldName: "shapeName",
                label: "Name"
              }),
              new FieldInfo({
                fieldName: "Shape__Area",
                label: "Area",
                format: new FieldInfoFormat({
                  digitSeparator: true,
                  places: 0
                })
              })
            ]
          })
        ]
      }
    });

    const generateValueExpression = (obj: { [key: string]: number }): string => {
      return `
      var dict = Dictionary('${JSON.stringify(obj)}');
      if (HasKey(dict, $feature.shapeID)) {
          return dict[$feature.shapeID];
      } else {
          return 0;
      }
      `;
    };

    esriColor.createClassBreaksRenderer({
      layer: choroplethLayer,
      valueExpression: generateValueExpression(countsSmall),
      view: view,
      classificationMethod: 'equal-interval',
      numClasses: 6,
      legendOptions: {
        title: "Land Area"
      }

    }).then(({ renderer }) => {
      choroplethLayer.renderer = renderer;
      console.log(renderer);
      renderer.visualVariables;
      this.esriMap?.add(choroplethLayer);
    });
    this.esriMap?.add(choroplethLayer);

  }
}
