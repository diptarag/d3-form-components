
import {default as SmartLabel} from "fusioncharts-smartlabel";
import {mergeConf} from "./utils";
import {setStyle} from "./utils";
import {isDIV} from "./utils";

var PX = 'px',
    DEFAULT_TIMEOUT = 300,
    d3 = window.d3,
    instances = {};

function getSmartLabelInstance() {
    return instances.smartLabel || (instances.smartLabel = new SmartLabel(new Date().getTime()));
}

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
        style.top = parentNode.offsetTop + target.offsetTop + PX;
        containerNode = this.container.node();

        side = overflow(containerNode, parentNode);

        if (position === 'right') {
            style.left = (side === 2 ?
                parentNode.offsetLeft - containerNode.offsetWidth :
                parentNode.offsetLeft + parentNode.offsetWidth) + PX;

            style.right = 'auto';
        }
        else {

            style.left = (side === 2 || side === 0 ?
                parentNode.offsetLeft - containerNode.offsetWidth :
                parentNode.offsetLeft + parentNode.offsetWidth) + PX;

            style.right = 'auto';
        }
    }
    else if (!isDIV(target) && target && target.getBBox) {
        bBox = target.getBBox();
        offsetWidth = this.container.node().offsetWidth;

        style.top = bBox.y + bBox.height + 3 + PX;

        if (position === 'left') {
            style.left = bBox.x + PX;
            style.right = 'auto';
        }
        else if (position === 'right') {
            style.left = bBox.x + bBox.width - offsetWidth + PX;
            style.right = 'auto';
        }
    }
    else if (measurement) {
        console.log(measurement.top);
        style = {
            left: measurement.left === undefined ? 'auto' : measurement.left + PX,
            top : measurement.top === undefined ? 'auto' : measurement.top + PX,
            right: measurement.right === undefined ? 'auto' : measurement.right + PX,
            bottom : measurement.bottom === undefined ? 'auto' : measurement.bottom + PX,
            width: measurement.width === undefined ? 'auto' : measurement.width + PX,
            height: measurement.height === undefined ? 'auto' : measurement.height + PX
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

DropDownMenu.prototype.namespace = function (namespace) {
    var config = this.config,
        container = config.container,
        listItem = config.listItem,
        states = listItem.states,
        key;

    container.className = namespace + '-' + container.className;

    listItem.className = namespace + '-' + listItem.className;
    for (key in states) {
        states[key] = namespace + '-' + states[key];
    }
};

DropDownMenu.prototype.add = function (listItems, refTo) {
    var self = this,
        parentContainer = self.parentContainer,
        config = this.config,
        listItem = config.listItem || {},
        listItemClass = listItem.className,
        listItemHover = function (d) {
            var config = self.config,
                listItem = config.listItem || {},
                states = listItem.states || {},
                hoverClass = states.hover,
                subContainer = d.subContainer;

            d.parentContainer && d.parentContainer.show();
            d.interactivity !== false && d.listItem.classed(hoverClass, true);
            subContainer && subContainer.show(this);
        },
        listItemHoverOut = function (d) {
            var config = self.config,
                listItem = config.listItem || {},
                states = listItem.states || {},
                hoverClass = states.hover;

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
        contClass = (config.container && config.container.className),
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
        padding,
        smartLabel = getSmartLabelInstance();

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

    (function recursiveParser (items, fCon, parentListItem) {
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
            parentListItem && (d.parentListItem = parentListItem);
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
                        'padding-left': defPad.left + PX
                    }
                },
                {
                    html: name,
                    style: {
                        'padding-left': (padding.left - smartLabel.getOriSize('&#9666;').width - defPad.left) + 'px'
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

                refContainer = recursiveParser(handler, container, listItem);

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
                listItem.on(action + '.custom', handler);
            }

        });

        return listContainer;
    })(listItems, refTo, null);

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

export function dropDownMenu (container) {
    return new DropDownMenu(container);
}
