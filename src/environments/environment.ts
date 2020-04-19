// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    getCSWRecordUrl: 'getKnownLayers.do',
    portalBaseUrl: '/VGL-Portal/',
    boundariesUrl: 'http://dcdpgeo.data61.csiro.au:8080/geoserver/boundaries',
    boundaryLayersEmpty: [],  // if no geoserver with ABS boundary layers is available, rename this to boundaryLayers and remove (or rename) the boundaryLayers definition below
    boundaryLayers: [
        //{ 'name': 'boundaries:CED_2018_AUST', 'description': 'Federal Electorates', 'nameAttribute': 'CED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#351c75' },
        //{ 'name': 'boundaries:SED_2018_AUST', 'description': 'State Electorates', 'nameAttribute': 'SED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#38761d' },
        //{ 'name': 'boundaries:LGA_2018_AUST', 'description': 'Local Gov Areas', 'nameAttribute': 'LGA_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#741b47' },
        //{ 'name': 'boundaries:POA_2016_AUST', 'description': 'Postal Areas', 'nameAttribute': 'POA_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#134f5c' },
        //{ 'name': 'boundaries:SSC_2016_AUST', 'description': 'Suburbs', 'nameAttribute': 'SSC_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#990000' }
    ],
    baseMapLayers: [
        { value: 'OSM', viewValue: 'OpenStreetMap', layerType: 'OSM' },
        { value: 'World_Topo_Map', viewValue: 'ESRI World Topographic', layerType: 'ESRI' },
        { value: 'World_Imagery', viewValue: 'ESRI World Imagery', layerType: 'ESRI' },
        { value: 'Reference/World_Boundaries_and_Places', viewValue: 'ESRI World Imagery With Labels', layerType: 'ESRI' },
        { value: 'NatGeo_World_Map', viewValue: 'ESRI National Geographic Map', layerType: 'ESRI' },
        { value: 'World_Terrain_Base', viewValue: 'ESRI Terrain Base', layerType: 'ESRI' },
        { value: 'World_Street_Map', viewValue: 'ESRI Street Map', layerType: 'ESRI' },
        { value: 'Canvas/World_Dark_Gray_Base', viewValue: 'ESRI Dark Gray', layerType: 'ESRI' },
        { value: 'Canvas/World_Light_Gray_Base', viewValue: 'ESRI Light Gray', layerType: 'ESRI' },
        { value: 'h', viewValue: 'Google Road Names', layerType: 'Google' },
        { value: 'm', viewValue: 'Google Road Map', layerType: 'Google' },
        { value: 's', viewValue: 'Google Satellite', layerType: 'Google' },
        { value: 'y', viewValue: 'Google Satellite & Roads', layerType: 'Google' },
        { value: 't', viewValue: 'Google Terrain', layerType: 'Google' },
        { value: 'p', viewValue: 'Google Terrain & Roads', layerType: 'Google' },
        { value: 'r', viewValue: 'Google Road without Building', layerType: 'Google' },
        { value: 'Road', viewValue: 'Bing Roads', layerType: 'Bing' },
        { value: 'Aerial', viewValue: 'Bing Aerial', layerType: 'Bing' },
        { value: 'AerialWithLabels', viewValue: 'Bing Aerial With Labels', layerType: 'Bing' }
    ],
    forceAddLayerViaProxy: []
};
