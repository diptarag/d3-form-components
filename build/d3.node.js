'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var SmartLabel = _interopDefault(require('fusioncharts-smartlabel'));
var d3Selection = require('d3-selection');
var d3Transition = require('d3-transition');

function getSmartComputedStyle (group, css) {
    var testText = 'W',
        mandatoryStyle = {'fill-opacity': 0},
        className = typeof css === 'string' ? css : undefined,
        svgText,
        computedStyle,
        styleForSmartLabel;

    svgText = group.append('text').text(testText);

    if (className) {
        svgText.attr('class', className);
    }

    svgText.style(mandatoryStyle);

    computedStyle = window.getComputedStyle(svgText.node());
    styleForSmartLabel = {
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        fontStyle: computedStyle.fontStyle
    };

    svgText.remove();

    return styleForSmartLabel;
}

function getTextDimensions (text, className, group, smartLabel) {
    var style = getSmartComputedStyle(group, className),
        dimensions;

    smartLabel.setStyle(style);
    dimensions = smartLabel.getOriSize(text);
    return {
        width: dimensions.width,
        height: dimensions.height
    };
}

function mergeConf (source, sink, theirsMergeEnabled) {
    var key, sourceVal;

    for (key in source) {
        sourceVal = source[key];

        if (sourceVal === undefined || sourceVal === null) { continue; }

        if (theirsMergeEnabled) {
            if (sink[key]) { continue; }
            sink[key] = sourceVal;
        } else {
            if (typeof sourceVal === 'object') {
                if (sink[key] === undefined) {
                    sink[key] = {};
                }
                mergeConf(sourceVal, sink[key], theirsMergeEnabled);
            }
            else {
                sink[key] = sourceVal;
            }
        }
    }
}

function setStyle(selection, styles) {
    var key;

    for (key in styles) {
        selection.style(key, styles[key]);
    }
}

function setAttrs(selection, attrs) {
    var key;

    for (key in attrs) {
        selection.attr(key, attrs[key]);
    }
}

function isDIV (ele) {
    if (ele && ele.nodeName && ele.nodeName.toUpperCase() === 'DIV') {
        return true;
    }

    return false;
}

var PX$1 = 'px';
var DEFAULT_TIMEOUT = 300;
var smartLabel$1 = new SmartLabel(new Date().getTime());
var d3 = window.d3;

function ListContainer (groupId) {
    this.groupId = groupId;
    this.listItems = [];
    this.hideFnIds = [];
}

ListContainer.prototype.init = function (containerElem) {
    var defaultStyle,
        self = this;

    this.container = d3.select(containerElem);
    this.container.node().groupId = this.groupId;
    defaultStyle = {
        position : 'absolute',
        'z-index' : 999999,
        overflow : 'wrap',
        display: 'none'
    };

    self.on('mouseout', function (d) {
        var e = d3.event.toElement || d3.event.relatedTarget;

        if (e && (e.groupId === d.groupId)) {
            return;
        }
        self.hide();
    }, 'default');

    setStyle(this.container, defaultStyle);
};

ListContainer.prototype.getContainer = function () {
    return this.container;
};

ListContainer.prototype.setParentListContainer = function (parentContainer) {
    this.parentListCon = parentContainer;
};

ListContainer.prototype.getDimensions = function () {
    var container = this.container,
        node = container.node(),
        dim;

    container.style('display', 'block');
    dim = {
        width: node.offsetWidth,
        height: node.offsetHeight
    };
    container.style('display', 'none');
    return dim;
};

ListContainer.prototype.show = function (target) {
    var idArr = this.hideFnIds,
        bBox,
        style = {},
        parentContainer = this.parentListCon,
        parentNode,
        index = 0,
        length,
        offsetWidth,
        data = this.container.datum(),
        measurement = data.measurement || target,
        position = data.position,
        containerNode,
        viewPortWidth = window.innerWidth,
        overflow = function () {
            var overFlowRight = (parentNode.offsetLeft + parentNode.offsetWidth + containerNode.offsetWidth >
                viewPortWidth),
                overFlowLeft = (parentNode.offsetLeft - containerNode.offsetWidth < 0);

            return overFlowLeft ? 1 : (overFlowRight ? 2 : 0);
        },
        side;

    this.visible = true;
    for (length = idArr.length; index < length; index++) {
        clearTimeout(idArr[index]);
    }

    idArr.length = 0;
    target = this.target = target || this.target;
    this.container.style('display', 'block');

    if (parentContainer) {
        parentContainer.show();
        parentNode = parentContainer.getContainer().node();
        style.top = parentNode.offsetTop + target.offsetTop + PX$1;
        containerNode = this.container.node();

        side = overflow(containerNode, parentNode);

        if (position === 'right') {
            style.left = (side === 2 ?
                parentNode.offsetLeft - containerNode.offsetWidth :
                parentNode.offsetLeft + parentNode.offsetWidth) + PX$1;

            style.right = 'auto';
        }
        else {

            style.left = (side === 2 || side === 0 ?
                parentNode.offsetLeft - containerNode.offsetWidth :
                parentNode.offsetLeft + parentNode.offsetWidth) + PX$1;

            style.right = 'auto';
        }
    }
    else if (!isDIV(target) && target && target.getBBox) {
        bBox = target.getBBox();
        offsetWidth = this.container.node().offsetWidth;

        style.top = bBox.y + bBox.height + 3 + PX$1;

        if (position === 'left') {
            style.left = bBox.x + PX$1;
            style.right = 'auto';
        }
        else if (position === 'right') {
            style.left = bBox.x + bBox.width - offsetWidth + PX$1;
            style.right = 'auto';
        }
    }
    else if (measurement) {
        style = {
            left: measurement.left === undefined ? 'auto' : measurement.left + PX$1,
            top : measurement.top === undefined ? 'auto' : measurement.top + PX$1,
            right: measurement.right === undefined ? 'auto' : measurement.right + PX$1,
            bottom : measurement.bottom === undefined ? 'auto' : measurement.bottom + PX$1,
            width: measurement.width === undefined ? 'auto' : measurement.width + PX$1,
            height: measurement.height === undefined ? 'auto' : measurement.height + PX$1
        };
    }

    setStyle(this.container, style);
};

ListContainer.prototype.hide = function (timeout) {
   var self = this,
        parentContainer = self.parentListCon,
        onHideFn = self.onhide,
        timer = timeout === undefined ? DEFAULT_TIMEOUT : timeout;

    if (parentContainer) {
        parentContainer.hide(timer);
    }
    this.visible = false;
    this.hideFnIds.push(setTimeout(function () {
        self.container.style('display', 'none');
        onHideFn && onHideFn();
    }, timer));
};

ListContainer.prototype.classed = function (className, value) {
    this.container.classed(className, value);
};

ListContainer.prototype.on = function (eventType, fn, typename) {
    if (typeof this.container.node()['on' + eventType] === 'undefined') {
        this['on' + eventType] = fn;
    }
    else {
        this.container.on(eventType + '.' + (typename || 'custom'), fn);
    }
};

function DropDownMenu (container) {
    var parentContainer = container.append('div');

    this.groupId = 'dropDownMenu-' + new Date().getTime();

    this.parentContainer = parentContainer;

    this.listItems = [];
    // this.subContainers = [];
    this.config = {};
}

DropDownMenu.prototype.setConfig = function (config) {
    mergeConf(config, this.config);
    return this;
};

DropDownMenu.prototype.setMeasurement = function (measurement) {
    var container = this.getFirstContainer();

    if (container) {
        container.getContainer().datum().measurement = measurement;
    }
    else {
        this.measurement = measurement;
    }

    return this;
};

DropDownMenu.prototype.setPosition = function (position) {
    this.position = position;
    return this;
};

DropDownMenu.prototype.classed = function (className, value) {
    this.container.classed(className, value);
    this.subContainers.forEach(function (d) {
        d.classed(className, value);
    });
    return this;
};

DropDownMenu.prototype.add = function (listItems, refTo) {
    var self = this,
        parentContainer = self.parentContainer,
        config = this.config,
        listItem = config.listItem || {},
        classNames = listItem.classNames || {},
        listItemClass = classNames.normal,
        listItemHover = function (d) {
            var config = self.config,
                listItem = config.listItem || {},
                classNames = listItem.classNames || {},
                hoverClass = classNames.hover,
                subContainer = d.subContainer;

            d.parentContainer && d.parentContainer.show();
            d.interactivity !== false && d.listItem.classed(hoverClass, true);
            subContainer && subContainer.show(this);
        },
        listItemHoverOut = function (d) {
            var config = self.config,
                listItem = config.listItem || {},
                classNames = listItem.classNames || {},
                hoverClass = classNames.hover;

            d.interactivity !== false && d.listItem.classed(hoverClass, false);
            d.subContainer && d.subContainer.hide();
        },
        filterChildNodes = function () {
            return this.parentNode === parentContainer.node();
        },
        listItemClicked = function (d) {
            d.parentContainer && d.parentContainer.hide(1);
            d.subContainer && d.subContainer.hide(1);
        },
        initContainer = function (d) {
            d.container.init(this);
        },
        contClassNames = (config.container && config.container.classNames) || {},
        contClass = contClassNames.normal,
        container,
        containerData = self.containerData || (self.containerData = []),
        containerSelection,
        contIndex = 0,
        selection,
        defPad = {
            left: 8,
            right: 8,
            top: 3,
            bottom: 3
        },
        lItemStyle = {
            margin: '2px 2px 2px 2px',
            display: 'block'
        },
        dividerStyle = {
            height: '1px',
            margin: '1px',
            padding: '0px',
            display: 'block'
        },
        data,
        arrowUnicode = '&#9666;',
        spans,
        padding;

    if (!containerData[contIndex]) {
        containerData[contIndex] = {
            container: (container = new ListContainer(this.groupId)),
            groupId: this.groupId,
            measurement: this.measurement,
            position: this.position
        };
    }
    else {
        container = containerData[contIndex].container;
    }

    // Create the first container
    selection = parentContainer.selectAll('div').filter(filterChildNodes).data(containerData);

    selection.enter().append('div').each(initContainer);
    container.classed(contClass, true);

    this.container = container;

    contIndex++;

    // Store the list items for future reference use
    listItems = self.listItems = self.listItems.concat(listItems);

    (function recursiveParser (items, fCon) {
        var listItems, listItem,
            container,
            refContainer,
            handlerFn,
            selection,
            listContainer,
            selectionEnter;

        listContainer = fCon ? fCon : self.container;

        container = listContainer.getContainer();

        if (items instanceof Array) {
            listItems = items;
        } else {
            listItems = [items];
        }

        selection = container.selectAll('div').data(listItems);

        selection.exit().style('display', 'none');

        selectionEnter = selection.enter().append('div').merge(selection);

        selectionEnter.each(function (d) {
            var action,
                handler,
                className,
                name;

            name = d.name;
            action = d.action;
            handler = d.handler;
            className = d.className;
            padding = d.padding || {};

            listItem = d3.select(this).classed(listItemClass, true);
            className && listItem.classed(d.className, true);

            d.listItem = listItem;
            d.parentContainer = listContainer;
            setStyle(listItem, d.divider ? dividerStyle : lItemStyle);

            if (handler && typeof handler !== 'function') {
                setStyle(listItem, {
                    'padding-right': (padding.right || defPad.right) + 'px',
                    'padding-bottom': (padding.bottom || defPad.bottom) + 'px',
                    'padding-top': (padding.top || defPad.top) + 'px'
                });

                data = [{
                    html: arrowUnicode,
                    style: {
                        'padding-left': defPad.left + PX$1
                    }
                },
                {
                    html: name,
                    style: {
                        'padding-left': (padding.left - smartLabel$1.getOriSize('&#9666;').width - defPad.left) + 'px'
                    }
                }];

                spans = listItem.selectAll('span').data(data);
                spans.enter().append('span').merge(spans).each(function (d) {
                    setStyle(d3.select(this).html(d.html), d.style);
                });

                if (!containerData[contIndex]) {
                    containerData[contIndex] = {
                        container: (container = new ListContainer(self.groupId)),
                        groupId: self.groupId,
                        position: self.position
                    };
                }
                else {
                    container = containerData[contIndex].container;
                }

                contIndex++;
                containerSelection = parentContainer.selectAll('div').filter(filterChildNodes).data(containerData);

                containerSelection.enter()
                    .append('div')
                    .each(initContainer);

                refContainer = recursiveParser(handler, container);

                refContainer.classed(contClass, true);
                d.subContainer = refContainer;
                refContainer.setParentListContainer(listContainer);
            }
            else {
                listItem.html(name);
                d.divider !== true && setStyle(listItem, {
                    'padding-left': (padding.left || defPad.left) + 'px',
                    'padding-right': (padding.right || defPad.right) + 'px',
                    'padding-bottom': (padding.bottom || defPad.bottom) + 'px',
                    'padding-top': (padding.top || defPad.top) + 'px'
                });
            }

            listItem.on('mouseover.default', listItemHover);
            listItem.on('mouseout.default', listItemHoverOut);
            listItem.on('click.default', listItemClicked);

            if (action) {
                // Attach event listener on dropdown list items
                listItem.on(action + '.custom', handlerFn);
            }

        });

        return listContainer;
    })(listItems, refTo);

    return self;
};

DropDownMenu.prototype.show = function (target) {
    this.listItems.length !== 0 && this.container.show(target);
};

DropDownMenu.prototype.hide = function () {
    this.listItems.length !== 0 && this.container.hide();
};

DropDownMenu.prototype.toggleVisibility = function () {
    if (this.listItems.length !== 0) {
        this.container.visible ? this.hide() : this.show();
    }
};

DropDownMenu.prototype.getFirstContainer = function () {
    return this.container;
};

DropDownMenu.prototype.flushItems = function () {
    this.listItems.length = 0;
};

function dropDownMenu (container) {
    return new DropDownMenu(container);
}

/*eslint-disable */

if (ENV !== 'production') {
    document && document.write(
        '<script src="http://' + (location.host || 'localhost').split(':')[0] +
        ':35729/livereload.js?snipver=1"></' + 'script>'
    );
}
/*eslint-enable */
var PX = 'px';
var BLANK = '';
var smartLabel = new SmartLabel(new Date().getTime());
var classRules = {
        button: ['container', 'text', 'symbol'],
        inputButton: ['container', 'text', 'input'],
        selectButton: ['container', 'text', 'arrow']
    };
var getCompositeClassNames = function (className, component) {
        var rules = classRules[component],
            classNames = {},
            i,
            len = rules.length;

        for (i = 0; i < len; i++) {
            classNames[rules[i]] = className + '-' + rules[i];
        }
        return classNames;
    };
var getDefaultDropDownConf = function () {
        return {
            container: {
                classNames: {
                    normal: 'fc-dropdown-default'
                }
            },
            listItem: {
                classNames: {
                    normal: 'fc-dropdownlistitem-default',
                    hover: 'fc-dropdownlistitem-state-hover',
                    selected: 'fc-dropdownlistitem-state-selected'
                }
            }
        };
    };


function Button (symbol) {
    this.symbol = symbol;
    this.config = {
        className: 'fc-btn-default',
        states: {
            hover: 'fc-btn-default-state-hover',
            selected: 'fc-btn-default-state-selected',
            disabled: 'fc-btn-default-state-disabled'
        },
        padding: {
            top: 4,
            right: 4,
            bottom: 4,
            left: 4
        },
        radius: 1,
        margin: {
            top: 0,
            right: 5,
            left: 5,
            bottom: 0
        },
        animation: {
            duration: 1000
        }
    };

    this.elements = {};
}

Button.prototype.dispose = function () {
    this.buttonGroup && this.buttonGroup.remove();
};

Button.prototype.setConfig = function (config) {
    mergeConf(config, this.config);
    return this;
};

Button.prototype.getConfig = function (key) {
    return this.config[key];
};

Button.prototype.getLogicalSpace = function () {
    var config = this.config,
        className = config.className,
        classNames = this.getCompositeClassNames(className),
        textClass = classNames.text,
        symbol = this.symbol,
        pad = config.padding,
        padLeft = pad.left,
        padRight = pad.right,
        padTop = pad.top,
        dimensions = {
            width: 0,
            height: 0
        };


    typeof symbol === 'string' && (dimensions = getTextDimensions(symbol, textClass, d3Selection.select('svg'), smartLabel));

    config.width = config.width === undefined ?
        Math.max(dimensions.width + padLeft + padRight, config.width || 0) : config.width;
    config.height = config.height === undefined ?
        Math.max(dimensions.height + padTop + padRight, config.height || 0) : config.height;
    return (this.logicalSpace = {
        width: config.width,
        height: config.height
    });
};

Button.prototype.getCompositeClassNames = function (className) {
    return getCompositeClassNames(className, 'button');
};

Button.prototype.setParentGroup = function (group) {
    this.parentGroup = group;
};

Button.prototype.draw = function (x, y, group) {
    var config = this.config,
        classNames = this.getCompositeClassNames(config.className),
        containerClass = classNames.container,
        textClass = classNames.text,
        symbolClass = classNames.symbol,
        buttonGroup = this.buttonGroup,
        elements = this.elements,
        containerEl = elements.container,
        textEl = elements.text,
        symbolEl = elements.symbol,
        symbol = this.symbol,
        parentGroup = group || this.parentGroup,
        animation = config.animation,
        duration = animation.duration,
        padding = config.padding,
        padLeft = padding.left,
        padRight = padding.right,
        padTop = padding.top,
        padBottom = padding.bottom,
        r = config.radius,
        logicalSpace,
        width,
        height,
        symbolObj,
        t = d3Transition.transition().duration(duration),
        boxDim;


    this.parentGroup = parentGroup;

    if (!this.logicalSpace) {
        logicalSpace = this.getLogicalSpace();
    }

    logicalSpace = this.logicalSpace;
    width = logicalSpace.width;
    height = logicalSpace.height;

    if (!buttonGroup) {
        buttonGroup = this.buttonGroup = group.append('g');
    }

    if (!containerEl) {
        containerEl = elements.container = buttonGroup.append('rect');
    }

    containerEl.transition(t).
        attr('x', x).attr('y', y).attr('width', width).attr('height', height);
    containerEl.classed(containerClass, true).attr('rx', r).attr('ry', r);

    if (typeof symbol === 'string') {
        if (!textEl) {
            textEl = elements.text = buttonGroup.append('text');
        }

        boxDim = {
            x: x + padLeft,
            y: y + padTop,
            width: width - padRight - padLeft,
            height: height - padBottom - padTop
        };

        textEl.text(symbol).transition(t).
            attr('x', boxDim.x + boxDim.width / 2).attr('y', boxDim.y + boxDim.height / 2);

        textEl.attr('dy', '0.35em').attr('text-anchor', 'middle').attr('pointer-events', 'none')
        .classed(textClass, true);
    }
    else if (typeof symbol === 'function') {
        symbolObj = symbol(x + padLeft, y + padTop, width - (padLeft + padRight),
            height - (padTop + padBottom), padding);

        if (!symbolEl) {
            symbolEl = buttonGroup.append(symbolObj.type);
        }
        symbolEl.attr('pointer-events', 'none').classed(symbolClass, true);
        setAttrs(symbolEl, symbolObj.attrs);
    }

    this.buttonGroup = buttonGroup;

    this.getBBox = function () {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    this.postDraw();
    return this;
};

Button.prototype.bindEventListeners = function () {
    var key,
        eventMap = this.eventMap;

    for (key in eventMap) {
        this.on(key, eventMap[key]);
    }

    return this;
};

Button.prototype.postDraw = function () {
    this.addHoverEvents();
    this.bindEventListeners();
};


Button.prototype.addHoverEvents = function () {
    var self = this;

    self.on('mouseover', function () {
        self.setState('hover');
    }, 'default');

    self.on('mouseout', function () {
        self.removeState('hover');
    }, 'default');
};

Button.prototype.classed = function (className, value) {
    var elements = this.elements,
        classNames = getCompositeClassNames(className, 'button');

    elements.container && elements.container.classed(classNames.container, value);
    elements.text && elements.text.classed(classNames.text, value);
    elements.symbol && elements.symbol.classed(classNames.symbol, value);

    return this;
};

Button.prototype.on = function (eventType, fn, typename) {
    this.buttonGroup.on(eventType + '.' + (typename || 'custom'), fn);
    return this;
};

Button.prototype.hide = function () {
    this.buttonGroup.attr('visibility', 'hidden');
    this.visible = false;
    return this;
};

Button.prototype.show = function () {
    this.buttonGroup.attr('visibility', 'visible');
    this.visible = true;
    return this;
};

Button.prototype.disable = function (value) {
    this.elements.container && this.elements.container.attr('pointer-events', value ? 'none' : '');
};

Button.prototype.getBoundElement = function () {
    return this.elements.container.node();
};

Button.prototype.setState = function (state) {
    var config = this.config,
        states = config.states,
        className = states[state];

    state === 'disabled' && this.disable(true);
    this.classed(className, true);
};

Button.prototype.removeState = function (state) {
    var config = this.config,
        states = config.states,
        className = states[state];

    state === 'disabled' && this.disable(false);
    this.classed(className, false);
};

Button.prototype.attachEventHandlers = function (eventMap) {
    this.eventMap = eventMap;
};

function InputButton () {
    Button.apply(this, arguments);
    this.setConfig({
        className: 'fc-inputbtn-default',
        states: {
            hover: 'fc-inputbtn-state-hover',
            selected: 'fc-inputbtn-state-selected',
            disabled: 'fc-inputbtn-state-disabled'
        },
        padding: {
            left: 10
        }
    });
}

InputButton.prototype = Object.create(Button.prototype);

InputButton.prototype.draw = function (x, y, group) {
    var self = this,
        config = this.config,
        classNames = this.getCompositeClassNames(config.className),
        containerClass = classNames.container,
        textClass = classNames.text,
        inputClass = classNames.input,
        elements = this.elements,
        containerEl = elements.container,
        textEl = elements.text,
        inputBox = elements.inputBox,
        padding = config.padding,
        padLeft = padding.left,
        padRight = padding.right,
        padTop = padding.top,
        padBottom = padding.bottom,
        parentGroup = group || this.parentGroup,
        logicalSpace,
        width,
        height,
        buttonGroup = this.buttonGroup,
        boxDim,
        bBox,
        styleObj,
        container,
        textAttrs;

    !buttonGroup && (buttonGroup = this.buttonGroup = group.append('g'));

    this.parentGroup = parentGroup;
    container = parentGroup.node().ownerSVGElement.parentNode;
    if (!this.logicalSpace) {
        logicalSpace = this.getLogicalSpace();
    }

    logicalSpace = this.logicalSpace;
    width = logicalSpace.width;
    height = logicalSpace.height;

    if (!containerEl) {
        containerEl = elements.container = buttonGroup.append('rect');
    }

    setAttrs(containerEl, {
        x: x,
        y: y,
        width: width,
        height: height,
        class: containerClass
    });

    !textEl && (textEl = elements.text = buttonGroup.append('text'));


    textEl.text(this.symbol || BLANK);

    boxDim = {
        x: x + padLeft,
        y: y + padTop,
        width: width - padRight - padLeft,
        height: height - padBottom - padTop
    };

    textAttrs = {
        x: boxDim.x,
        y: boxDim.y + boxDim.height / 2,
        dy: '0.35em',
        'pointer-events': 'none'
    };

    setAttrs(textEl, textAttrs);

    textEl.classed(textClass, true);

    !inputBox && (inputBox = elements.inputBox = d3Selection.select(container).append('input'));

    bBox = textEl.node().getBBox();

    styleObj = {
        position: 'absolute',
        top: bBox.y + PX,
        left: bBox.x + PX,
        width: width - (padLeft + padRight) + PX,
        height: bBox.height + PX,
        '-webkit-apperance': 'none',
        outline: 'none',
        margin: '0px',
        border: '0px',
        padding: '0px',
        visibility: 'hidden'
    };

    inputBox.classed(inputClass, true);
    setStyle(inputBox, styleObj);

    this.buttonGroup = buttonGroup;

    inputBox.attr('value', this.symbol);

    self.on('click', self.edit.bind(self), 'default');

    self.on('blur', self.blur.bind(self), 'default');

    this.postDraw();

    return self;
};

InputButton.prototype.classed = function (className, value) {
    var elements = this.elements,
        classNames = getCompositeClassNames(className, 'inputButton');

    elements.container && elements.container.classed(classNames.container, value);
    elements.text && elements.text.classed(classNames.text, value);
    elements.symbol && elements.symbol.classed(classNames.symbol, value);
    elements.inputBox && elements.inputBox.classed(classNames.input, value);
    return this;
};

InputButton.prototype.blur = function () {
    var elements = this.elements,
        inputBox = elements.inputBox,
        text = elements.text,
        node = inputBox.node(),
        value = node.value,
        maxWidth = node.offsetWidth,
        maxHeight = node.offsetHeight,
        smartText;

    inputBox && inputBox.style('visibility', 'hidden');
    smartText = smartLabel.getSmartText(value, maxWidth, maxHeight);

    text && text.attr('visibility', 'visible').text(smartText.text);
    return this;
};

InputButton.prototype.edit = function () {
    var elements = this.elements,
        inputBox = elements.inputBox,
        node = inputBox.node(),
        len = node.value.length;

    inputBox.style('visibility', 'visible');
    node.setSelectionRange(len, len);
    node.focus();
    elements.text.attr('visibility', 'hidden');
    return this;
};

InputButton.prototype.getCompositeClassNames = function (className) {
    return getCompositeClassNames(className, 'inputButton');
};

InputButton.prototype.text = function (text) {
    var inputBox = this.elements.inputBox;

    return text ? inputBox.attr('value', text) : inputBox.attr('value');
};

InputButton.prototype.on = function (eventType, fn, typename) {
    var inputBox = this.elements.inputBox,
        eventName = eventType + '.' + (typename || 'custom');

    switch (eventType) {
        case 'blur':
        case 'change':
        case 'keypress':
            inputBox.on(eventName, fn);
            break;

        default:
            this.buttonGroup.on(eventName, fn);
            break;
    }

    return this;
};

InputButton.prototype.hide = function () {
    this.buttonGroup.attr('visibility', 'hidden');
    this.elements.inputBox.attr('visibility', 'hidden');
    return this;
};

InputButton.prototype.show = function () {
    this.buttonGroup.attr('visibility', 'visible');
    this.elements.inputBox.attr('visibility', 'visible');
    return this;
};

function button (symbol) {
    return new Button(symbol);
}

function inputButton (symbol) {
    return new InputButton(symbol);
}

function SelectButton (options) {
    this.options = options;
    Button.apply(this, arguments);

    this.setConfig({
        className: 'fc-selectbtn-default',
        states: {
            hover: 'fc-selectbtn-state-hover',
            selected: 'fc-selectbtn-state-selected'
        },
        dropDownMenu: getDefaultDropDownConf()
    });
}

SelectButton.prototype = Object.create(Button.prototype);

SelectButton.prototype.getLogicalSpace = function () {
    var config = this.config,
        width = config.width,
        height = config.height,
        options = this.options || [],
        classNames = this.getCompositeClassNames(config.className),
        className = classNames.text,
        group = this.parentGroup,
        pad = config.padding,
        padLeft = pad.left,
        padRight = pad.right,
        padTop = pad.top,
        padBottom = pad.bottom,
        maxWidth = 0,
        maxHeight = 0,
        option,
        name,
        dimensions,
        i, len = options.length;

    if (width && height) {
        return (this.logicalSpace = {
            width: width,
            height: height
        });
    }
    else {
        for (i = 0; i < len; i++) {
            option = options[i];
            name = option.name;
            dimensions = getTextDimensions(name, className, group, smartLabel);
            maxWidth = Math.max(dimensions.width, maxWidth);
            maxHeight = Math.max(dimensions.height, maxHeight);
        }
        return {
            width: maxWidth + padLeft + padRight,
            height: maxHeight + padTop + padBottom
        };
    }
};

SelectButton.prototype.draw = function (x, y, group) {
    var buttonGroup = this.buttonGroup,
        elements = this.elements,
        containerEl = elements.container,
        textEl = elements.text,
        boxDim,
        arrow = elements.arrow,
        arrowWidth = 8,
        arrowHeight = 4,
        arrowPath,
        startX,
        startY,
        bBox,
        config = this.config,
        classNames = this.getCompositeClassNames(config.className),
        containerClass = classNames.container,
        textClass = classNames.text,
        arrowClass = classNames.arrow,
        pad = this.config.padding,
        padLeft = pad.left,
        padRight = pad.right,
        padTop = pad.top,
        padBottom = pad.bottom,
        options = this.options || [],
        parentGroup = group || this.parentGroup,
        width,
        height,
        logicalSpace = this.logicalSpace,
        name = options[0] && options[0].name;

    this.parentGroup = parentGroup;

    if (!this.logicalSpace) {
        logicalSpace = this.getLogicalSpace();
    }

    width = logicalSpace.width;
    height = logicalSpace.height;

    !buttonGroup && (buttonGroup = this.buttonGroup = group.append('g'));

    !containerEl && (containerEl = elements.container = buttonGroup.append('rect'));

    containerEl.attr('x', x).attr('y', y).attr('width', width)
        .attr('height', height).classed(containerClass, true);

    !textEl && (textEl = elements.text = buttonGroup.append('text'));

    textEl.text('W');

    boxDim = {
        x: x + padLeft,
        y: y + padTop,
        width: width - (padRight + padLeft) - arrowWidth,
        height: height - (padBottom + padTop)
    };

    textEl.attr('x', boxDim.x).attr('y', boxDim.y + boxDim.height / 2)
    .attr('dy', '0.35em').attr('pointer-events', 'none').classed(textClass, true);

    bBox = textEl.node().getBBox();

    textEl.text(name);

    startX = x + width - padRight - arrowWidth;
    startY = bBox.y + bBox.height / 2 - arrowHeight / 2;

    arrowPath = ['M', startX, startY, 'L', startX + arrowWidth, startY, 'L', startX + arrowWidth / 2,
        startY + arrowHeight, 'Z'];

    !arrow && (arrow = elements.arrow = buttonGroup.append('path'));

    arrow.attr('d', arrowPath.toString().replace(/,/g, ' '))
        .classed(arrowClass, true).attr('pointer-events', 'none');

    this.buttonGroup = buttonGroup;
    this.postDraw();
    return this;
};

SelectButton.prototype.text = function (text) {
    return this.buttonGroup.select('text').text(text);
};

SelectButton.prototype.value = function (value) {
    var dropDownMenu$$1 = this.dropDownMenu,
        self = this,
        container = dropDownMenu$$1.container.getContainer();

    container.selectAll('div').each(function (d) {
        var item;
        if (d.value === value) {
            item = d3Selection.select(this);
            self.selectedItem && self.selectedItem.classed('selected', false);
            item.classed('selected', true);
            self.text(item.datum().name);
            self.selectedItem = item;
        }
    });
};

SelectButton.prototype.createMenu = function (containerElem) {
    var self = this,
        dropDownMenu$$1 = this.dropDownMenu,
        node = this.elements.container.node(),
        dropDownMenuConf = this.config.dropDownMenu || {},
        container = dropDownMenuConf.container || {},
        listItem = dropDownMenuConf.listItem || {},
        contClassNames = container.classNames || {},
        listItemClassNames = listItem.classNames || {},
        bBox = node.getBBox();

    if (!dropDownMenu$$1) {
        dropDownMenu$$1 = this.dropDownMenu = new dropDownMenu(d3Selection.select(containerElem));
    }

    dropDownMenu$$1.setConfig({
        listItem: {
            classNames: {
                normal: listItemClassNames.normal,
                hover: listItemClassNames.hover
            }
        },
        container: {
            classNames: {
                normal: contClassNames.normal
            }
        }
    });

    dropDownMenu$$1.setMeasurement({
        top: bBox.y + bBox.height,
        left: bBox.x,
        width: bBox.width
    });

    node.groupId = dropDownMenu$$1.groupId;

    this.on('mouseout', function () {
        dropDownMenu$$1.listItems.length === 0 && self.onBlur && self.onBlur();
        dropDownMenu$$1.hide();
    }, 'default');

    this.on('click', function () {
        dropDownMenu$$1.toggleVisibility();
    }, 'default');

    this.add(this.options);

    return this;
};

SelectButton.prototype.postDraw = function () {
    Button.prototype.postDraw.call(this);
    var self = this,
        parentGroup = self.parentGroup,
        container = parentGroup.node().ownerSVGElement.parentNode;

    this.on('click', function () {
        self.setState('selected');
    }, 'selected');

    this.on('blur', function () {
        self.removeState('selected');
    });

    this.createMenu(container);
};

SelectButton.prototype.add = function (list) {
    var dropDownMenu$$1 = this.dropDownMenu,
        self = this,
        listContainer,
        dimensions,
        bBox = this.elements.container.node().getBBox(),
        viewPortHeight = window.innerHeight,
        container;

    list.length !==0 && dropDownMenu$$1.add(list);
    container = dropDownMenu$$1.getFirstContainer();

    if (container) {
        container.on('hide', this.onBlur);

        listContainer = container.getContainer();
        dimensions = container.getDimensions();
        if (bBox.y + bBox.height + dimensions.height > viewPortHeight) {
            dropDownMenu$$1.setMeasurement({
                top: bBox.y - dimensions.height,
                left: bBox.x,
                width: bBox.width
            });
        }

        listContainer.selectAll('div').on('click.selected', this.onSelect()).each(function (d, i) {
            if (i === 0) {
                self.selectedItem = self.selectItem(d3Selection.select(this), true);
            }
        });
    }
};

SelectButton.prototype.setPlaceHolderValue = function () {

};

SelectButton.prototype.updateList = function (list) {
    var dropDownMenu$$1 = this.dropDownMenu;

    dropDownMenu$$1.flushItems();
    this.add(list);
    this.text(list[0] && list[0].name || BLANK);
};

SelectButton.prototype.selectItem = function (item, value) {
    var dropDownMenuConf = this.config.dropDownMenu || {},
        listItem = dropDownMenuConf.listItem || {},
        listItemClassNames = listItem.classNames || {};

    return item.classed(listItemClassNames.selected, value);
};

SelectButton.prototype.onSelect = function () {
    var self = this;
    return function (d) {
        var item = d3Selection.select(this),
            selectedItem = self.selectedItem,
            onChangeFn = self.onChange;

        selectedItem && self.selectItem(selectedItem, false);
        self.selectedItem = self.selectItem(item, true);
        self.text(d.name);
        self.selectedItem = item;
        onChangeFn && onChangeFn();
    };
};

SelectButton.prototype.on = function (eventType, fn, typename) {
    switch (eventType) {
        case 'change':
            this.onChange = fn;
            break;
        case 'blur':
            this.onBlur = fn;
            break;
        default:
            this.buttonGroup.on(eventType + '.' + (typename || 'custom'), fn);
            break;
    }

    return this;
};

SelectButton.prototype.getCompositeClassNames = function (className) {
    return getCompositeClassNames(className, 'selectButton');
};


function ButtonWithContextMenu (symbol, container) {
    Button.apply(this, arguments);
    this.dropDownMenu = new dropDownMenu(d3Selection.select(container));
    this.setConfig({
        dropDownMenu: getDefaultDropDownConf()
    });

    this.dropDownMenu.setConfig(this.config.dropDownMenu);
}

function adapter (list) {
    var newList = [], newObj,obj,key,name,value,i;
    for (i = 0; i < list.length; i++) {
        obj = list[i];

        for (key in obj) {
            name = key;
            value = obj[name];
        }

        newObj = {
            name: name,
            id: value.id
        };

        if (name === '') {
            newObj.className = 'fc-dropdownlistitem-divider';
            newObj.interactivity = false;
            newObj.divider = true;
        }


        if (/&nbsp;/.test(newObj.name)) {
            newObj.name = newObj.name.replace(/&nbsp;/g, '').trim();
            newObj.className = 'fc-dropdownlistitem-subcategory';
            newObj.padding = {
                left: 20
            };
        }

        if (/Growth/.test(name)) {

            newObj.interactivity = false;
            newObj.className = 'fc-dropdownlistitem-category';
        }

        if (typeof value.handler === 'object') {
            newObj.handler = adapter(value.handler);
        }

        newList.push(newObj);
    }

    return newList;
}

ButtonWithContextMenu.prototype = Object.create(Button.prototype);

ButtonWithContextMenu.prototype.add = function (list) {
    var dropDownMenu$$1 = this.dropDownMenu;
    dropDownMenu$$1.add(adapter(list));
};

ButtonWithContextMenu.prototype.postDraw = function () {
    Button.prototype.postDraw.call(this);
    var self = this,
        bBox = self.getBBox(),
        measurement = {};

    this.on('mouseover', function () {
        var listContainer = self.dropDownMenu.getFirstContainer(),
            dimensions = listContainer.getDimensions(),
            width;

        width = dimensions.width;
        measurement.top = bBox.y + bBox.height + 3;
        measurement.left = bBox.x + bBox.width - width;
        self.dropDownMenu.show(measurement);
    });

    this.on('mouseout', function () {
        self.dropDownMenu.hide();
    });
};

ButtonWithContextMenu.prototype.showListItem = function (id) {
    var dropDown = this.dropDownMenu,
        container = dropDown.getFirstContainer().getContainer();

    container.selectAll('div').style('display', function (d) {
        return d.id === id && 'block';
    });
};

ButtonWithContextMenu.prototype.hideListItem = function (id) {
    var dropDown = this.dropDownMenu,
        container = dropDown.getFirstContainer().getContainer();

    container.selectAll('div').style('display', function (d) {
        return d.id === id && 'none';
    });
};


function buttonWithContextMenu (symbol, container) {
    return new ButtonWithContextMenu(symbol, container);
}

function selectButton (options) {
    return new SelectButton(options);
}

exports.button = button;
exports.selectButton = selectButton;
exports.inputButton = inputButton;
exports.buttonWithContextMenu = buttonWithContextMenu;
exports.dropDownMenu = dropDownMenu;
