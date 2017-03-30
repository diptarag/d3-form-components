import {mergeConf, setAttrs, setStyle} from './utils';
import {select} from "d3";

var __proto,
    defMargin = {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
    },
    defPad = {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
    },
    px = function (str) {
        return str + 'px';
    },
    attachEvents = function (element, events) {
        for (var key in events) {
            element.on(key, events[key]);
        }
    },
    getMargin = function (margin) {
        return {
            'margin-left': px(margin.left),
            'margin-right': px(margin.right),
            'margin-top': px(margin.top),
            'margin-bottom': px(margin.bottom)
        }
    },
    getPadding = function (padding) {
        return {
            'padding-left': px(padding.left),
            'padding-right': px(padding.right),
            'padding-top': px(padding.top),
            'padding-bottom': px(padding.bottom)
        };
    }

function DialogBox (parentContainer) {
    var config = this.config;
    config = this.config = {
        className: 'd3-dialog-box',
        style: {
            width: 'auto',
            height: 'auto',
            display: 'inline-block',
            position: 'absolute',
            left: '0px',
            top: '0px'
        }
    };
    this.parentContainer = parentContainer;
    this.components = [];
}

function getElementsByType (elementArr) {
    var elementByType = {},
        i;

    for (i = 0; i < elementArr.length; i++) {
        elementByType[elementArr[i].type] = elementByType[elementArr[i].type] || (elementByType[elementArr[i].type] = []);
        elementByType[elementArr[i].type].push(elementArr[i]);
    }
    return elementByType;
}

__proto = DialogBox.prototype;

__proto.setConfig = function (config) {
    mergeConf(config, this.config);
};

__proto.add = function (components) {
    this.components = this.components.concat(components);
    this.createDialogBox();
};

__proto.hide = function () {

}

__proto.createDialogBox = function () {
    var components = this.components,
        parentContainer = this.parentContainer,
        container = this.container,
        config = this.config,
        className = config.className,
        margin = config.margin || defMargin,
        padding = config.padding || defPad;

    if (!container) {
        container = this.container = select(parentContainer).append('div');
    }

    container.classed(className, true);
    setStyle(container, config.style);
    setStyle(container, {
        'margin-left': px(margin.left),
        'margin-right': px(margin.right),
        'margin-top': px(margin.top),
        'margin-bottom': px(margin.bottom),
        'padding-left': px(padding.left),
        'padding-right': px(padding.right),
        'padding-top': px(padding.top),
        'padding-bottom': px(padding.bottom)
    });
    this.createRowsRecursively(container, components);
};

__proto.createRowsRecursively = function (container, components) {
    var selection,
        selectionEnter,
        self = this;

    selection = container.selectAll('div').data(components);

    selectionEnter = selection.enter().append('div');

    selectionEnter.merge(selection).each(function (d) {
        var margin = d.margin || defMargin,
            padding = d.padding || defPad;

        if (d.cols) {
            self.createRowsRecursively(select(this), d.cols);
        }

        if (d.elements) {
            self.createElements(select(this), d.elements);
        }

        setStyle(select(this), {
            'margin-left': px(margin.left),
            'margin-right': px(margin.right),
            'margin-top': px(margin.top),
            'margin-bottom': px(margin.bottom),
            'padding-left': px(padding.left),
            'padding-right': px(padding.right),
            'padding-top': px(padding.top),
            'padding-bottom': px(padding.bottom)
        });
        setStyle(select(this), d.style);
    });
};


__proto.createElements = function (selection, elementArr) {
    var elements = this.elements,
        elementsByType = getElementsByType(elementArr),
        elementSelection,
        elements,
        key,
        elementSelectionEnter;

    for (key in elementsByType) {
        elements = elementsByType[key];
        elementSelection = selection.selectAll(key).data(elements);
        elementSelectionEnter = elementSelection.enter();
        elementSelectionEnter.append(key).merge(elementSelection).each(function (data) {
            var element = select(this);
            setAttrs(element, data.attrs);
            setStyle(element, getMargin(data.margin || defMargin));
            data.events && attachEvents(element, data.events);
            data.html && element.html(data.html);
            if (key === 'select') {
                var option = element.selectAll('option').data(data.options).enter().append('option').html(function (d) {
                    return d;
                });
                element.node().add(option.node());
            }
        });
    }
};


__proto.show = function () {

};

export function dialogBox (parentCon) {
    return new DialogBox(parentCon);
}
