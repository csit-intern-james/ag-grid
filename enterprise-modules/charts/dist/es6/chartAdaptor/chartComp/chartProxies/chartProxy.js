var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { _, Events, } from "@ag-grid-community/core";
import { palettes } from "../../../charts/chart/palettes";
import { DropShadow } from "../../../charts/scene/dropShadow";
import { Padding } from "../../../charts/util/padding";
import { CategoryAxis } from "../../../charts/chart/axis/categoryAxis";
var ChartProxy = /** @class */ (function () {
    function ChartProxy(chartProxyParams) {
        var _this = this;
        this.getChart = function () { return _this.chart; };
        this.isDarkTheme = function () { return _this.chartProxyParams.isDarkTheme(); };
        this.getFontColor = function () { return _this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'rgb(87, 87, 87)'; };
        this.getAxisGridColor = function () { return _this.isDarkTheme() ? 'rgb(100, 100, 100)' : 'rgb(219, 219, 219)'; };
        this.getBackgroundColor = function () { return _this.isDarkTheme() ? '#2d3436' : 'white'; };
        this.getChartPaddingOption = function (property) { return _this.chartOptions.padding ? "" + _this.chartOptions.padding[property] : ''; };
        this.getShadowEnabled = function () { return !!_this.getShadowProperty('enabled'); };
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
    }
    ChartProxy.prototype.recreateChart = function (options) {
        if (this.chart) {
            this.destroyChart();
        }
        this.chart = this.createChart(options || this.chartOptions);
    };
    ChartProxy.prototype.initChartOptions = function () {
        var processChartOptions = this.chartProxyParams.processChartOptions;
        // allow users to override options before they are applied
        if (processChartOptions) {
            var params = { type: this.chartType, options: this.getDefaultOptions() };
            var overriddenOptions = processChartOptions(params);
            var safeOptions = this.getDefaultOptions();
            // ensure we have everything we need, in case the processing removed necessary options
            _.mergeDeep(safeOptions, overriddenOptions, false);
            this.overridePalette(safeOptions);
            this.chartOptions = safeOptions;
        }
        else {
            this.chartOptions = this.getDefaultOptions();
        }
        // we want to preserve the existing width/height if an existing chart is being changed to a different type,
        // so this allows the chart defaults to be overridden
        this.chartOptions.width = this.chartProxyParams.width || this.chartOptions.width;
        this.chartOptions.height = this.chartProxyParams.height || this.chartOptions.height;
    };
    ChartProxy.prototype.overridePalette = function (chartOptions) {
        if (!this.chartProxyParams.allowPaletteOverride) {
            return;
        }
        var _a = this.getPredefinedPalette(), defaultFills = _a.fills, defaultStrokes = _a.strokes;
        var seriesDefaults = chartOptions.seriesDefaults;
        var fills = seriesDefaults.fill.colors, strokes = seriesDefaults.stroke.colors;
        var fillsOverridden = fills && fills.length > 0 && fills !== defaultFills;
        var strokesOverridden = strokes && strokes.length > 0 && strokes !== defaultStrokes;
        if (fillsOverridden || strokesOverridden) {
            this.customPalette = {
                fills: fillsOverridden ? fills : defaultFills,
                strokes: strokesOverridden ? strokes : defaultStrokes
            };
        }
    };
    ChartProxy.prototype.getChartOptions = function () {
        return this.chartOptions;
    };
    ChartProxy.prototype.getCustomPalette = function () {
        return this.customPalette;
    };
    ChartProxy.prototype.getChartOption = function (expression) {
        return _.get(this.chartOptions, expression, undefined);
    };
    ChartProxy.prototype.setChartOption = function (expression, value) {
        _.set(this.chartOptions, expression, value);
        var mappings = {
            'legend.item.marker.strokeWidth': 'legend.markerStrokeWidth',
            'legend.item.marker.size': 'legend.markerSize',
            'legend.item.marker.padding': 'legend.markerPadding',
            'legend.item.label.fontFamily': 'legend.labelFontFamily',
            'legend.item.label.fontStyle': 'legend.labelFontStyle',
            'legend.item.label.fontWeight': 'legend.labelFontWeight',
            'legend.item.label.fontSize': 'legend.labelFontSize',
            'legend.item.label.color': 'legend.labelColor',
            'legend.item.paddingX': 'legend.itemPaddingX',
            'legend.item.paddingY': 'legend.itemPaddingY',
        };
        _.set(this.chart, mappings[expression] || expression, value);
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getSeriesOption = function (expression) {
        return _.get(this.chartOptions.seriesDefaults, expression, undefined);
    };
    ChartProxy.prototype.setSeriesOption = function (expression, value) {
        _.set(this.chartOptions.seriesDefaults, expression, value);
        var mappings = {
            'stroke.width': 'strokeWidth',
            'stroke.opacity': 'strokeOpacity',
            'fill.opacity': 'fillOpacity',
            'tooltip.enabled': 'tooltipEnabled',
            'callout.colors': 'calloutColors',
            'callout.strokeWidth': 'calloutStrokeWidth',
            'callout.length': 'calloutLength',
        };
        var series = this.chart.series;
        series.forEach(function (s) { return _.set(s, mappings[expression] || expression, value); });
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.setTitleOption = function (property, value) {
        this.chartOptions.title[property] = value;
        if (!this.chart.title) {
            this.chart.title = {};
        }
        this.chart.title[property] = value;
        if (property === 'text') {
            this.setTitleOption('enabled', _.exists(value));
        }
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.setChartPaddingOption = function (property, value) {
        var padding = this.chartOptions.padding;
        if (!padding) {
            padding = this.chartOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 };
            this.chart.padding = new Padding(0);
        }
        padding[property] = value;
        this.chart.padding[property] = value;
        this.chart.performLayout();
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getShadowProperty = function (property) {
        var seriesDefaults = this.chartOptions.seriesDefaults;
        return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
    };
    ChartProxy.prototype.setShadowProperty = function (property, value) {
        var seriesDefaults = this.chartOptions.seriesDefaults;
        if (!seriesDefaults.shadow) {
            seriesDefaults.shadow = {
                enabled: false,
                blur: 0,
                xOffset: 0,
                yOffset: 0,
                color: 'rgba(0,0,0,0.5)'
            };
        }
        seriesDefaults.shadow[property] = value;
        var series = this.getChart().series;
        series.forEach(function (s) {
            if (!s.shadow) {
                var shadow = new DropShadow();
                shadow.enabled = false;
                shadow.blur = 0;
                shadow.xOffset = 0;
                shadow.yOffset = 0;
                shadow.color = 'rgba(0,0,0,0.5)';
                s.shadow = shadow;
            }
            s.shadow[property] = value;
        });
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.raiseChartOptionsChangedEvent = function () {
        var event = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.chartType,
            chartPalette: this.chartProxyParams.getChartPaletteName(),
            chartOptions: this.chartOptions,
        });
        this.chartProxyParams.eventService.dispatchEvent(event);
    };
    ChartProxy.prototype.getDefaultFontOptions = function () {
        return {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            color: this.getFontColor()
        };
    };
    ChartProxy.prototype.getDefaultDropShadowOptions = function () {
        return {
            enabled: false,
            blur: 5,
            xOffset: 3,
            yOffset: 3,
            color: 'rgba(0, 0, 0, 0.5)',
        };
    };
    ChartProxy.prototype.getPredefinedPalette = function () {
        return palettes.get(this.chartProxyParams.getChartPaletteName());
    };
    ChartProxy.prototype.getPalette = function () {
        return this.customPalette || this.getPredefinedPalette();
    };
    ChartProxy.prototype.getDefaultChartOptions = function () {
        var _a = this.getPredefinedPalette(), fills = _a.fills, strokes = _a.strokes;
        var fontOptions = this.getDefaultFontOptions();
        return {
            background: {
                fill: this.getBackgroundColor(),
                visible: true,
            },
            width: 800,
            height: 400,
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            title: __assign(__assign({}, fontOptions), { enabled: false, fontWeight: 'bold', fontSize: 16 }),
            subtitle: __assign(__assign({}, fontOptions), { enabled: false }),
            legend: {
                enabled: true,
                position: 'right',
                padding: 20,
                item: {
                    label: __assign({}, fontOptions),
                    marker: {
                        type: 'square',
                        size: 15,
                        padding: 8,
                        strokeWidth: 1,
                    },
                    paddingX: 16,
                    paddingY: 8,
                },
            },
            seriesDefaults: {
                fill: {
                    colors: fills,
                    opacity: 1,
                },
                stroke: {
                    colors: strokes,
                    opacity: 1,
                    width: 1,
                },
                highlightStyle: {
                    fill: 'yellow',
                }
            }
        };
    };
    ChartProxy.prototype.transformData = function (data, categoryKey) {
        if (this.chart.axes.filter(function (a) { return a instanceof CategoryAxis; }).length < 1) {
            return data;
        }
        // replace the values for the selected category with a complex object to allow for duplicated categories
        return data.map(function (d, index) {
            var value = d[categoryKey];
            var valueString = value && value.toString ? value.toString() : '';
            var datum = __assign({}, d);
            datum[categoryKey] = { id: index, value: value, toString: function () { return valueString; } };
            return datum;
        });
    };
    ChartProxy.prototype.destroy = function () {
        this.destroyChart();
    };
    ChartProxy.prototype.destroyChart = function () {
        var parentElement = this.chartProxyParams.parentElement;
        var canvas = parentElement.querySelector('canvas');
        if (canvas) {
            parentElement.removeChild(canvas);
        }
        // store current width and height so any charts created in the future maintain the size
        if (this.chart) {
            this.chartOptions.width = this.chart.width;
            this.chartOptions.height = this.chart.height;
            this.chart.destroy();
            this.chart = null;
        }
    };
    return ChartProxy;
}());
export { ChartProxy };
