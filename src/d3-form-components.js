
import {default as SmartLabel} from "fusioncharts-smartlabel";
import {mergeConf, getTextDimensions} from "./utils";
import {setStyle} from "./utils";
import {setAttrs} from "./utils";
import {dropDownMenu as DropDownMenu} from "./dropdownmenu";
import {select} from "d3-selection";
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
    smartLabel = new SmartLabel(new Date().getTime()),
    classRules = {
        button: ['container', 'text', 'symbol'],
        inputButton: ['container', 'text', 'input'],
        selectButton: ['container', 'text', 'arrow']
    },
    getCompositeClassNames = function (className, component) {
        var rules = classRules[component],
            classNames = {},
            i,
            len = rules.length;

        for (i = 0; i < len; i++) {
            classNames[rules[i]] = className + '-' + rules[i];
        }
        return classNames;
    },
    getDefaultDropDownConf = function () {
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


    typeof symbol === 'string' && (dimensions = getTextDimensions(symbol, textClass, select('svg'), smartLabel));

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

    containerEl.attr('x', x).attr('y', y).attr('width', width).attr('height', height)
        .classed(containerClass, true).attr('rx', r).attr('ry', r);

    if (typeof symbol === 'string') {
        if (!textEl) {
            textEl = buttonGroup.append('text');
        }

        boxDim = {
            x: x + padLeft,
            y: y + padTop,
            width: width - padRight - padLeft,
            height: height - padBottom - padTop
        };

        textEl.text(symbol).attr('x', boxDim.x + boxDim.width / 2).attr('y', boxDim.y + boxDim.height / 2)
        .attr('dy', '0.35em').attr('text-anchor', 'middle').attr('pointer-events', 'none').classed(textClass, true);
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
    return this;
};

Button.prototype.show = function () {
    this.buttonGroup.attr('visibility', 'visible');
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
        dy: '0.35em'
    };

    setAttrs(textEl, textAttrs);

    textEl.classed(textClass, true);

    !inputBox && (inputBox = elements.inputBox = select(container).append('input'));

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
    var dropDownMenu = this.dropDownMenu,
        self = this,
        container = dropDownMenu.container.getContainer();

    container.selectAll('div').each(function (d) {
        var item;
        if (d.value === value) {
            item = select(this);
            self.selectedItem && self.selectedItem.classed('selected', false);
            item.classed('selected', true);
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
        contClassNames = container.classNames || {},
        listItemClassNames = listItem.classNames || {},
        bBox = node.getBBox();

    if (!dropDownMenu) {
        dropDownMenu = this.dropDownMenu = new DropDownMenu(select(containerElem));
    }

    dropDownMenu.setConfig({
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

    dropDownMenu.setMeasurement({
        top: bBox.y + bBox.height,
        left: bBox.x,
        width: bBox.width
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
};

SelectButton.prototype.add = function (list) {
    var dropDownMenu = this.dropDownMenu,
        self = this,
        listContainer,
        dimensions,
        bBox = this.elements.container.node().getBBox(),
        viewPortHeight = window.innerHeight,
        container;

    list.length !==0 && dropDownMenu.add(list);
    container = dropDownMenu.getFirstContainer();

    if (container) {
        container.on('hide', this.onBlur);

        listContainer = container.getContainer();
        dimensions = container.getDimensions();
        if (bBox.y + bBox.height + dimensions.height > viewPortHeight) {
            dropDownMenu.setMeasurement({
                top: bBox.y - dimensions.height,
                left: bBox.x,
                width: bBox.width
            });
        }

        listContainer.selectAll('div').on('click.selected', this.onSelect()).each(function (d, i) {
            if (i === 0) {
                self.selectedItem = self.selectItem(select(this), true);
            }
        });
    }
};

SelectButton.prototype.setPlaceHolderValue = function () {

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
        listItemClassNames = listItem.classNames || {};

    return item.classed(listItemClassNames.selected, value);
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
    this.dropDownMenu = new DropDownMenu(select(container));
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
    var dropDownMenu = this.dropDownMenu;
    dropDownMenu.add(adapter(list));
};

ButtonWithContextMenu.prototype.postDraw = function () {
    Button.prototype.postDraw.call(this);
    var self = this,
        bBox = self.elements.container.node().getBBox(),
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


export function buttonWithContextMenu (symbol, container) {
    return new ButtonWithContextMenu(symbol, container);
}

export function selectButton (options) {
    return new SelectButton(options);
}

