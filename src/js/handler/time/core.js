/**
 * @fileoverview Core methods for dragging actions
 * @author NHN Ent. FE Development Team <e0242@nhnent.com>
 */
'use strict';

var util = global.ne.util;
var datetime = require('../../datetime');
var domevent = require('../../common/domevent');
var Point = require('../../common/point');

/**
 * @mixin Time.Core
 */
var timeCore = {
    /**
     * Find nearest value from supplied params.
     * @param {number} value - value to find.
     * @param {array} nearest - nearest array.
     * @returns {number} nearest value
     */
    _nearest: function(value, nearest) {
        var diff = util.map(nearest, function(v) {
                return Math.abs(value - v);
            }),
            nearestIndex = util.inArray(Math.min.apply(null, diff), diff);

        return nearest[nearestIndex];
    },

    /**
     * Get Y index ratio(hour) in time grids by supplied parameters.
     * @param {number} baseMil - base milliseconds number for supplied height.
     * @param {number} height - container element height.
     * @param {number} y - Y coordinate to calculate hour ratio.
     * @returns {number} hour index ratio value.
     */
    _calcGridYIndex: function(baseMil, height, y) {
        // get ratio from right expression > point.y : x = session.height : baseMil
        // and convert milliseconds value to hours.
        var result = datetime.millisecondsTo('hour', (y * baseMil) / height),
            floored = result | 0,
            nearest = this._nearest(result - floored, [0, 1]);

        return floored + (nearest ? 0.5 : 0);
    },

    /**
     * Get function to makes event data from Time and mouseEvent
     * @param {Time} timeView - Instance of time view.
     * @returns {function} - Function that return event data from mouse event.
     */
    _retriveEventData: function(timeView) {
        var that = this,
            container = timeView.container,
            options = timeView.options,
            viewHeight = timeView.getViewBound().height,
            viewDate = timeView.getDate(),
            hourLength = options.hourEnd - options.hourStart,
            baseMil = datetime.millisecondsFrom('hour', hourLength);

        /**
         * @param {MouseEvent} mouseEvent - Mouse event object to get common event data.
         * @param {object} [extend] - Object to extend event data before return.
         * @returns {object} - Common event data for time.*
         */
        function getEventData(mouseEvent, extend) {
            var mouseY = Point.n(domevent.getMousePosition(mouseEvent, container)).y,
                gridYIndex,
                time;

            gridYIndex = that._calcGridYIndex(baseMil, viewHeight, mouseY);
            time = datetime.millisecondsFrom('hour', gridYIndex + options.hourStart);

            return util.extend({
                container: container,
                viewHeight: viewHeight,
                hourLength: hourLength,
                gridYIndex: gridYIndex,
                time: viewDate.getTime() + time,
                originEvent: mouseEvent
            }, extend || {});
        }

        return getEventData;
    },

    /**
     * Mixin method.
     * @param {(TimeCreation|TimeMove)} obj - Constructor functions
     */
    mixin: function(obj) {
        var proto = obj.prototype;
        util.forEach(timeCore, function(method, methodName) {
            if (methodName === 'mixin') {
                return;
            }

            proto[methodName] = method;
        });
    }
};

module.exports = timeCore;

