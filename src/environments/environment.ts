// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    getCSWRecordUrl: 'getKnownLayers.do',
    portalBaseUrl: '/VGL-Portal/',
    boundariesUrl: 'http://localhost:8080/geoserver/boundaries',
    boundaryLayersEmpty: [],  // if no geoserver with ABS boundary layers is available, rename this to boundaryLayers and remove (or rename) the boundaryLayers definition below
    boundaryLayers: [{ 'name': 'boundaries:CED_2018_AUST', 'description': 'Federal Electorates', 'nameAttribute': 'CED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#351c75' },
                    { 'name': 'boundaries:SED_2018_AUST', 'description': 'State Electorates', 'nameAttribute': 'SED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#38761d' },
                    { 'name': 'boundaries:LGA_2018_AUST', 'description': 'Local Gov Areas', 'nameAttribute': 'LGA_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#741b47' },
                    { 'name': 'boundaries:POA_2016_AUST', 'description': 'Postal Areas', 'nameAttribute': 'POA_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#134f5c' },
                    { 'name': 'boundaries:SSC_2016_AUST', 'description': 'Suburbs', 'nameAttribute': 'SSC_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#990000' }]
};
