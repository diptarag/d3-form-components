/* jshint ignore:start */
import {default as SmartLabel} from "fusioncharts-smartlabel";
import {mergeConf, getTextDimensions, setStyle, setAttrs, getIndividualClassNames,
    getSmartComputedStyle} from "./utils";
import {dropDownMenu as DropDownMenu} from "./dropdownmenu";
import {select} from "d3-selection";
import {transition} from "d3-transition";
/*eslint-disable */

if (ENV !== 'production') {
    document && document.write(
        '<script src="http://' + (location.host || 'localhost').split(':')[0] +
        ':35729/livereload.js?snipver=1"></' + 'script>'
    );
}

/*eslint-enable */
var PX = 'px',
    BLANK = '',
    getDefaultDropDownConf = function () {
        return {
            container: {
                className: 'd3-dropdown'
            },
            listItem: {
                className: 'd3-dropdownlistitem',
                states: {
                    hover: {
                        className: 'd3-dropdownlistitem-state-hover'
                    },
                    selected: {
                        className: 'd3-dropdownlistitem-state-selected'
                    }
                }
            }
        };
    },
    instances = {},
    isDescendant = function isDescendant(parent, child) {
        var node = child.parentNode;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };


function getSmartLabelInstance() {
    return instances.smartLabel || (instances.smartLabel = new SmartLabel(new Date().getTime()));
}


function Button (symbol) {
    this.symbol = symbol;
    this.config = {
        className: 'd3-button',
        specificClassName: 'd3-button',
        states: {
            hover: {
                className: 'd3-button-state-hover'
            },
            selected: {
                className: 'd3-button-state-selected'
            },
            disabled: {
                className: 'd3-button-state-disabled'
            }
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

Button.prototype.getConfig = function (key) {
    return this.config[key];
};

Button.prototype.namespace = function (namespace) {
    var config = this.config,
        states = config.states,
        key;

    config.namespace = namespace;

    config.className = namespace + '-' + config.className;
    config.specificClassName = this.config.className;
    for (key in states) {
        states[key].className = namespace + '-' + states[key].className;
    }
};

Button.prototype.appendSelector = function (selector) {
    var key, states = this.config.states;

    this.config.selector = selector;
    this.config.specificClassName = this.config.className + '-' + selector;
    for (key in states) {
        states[key].className = states[key].className + '-' + selector;
    }
};

Button.prototype.getStateClassName = function (state) {
    return this.config.states[state].className;
};

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
        className = config.specificClassName,
        classNames = this.getIndividualClassNames(className),
        smartLabel = getSmartLabelInstance(),
        textClass = classNames.text,
        symbol = this.symbol,
        pad = config.padding,
        padLeft = pad.left,
        padRight = pad.right,
        padTop = pad.top,
        dimensions = {
            width: 0,
            height: 0
        },
        margin = config.margin,
        hMargin = margin.left + margin.right,
        vMargin = margin.top + margin.bottom,
        style = getSmartComputedStyle(select('svg'), textClass),
        fontSize = style.fontSize;

    this.textFontSize = parseInt(fontSize);

    typeof symbol === 'string' && (dimensions = getTextDimensions(symbol, textClass, select('svg'), smartLabel));

    config.width = config.width === undefined ?
        Math.max(dimensions.width + padLeft + padRight + hMargin, config.width || 0) : config.width;
    config.height = config.height === undefined ?
        Math.max(dimensions.height + padTop + padRight + vMargin, config.height || 0) : config.height;
    return (this.logicalSpace = {
        width: config.width,
        height: config.height
    });
};

Button.prototype.getWidth = function () {
    if (!this.logicalSpace) {
        this.logicalSpace = this.getLogicalSpace();
    }
    return (this.logicalSpace && this.logicalSpace.width) || 0;
};

Button.prototype.getHeight = function () {
    if (!this.logicalSpace) {
        this.logicalSpace = this.getLogicalSpace();
    }
    return (this.logicalSpace && this.logicalSpace.height) || 0;
};

Button.prototype.getIndividualClassNames = function (className) {
    return getIndividualClassNames(className, 'button');
};

Button.prototype.getClassName = function () {
    return this.config.specificClassName;
};

Button.prototype.setParentGroup = function (group) {
    this.parentGroup = group;
};

Button.prototype.draw = function (x, y, group) {
    var config = this.config,
        className = config.className,
        specificClassName = config.specificClassName,
        classNames = this.getIndividualClassNames(specificClassName),
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
        duration = this.drawn ? animation.duration : 0,
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
        t = transition().duration(duration),
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

    this.buttonGroup.classed(className + ' ' + specificClassName, true);

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

    this.drawn = true;
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
    this.attachTooltip();
};


Button.prototype.addHoverEvents = function () {
    var self = this;

    self.on('mouseover', function hover() {
        self.setState('hover');
    }, 'default');

    self.on('mouseout', function hoverout() {
        self.removeState('hover');
    }, 'default');

};

Button.prototype.attachTooltip = function () {
    var tooltip = this.tooltip,
        buttonGroup = this.buttonGroup,
        toolText = this.config.toolText,
        elements = this.elements,
        bBox = this.getBBox();

    if (toolText !== undefined) {
        if (!tooltip) {
            tooltip = this.tooltip = d3.tooltip().namespace(this.config.namespace)
                .attachTo(d3.select(this.parentGroup.node().ownerSVGElement))
                .offset({x: 15, y: 15});
        }

        buttonGroup.data([[null, toolText]]).call(tooltip);

        buttonGroup.on('touchstart.d3-button-tooltip', function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            tooltip.show([bBox.x + 10, bBox.y - bBox.height - 30]);
        });

        buttonGroup.on('touchmove.d3-button-tooltip', function () {
            var event = d3.event;
            d3.event.preventDefault();
            d3.event.stopPropagation();
            tooltip.show([bBox.x + 10, bBox.y - bBox.height - 30]);
        });

        buttonGroup.on('touchend.d3-button-tooltip', function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            tooltip.hide();
        });
    }
};

Button.prototype.classed = function (className, value) {
    var elements = this.elements,
        classNames = getIndividualClassNames(className, 'button');

    this.buttonGroup.classed(className, value);
    elements.container && elements.container.classed(classNames.container, value);
    elements.text && elements.text.classed(classNames.text, value);
    elements.symbol && elements.symbol.classed(classNames.symbol, value);

    return this;
};

Button.prototype.on = function (eventType, fn, typename) {
    var supportsTouch = "createTouch" in document;
    if (supportsTouch) {
        if (eventType === 'mouseover') {
            this.buttonGroup.on('touchstart.mouseover', function () {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                fn();
            });
        }

        if (eventType === 'mouseout') {
            this.buttonGroup.on('touchend.mouseout', function () {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                fn();
            });
        }

        if (eventType === 'click') {
            this.buttonGroup.on('touchend.click', function () {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                fn();
            });
        }
    }
    else {
        this.buttonGroup.on(eventType + '.' + (typename || 'custom'), fn);
    }

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
        className = states[state].className;

    state === 'disabled' && this.disable(true);
    this.classed(className, true);
};

Button.prototype.removeState = function (state) {
    var config = this.config,
        states = config.states,
        className = states[state].className;

    state === 'disabled' && this.disable(false);
    this.classed(className, false);
};

Button.prototype.attachEventHandlers = function (eventMap) {
    this.eventMap = eventMap;
};

Button.prototype.getStateClassNames = function () {
    var states = this.config.states,
        classNames = {},
        key;

    for (key in states) {
        classNames[key] = states[key].className;
    }

    return classNames;
};

function InputButton () {
    Button.apply(this, arguments);
    this.setConfig({
        className: 'd3-inputbutton',
        specificClassName: 'd3-inputbutton',
        states: {
            hover: {
                className: 'd3-inputbutton-state-hover'
            },
            selected: {
                className: 'd3-inputbutton-state-selected'
            },
            disabled: {
                className: 'd3-inputbutton-state-disabled'
            }
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
        className = config.className,
        specificClassName = config.specificClassName,
        classNames = this.getIndividualClassNames(specificClassName),
        containerClass = classNames.container,
        textClass = classNames.text,
        inputClass = classNames.input,
        iconClass = classNames.icon,
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
        textAttrs,
        startX,
        startY,
        arrowWidth = this.textFontSize / 1.3,
        arrowHeight = this.textFontSize / 2.6,
        arrowPath,
        arrow = elements.arrow,
        inputFieldTracker = elements.inputFieldTracker,
        iconTracker = elements.iconTracker,
        hasInputField = config.hasInputField,
        placeholder = config.placeholder,
        icon = config.icon;

    !buttonGroup && (buttonGroup = this.buttonGroup = group.append('g'));

    this.parentGroup = parentGroup;
    container = parentGroup.node().ownerSVGElement.parentNode;
    if (!this.logicalSpace) {
        logicalSpace = this.getLogicalSpace();
    }
    buttonGroup.classed(className + ' ' + specificClassName, true);
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
        class: containerClass,
        rx: config.radius,
        ry: config.radius
    });

    !textEl && (textEl = elements.text = buttonGroup.append('text'));


    textEl.text(this.symbol || 'W');

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
    bBox = textEl.node().getBBox();
    textEl.text(this.symbol || BLANK);
    if (hasInputField) {
        !inputBox && (inputBox = elements.inputBox = select(container).append('input'));
        styleObj = {
            position: 'absolute',
            top: bBox.y + PX,
            left: bBox.x + PX,
            width: width - (padLeft + padRight) - (config.icon ? arrowWidth : 0) + 3 + PX,
            height: (bBox.height || height) + PX,
            outline: 'none',
            margin: '0px',
            border: '0px',
            padding: '0px',
            visibility: 'hidden'
        };
        inputBox.attr('placeholder', placeholder);
        inputBox.classed(inputClass, true);
        setStyle(inputBox, styleObj);
        inputBox.attr('value', this.symbol);
    }

    if (!inputFieldTracker) {
        inputFieldTracker = elements.inputFieldTracker = buttonGroup.append('rect');
    }

    setAttrs(inputFieldTracker, {
        x: x,
        y: y,
        width: width - (config.icon ? padRight + arrowWidth : 0),
        height: height
    });

    setStyle(inputFieldTracker, {
        'opacity': 0,
        cursor: hasInputField ? 'text' : 'pointer'
    });

    this.buttonGroup = buttonGroup;

    if (icon) {
        startX = x + width - padRight - arrowWidth + 4;
        startY = y + height / 2 - arrowHeight / 2;

        arrowPath = ['M', startX, startY, 'L', startX + arrowWidth, startY, 'L', startX + arrowWidth / 2,
            startY + arrowHeight, 'Z'];

        !arrow && (arrow = elements.arrow = buttonGroup.append('path'));

        arrow.attr('d', arrowPath.toString().replace(/,/g, ' '))
            .classed(iconClass, true).attr('pointer-events', 'none');

        if (!iconTracker) {
            iconTracker = elements.iconTracker = buttonGroup.append('rect');
        }

        setAttrs(iconTracker, {
            x: x + width - arrowWidth - padRight,
            y: y,
            width: arrowWidth + padRight,
            height: height
        });

        setStyle(iconTracker, {
            'opacity': 0,
            cursor: 'pointer'
        });
    }


    self.config.hasInputField !== false && self.on('click', self.edit.bind(self), 'default');

    self.config.hasInputField !== false && self.on('blur', self.blur.bind(self), 'default');


    this.getBBox = function () {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    this.postDraw();

    return self;
};

InputButton.prototype.classed = function (className, value) {
    var elements = this.elements,
        classNames = getIndividualClassNames(className, 'inputButton');

    this.buttonGroup.classed(className, value);
    elements.container && elements.container.classed(classNames.container, value);
    elements.text && elements.text.classed(classNames.text, value);
    elements.symbol && elements.symbol.classed(classNames.symbol, value);
    elements.inputBox && elements.inputBox.classed(classNames.input, value);
    return this;
};

InputButton.prototype.blur = function (textStr) {
    var elements = this.elements,
        inputBox = elements.inputBox,
        smartLabel = getSmartLabelInstance(),
        text = elements.text,
        node = inputBox && inputBox.node(),
        value = node ? node.value : textStr,
        config = this.config,
        pad = config.padding,
        maxWidth = config.width - (pad.left + pad.right),
        style = getSmartComputedStyle(this.parentGroup, this.getIndividualClassNames(this.getClassName()).text),
        smartText;

    inputBox && inputBox.style('visibility', 'hidden');
    smartLabel.setStyle(style);
    smartText = smartLabel.getSmartText(value, maxWidth, config.height);

    this.symbol = smartText.text;
    text && text.style('display', 'block').text(smartText.text);
    return this;
};

InputButton.prototype.edit = function () {
    var elements = this.elements,
        inputBox = elements.inputBox,
        node = inputBox && inputBox.node(),
        len = node.value.length;

    if (inputBox) {
        inputBox.style('visibility', 'visible');
        node.setSelectionRange(len, len);
        node.focus();
        elements.text.style('display', 'none');
    }

    return this;
};

InputButton.prototype.getIndividualClassNames = function (className) {
    return getIndividualClassNames(className, 'inputButton');
};

InputButton.prototype.text = function (text) {
    var inputBox = this.elements.inputBox,
        value = text;

    if (text) {
        inputBox && (inputBox.node().value = text);
        this.blur(text);
    }
    else {
        value = inputBox ? inputBox.node().value : this.elements.text.text();
    }

    return value;
};

InputButton.prototype.value = function () {
    return this.text();
};

InputButton.prototype.on = function (eventType, fn, typename) {
    var inputBox = this.elements.inputBox,
        eventName = eventType + '.' + (typename || 'custom');

    switch (eventType) {
        case 'blur':
        case 'change':
        case 'keypress':
            inputBox && inputBox.on(eventName, fn);
            break;
        case 'onIconClick':
            this.elements.iconTracker && this.elements.iconTracker.on('click', fn);
            this.elements.iconTracker && this.elements.iconTracker.on('touchend', function () {
                d3.event.preventDefault();
                fn();
            });
            break;
        default:
            this.elements.inputFieldTracker && this.elements.inputFieldTracker.on(eventName, fn);
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

export function button (symbol) {
    return new Button(symbol);
}

export function inputButton (symbol) {
    return new InputButton(symbol);
}

function SelectButton (options) {
    this.options = options;
    Button.apply(this, arguments);

    this.setConfig({
        className: 'd3-selectbutton',
        states: {
            hover: {
                className: 'd3-selectbutton-state-hover'
            },
            selected: {
                className: 'd3-selectbutton-state-selected'
            }
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
        smartLabel = getSmartLabelInstance(),
        classNames = this.getIndividualClassNames(config.specificClassName),
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
        className = config.className,
        specificClassName = config.specificClassName,
        classNames = this.getIndividualClassNames(specificClassName),
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

    buttonGroup.classed(className + ' ' + specificClassName, true);

    !containerEl && (containerEl = elements.container = buttonGroup.append('rect'));

    containerEl.attr('x', x).attr('y', y).attr('width', width)
        .attr('height', height).classed(containerClass, true).attr('rx', config.radius).attr('ry', config.radius);

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

SelectButton.prototype.namespace = function (namespace) {
    var dropdownmenu = this.config.dropDownMenu,
        container = dropdownmenu.container,
        listItem = dropdownmenu.listItem,
        states = listItem.states,
        key;

    Button.prototype.namespace.call(this, namespace);

    container.className = namespace + '-' + container.className;
    listItem.className = namespace + '-' + listItem.className;

    for (key in states) {
        states[key] = namespace + '-' + states[key];
    }
};

SelectButton.prototype.appendSelector = function (selector) {
    var dropdownmenu = this.config.dropDownMenu,
        container = dropdownmenu.container,
        listItem = dropdownmenu.listItem;

    Button.prototype.appendSelector.call(this, selector);

    container.className = container.className + '-' + selector;
    listItem.className = listItem.className + '-' + selector;
};

SelectButton.prototype.text = function (text) {
    return this.buttonGroup.select('text').text(text);
};

SelectButton.prototype.value = function (value) {
    var dropDownMenu = this.dropDownMenu,
        self = this,
        container = dropDownMenu.container,
        containerElem,
        selectedItem = self.selectedItem;

    if (value === undefined) {
        return selectedItem && selectedItem.datum().value;
    }

    containerElem = container.getContainer();

    containerElem.selectAll('div').each(function (d) {
        var item;
        if (d.value === value) {
            item = select(this);
            self.selectedItem && self.selectItem(self.selectedItem, false);
            self.selectItem(item, true);
            self.text(item.datum().name);
            self.selectedItem = item;
        }
    });
};

SelectButton.prototype.createMenu = function (containerElem) {
    var self = this,
        dropDownMenu = this.dropDownMenu,
        node = this.elements.container.node(),
        dropDownMenuConf = this.config.dropDownMenu || {},
        container = dropDownMenuConf.container || {},
        listItem = dropDownMenuConf.listItem || {},
        className = container.className || {},
        listItemClass = listItem.className || {},
        states = listItem.states,
        bBox = node.getBBox();

    if (!dropDownMenu) {
        dropDownMenu = this.dropDownMenu = new DropDownMenu(select(containerElem));
    }

    dropDownMenu.setConfig({
        listItem: {
            className: listItemClass,
            states: states
        },
        container: {
            className: className
        }
    });

    dropDownMenu.setMeasurement({
        top: bBox.y + bBox.height,
        left: bBox.x,
        width: bBox.width - 1
    });

    node.groupId = dropDownMenu.groupId;

    this.on('mouseout', function () {
        dropDownMenu.listItems.length === 0 && self.onBlur && self.onBlur();
        dropDownMenu.hide();
    }, 'default');

    this.on('click', function () {
        dropDownMenu.toggleVisibility();
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

    d3.select('html').on('touchend.' + new Date().getTime(), function () {
        self.dropDownMenu.hide();
    });
};

SelectButton.prototype.add = function (list) {
    var dropDownMenu = this.dropDownMenu,
        config = this.config,
        dropDownMenuConf = config.dropDownMenu || {},
        direction = dropDownMenuConf.direction,
        self = this,
        listContainer,
        dimensions,
        bBox = this.elements.container.node().getBBox(),
        clientBox = this.parentGroup.node().ownerSVGElement.getBoundingClientRect(),
        viewPortHeight = clientBox.top + clientBox.height,
        container,
        supportsTouch = "createTouch" in document;

    list.length !==0 && dropDownMenu.add(list);
    container = dropDownMenu.getFirstContainer();

    if (container) {
        container.on('hide', this.onBlur);

        listContainer = container.getContainer();
        dimensions = container.getDimensions();

        if (direction === 'down') {
            dropDownMenu.setMeasurement({
                top: bBox.y + bBox.height,
                left: bBox.x,
                width: bBox.width - 1
            });
        }
        else {
            dropDownMenu.setMeasurement({
                top: bBox.y - dimensions.height,
                left: bBox.x,
                width: bBox.width - 1
            });
        }
        // if (bBox.y + bBox.height + dimensions.height > viewPortHeight) {
        //     dropDownMenu.setMeasurement({
        //         top: bBox.y - dimensions.height,
        //         left: bBox.x,
        //         width: bBox.width - 1
        //     });
        // }
        // else {
        //     dropDownMenu.setMeasurement({
        //         top: bBox.y + bBox.height,
        //         left: bBox.x,
        //         width: bBox.width - 1
        //     });
        // }

        if (supportsTouch) {
            listContainer.selectAll('div').on('touchend.selected', this.onSelect()).each(function (d, i) {
                if (i === 0) {
                    self.selectedItem && self.selectItem(self.selectedItem, false);
                    self.selectedItem = self.selectItem(select(this), true);
                }
            });
        }
        else {
            listContainer.selectAll('div').on('click.selected', this.onSelect()).each(function (d, i) {
                if (i === 0) {
                    self.selectedItem && self.selectItem(self.selectedItem, false);
                    self.selectedItem = self.selectItem(select(this), true);
                }
            });
        }

    }
};

SelectButton.prototype.setPlaceHolderValue = function (value) {
    var elements = this.elements,
        text = elements.text;

    text && text.text(value);
    // Unselect the item
    this.selectItem(this.selectedItem, false);
    this.selectedItem = undefined;
};

SelectButton.prototype.updateList = function (list) {
    var dropDownMenu = this.dropDownMenu;

    dropDownMenu.flushItems();
    this.add(list);
    this.text(list[0] && list[0].name || BLANK);
};

SelectButton.prototype.selectItem = function (item, value) {
    var dropDownMenuConf = this.config.dropDownMenu || {},
        listItem = dropDownMenuConf.listItem || {},
        states = listItem.states || {};

    return item && item.classed(states.selected.className, value);
};

SelectButton.prototype.onSelect = function () {
    var self = this;
    return function (d) {
        var item = select(this),
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
    var eventName;

    switch (eventType) {
        case 'change':
            this.onChange = fn;
            break;
        case 'blur':
            this.onBlur = fn;
            break;
        default:
            // eventName = touchMap[eventType];

            // this.buttonGroup.on(eventName + '.' + (typename || 'custom'), function () {
            //     console.log(eventType);
            //     fn();
            // });
            this.buttonGroup.on(eventType + '.' + (typename || 'custom'), fn);
            break;
    }

    return this;
};

SelectButton.prototype.getIndividualClassNames = function (className) {
    return getIndividualClassNames(className, 'selectButton');
};


function ButtonWithContextMenu (symbol, container) {
    Button.apply(this, arguments);
    this.dropDownMenu = new DropDownMenu(select(container));
    this.setConfig({
        dropDownMenu: getDefaultDropDownConf()
    });

    this.dropDownMenu.setConfig(this.config.dropDownMenu);
}


ButtonWithContextMenu.prototype = Object.create(Button.prototype);

ButtonWithContextMenu.prototype.add = function (list) {
    var dropDownMenu = this.dropDownMenu;
    dropDownMenu.add(list);
};

ButtonWithContextMenu.prototype.postDraw = function () {
    Button.prototype.postDraw.call(this);
    var self = this,
        bBox = self.getBBox(),
        measurement = {},
        supportsTouch = 'createTouch' in document;

    this.on('mouseover', function () {
        var listContainer = self.dropDownMenu.getFirstContainer(),
            dimensions = listContainer.getDimensions(),
            width;

        width = dimensions.width;
        measurement.top = bBox.y + bBox.height + 3;
        measurement.left = bBox.x + bBox.width - width;
        self.dropDownMenu.show(measurement);
    });

    if (!supportsTouch) {
        this.on('mouseout', function () {
            self.dropDownMenu.hide();
        });
    }

    this.on('touchend', function () {
        var listContainer = self.dropDownMenu.getFirstContainer(),
            dimensions = listContainer.getDimensions(),
            width;

        width = dimensions.width;
        measurement.top = bBox.y + bBox.height + 3;
        measurement.left = bBox.x + bBox.width - width;
        self.dropDownMenu.show(measurement);
        self.removeState('hover');
    });

    if (supportsTouch) {
        d3.select('html').on('touchstart.' + new Date().getTime(), function () {
            var target = d3.event.target,
                container = self.elements.container.node();

            if (!isDescendant(container, target)) {
                self.dropDownMenu.hide();
            }
        });
        d3.select('html').on('click.' + new Date().getTime(), function () {
            var target = d3.event.target,
                container = self.elements.container.node();

            if (!isDescendant(container, target)) {
                self.dropDownMenu.hide();
            }
        });
    }

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


export function buttonWithContextMenu (symbol, container) {
    return new ButtonWithContextMenu(symbol, container);
}

export function selectButton (options) {
    return new SelectButton(options);
}
/* jshint ignore:end */
