import { Injectable } from '@angular/core';
import { serialize } from '@thi.ng/hiccup';
import { GraceStyleSettings } from './grace-graph.models';

/*
 * This is a static class designed to return style sheets for Geoserver GRACE layer
 */
@Injectable()
export class GraceStyleService {

    /**
     * Fetches the SLD_BODY parameter used to style a WMS request
     *
     * @method getGraceSld
     * @param layerName - name of Geoserver WMS layer e.g.'mascons_stage4_V003a'
     * @param styleName - arbitrary name of style e.g. 'mascons_style'
     * @param minValProperty - value property for the minimum bound
     * @param minColProperty - colour code property for the minimum bound
     * @param neutralValProperty - value property for the neutral bound
     * @param neutralColProperty - colour code property for the neutral bound
     * @param maxValProperty - value property for the maximum bound
     * @param maxColProperty - colour code property for the maximum bound
     * @return style sheet in string form
     */
    public static getGraceSld(layerName: string, styleName: string,
        styleSettings: GraceStyleSettings): string {
        const xmlHeader = serialize(['?xml', { 'version': '1.0', 'encoding': 'UTF-8' }]);
        const styledLayerAttrs = {
            'version': '1.0.0',
            'xmlns:sld': 'http://www.opengis.net/sld',
            'xmlns:ogc': 'http://www.opengis.net/ogc',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd'
        };
        const styledLayerDesc = (body: any) => ['sld:StyledLayerDescriptor', styledLayerAttrs, body]
        const namedLayer = (body: string) => ['sld:NamedLayer', null, body];
        const name = (nameStr: string) => ['sld:Name', null, nameStr];
        const userStyle = (body: string) => ['sld:UserStyle', null, body];
        const body1 = serialize(name(styleName)) + this.getFeatureTypeStyle(
            styleSettings.minValue, styleSettings.minColor, styleSettings.neutralValue,
            styleSettings.neutralColor, styleSettings.maxValue, styleSettings.maxColor);
        const body2 = serialize(name(layerName)) + serialize(userStyle(body1));
        return xmlHeader + serialize(styledLayerDesc(namedLayer(body2)));
    }

    /**
     * Assembles 'sld:FeatureTypeStyle' component of SLD_BODY parameter
     *
     * @method getFeatureTypeStyle
     * @param ccProperty - colour code property: either 'TenementType' or 'TenementStatus' or ''
     * @return XML 'sld:FeatureTypeStyle' string
     */
    private static getFeatureTypeStyle(minValProperty: number, minColProperty: string,
        neutralValProperty: number, neutralColProperty: string,
        maxValProperty: number, maxColProperty: string): string {

        const polygonSymbolizer = this.getPolySymbolizer(
            minValProperty, minColProperty, neutralValProperty, neutralColProperty,
            maxValProperty, maxColProperty);
        const rule = ['sld:Rule', null, polygonSymbolizer];
        return serialize(['sld:FeatureTypeStyle', null, rule]);
    }

    /**
     * Assembles 'sld:PolygonSymbolizer' component of SLD_BODY parameter
     *
     * @method getPolySymbolizer
     * @param fillColour colour of fill in polygon e.g. '#AA4499'
     * @param strokeColour colour of stroke in polygon e.g. '#AA4499'
     * @return XML 'sld:PolygonSymbolizer' string
     */
    private static getPolySymbolizer(minValue: number, minColor: string,
            neutralValue: number, neutralColor: string,
            maxValue: number, maxColor: string): string {
        const propertyName = ['ogc:PropertyName', null, 'estimate'];
        const literalMinVal = ['ogc:Literal', null, minValue];
        const literalMinCol = ['ogc:Literal', null, minColor];
        const literalNeutralVal = ['ogc:Literal', null, neutralValue];
        const literalNeutralCol = ['ogc:Literal', null, neutralColor];
        const literalMaxVal = ['ogc:Literal', null, maxValue];
        const literalMaxCol = ['ogc:Literal', null, maxColor];
        const literalType = ['ogc:Literal', null, 'color'];
        const func = ['ogc:Function', { 'name': 'Interpolate' },
            [propertyName, literalMinVal, literalMinCol, literalNeutralVal,
                literalNeutralCol, literalMaxVal, literalMaxCol, literalType]];
        const fillCss = ['sld:CssParameter', { 'name': 'fill' }, func];
        const fill = ['sld:Fill', null, fillCss];
        const strokeCss = ['sld:CssParameter', { 'name': 'stroke' }, func];
        const strokeWidthCss = ['sld:CssParameter', { 'name': 'stroke-width' }, 1];
        const stroke = ['sld:Stroke', null, [strokeCss, strokeWidthCss]];
        return serialize(['sld:PolygonSymbolizer', null, [fill, stroke]]);
    }

}
