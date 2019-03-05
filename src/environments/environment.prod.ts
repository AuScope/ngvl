export const environment = {
    production: true,
    getCSWRecordUrl: 'getKnownLayers.do',
    portalBaseUrl: '/VGL-Portal/',
    // portalBaseUrl: 'http://gis-dev-or.it.csiro.au:8080/VGL-Portal/',
    boundariesUrl: 'http://localhost:8080/geoserver/boundaries',
    boundaryLayersEmpty: [],   // if no geoserver with ABS boundary layers is available, rename this to boundaryLayers and remove (or rename) the boundaryLayers definition below
    boundaryLayers: [{ 'name': 'CED_2018_AUST', 'description': 'Federal Electorates', 'nameAttribute': 'CED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#351c75' },
                    { 'name': 'SED_2018_AUST', 'description': 'State Electorates', 'nameAttribute': 'SED_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#38761d' },
                    { 'name': 'LGA_2018_AUST', 'description': 'Local Gov Areas', 'nameAttribute': 'LGA_NAME_2018', 'areaAttribute': 'AREA_ALBERS_SQKM', 'colour': '#741b47' },
                    { 'name': 'POA_2016_AUST', 'description': 'Postal Areas', 'nameAttribute': 'POA_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#134f5c' },
                    { 'name': 'SSC_2016_AUST', 'description': 'Suburbs', 'nameAttribute': 'SSC_NAME16', 'areaAttribute': 'AREASQKM16', 'colour': '#990000' }]
};
