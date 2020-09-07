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
     * @param styleSettings - GRACE bounds and colours
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
        const body1 = serialize(name(styleName)) + this.getFeatureTypeStyle(styleSettings);
        const body2 = serialize(name(layerName)) + serialize(userStyle(body1));
        return xmlHeader + serialize(styledLayerDesc(namedLayer(body2)));
    }

    /**
     * Assembles 'sld:FeatureTypeStyle' component of SLD_BODY parameter
     *
     * @method getFeatureTypeStyle
     * @param styleSettings - the GRACE style settings
     * @return XML 'sld:FeatureTypeStyle' string
     */
    private static getFeatureTypeStyle(styleSettings: GraceStyleSettings): string {

        const polygonSymbolizer = this.getPolySymbolizer(styleSettings);
        const rule = ['sld:Rule', null, polygonSymbolizer];
        return serialize(['sld:FeatureTypeStyle', null, rule]);
    }

    /**
     * Assembles 'sld:PolygonSymbolizer' component of SLD_BODY parameter
     *
     * @method getPolySymbolizer
     * @param styleSettings - the GRACE style settings
     * @return XML 'sld:PolygonSymbolizer' string
     */
    private static getPolySymbolizer(styleSettings: GraceStyleSettings): string {
        const propertyName = ['ogc:PropertyName', null, 'estimate'];
        const literalMinVal = ['ogc:Literal', null, styleSettings.minValue];
        const literalMinCol = ['ogc:Literal', null, styleSettings.minColor];
        const literalNeutralVal = ['ogc:Literal', null, styleSettings.neutralValue];
        const literalNeutralCol = ['ogc:Literal', null, styleSettings.neutralColor];
        const literalMaxVal = ['ogc:Literal', null, styleSettings.maxValue];
        const literalMaxCol = ['ogc:Literal', null, styleSettings.maxColor];
        const literalColorType = ['ogc:Literal', null, 'color'];
        const func = ['ogc:Function', { 'name': 'Interpolate' },
            [propertyName, literalMinVal, literalMinCol, literalNeutralVal,
                literalNeutralCol, literalMaxVal, literalMaxCol, literalColorType]];
        const fillCss = ['sld:CssParameter', { 'name': 'fill' }, func];

        let fillCssOpacity = [];
        if (styleSettings.transparentNeutralColor) {
            const literalOpaqueVal = ['ogc:Literal', null, 1];
            const literalTransparentVal = ['ogc:Literal', null, 0];
            const literalNumericType = ['ogc:Literal', null, 'numeric'];
            const opacityFillFunc = ['ogc:Function', { 'name': 'Interpolate' },
            [propertyName, literalMinVal, literalOpaqueVal, literalNeutralVal,
                literalTransparentVal, literalMaxVal, literalOpaqueVal, literalNumericType]];
            fillCssOpacity = ['sld:CssParameter', {'name': 'fill-opacity'}, opacityFillFunc];
        }
        const fill = ['sld:Fill', null, [fillCss, fillCssOpacity]];

        let stroke = [];
        if (styleSettings.transparentNeutralColor === false) {
            const strokeCss = ['sld:CssParameter', { 'name': 'stroke' }, func];
            const strokeWidthCss = ['sld:CssParameter', { 'name': 'stroke-width' }, 1];
            stroke = ['sld:Stroke', null, [strokeCss, strokeWidthCss]];
        }

        return serialize(['sld:PolygonSymbolizer', null, [fill, stroke]]);
    }

}
