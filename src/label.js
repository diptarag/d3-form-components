
import {default as SmartLabel} from "fusioncharts-smartlabel";
import {mergeConf, setAttrs, getSmartComputedStyle} from "./utils";
import {select} from "d3-selection";

var instances = {};
function getSmartLabelInstance() {
    return instances.smartLabel || (instances.smartLabel = new SmartLabel(new Date().getTime()));
}

function Label (text, config) {
    this.config = {
        className: 'd3-label-default',
        specificClassName: '',
        margin: {
            top: 0,
            bottom: 0,
            right: 5,
            left: 0
        },
        container: {}
    };

    this.text = text;
    this.svgElems = {};
    config && this.setConfig(config);
}

Label.prototype.draw = function (x, y, group) {
    var config = this.config,
        container = config.container,
        svgElems = this.svgElems,
        text = this.text,
        textNode = svgElems.node,
        textDim = this.textDimensions,
        height = config.height,
        textX = x,
        containerNode = svgElems.containerNode,
        width,
        classNames = this.getIndividualClassNames(this.getClassName()),
        boundClassName = classNames.container,
        labelClassName = classNames.text,
        textY = y,
        textH;

    if (!this.logicalSpace) {
        this.logicalSpace = this.getLogicalSpace();
    }
    width = this.logicalSpace.width;
    textX += width / 2;
    textY += (height || 0) / 2;

    if (!containerNode) {
        containerNode = svgElems.containerNode = group.append('rect');
    }

    setAttrs(containerNode, {
        x: x,
        y: y,
        height: height,
        'fill-opacity': '0',
        width: width,
        class: boundClassName
    });

    if (!textNode) {
        textNode = svgElems.node = group.append('text').text(text).style('text-anchor', 'middle');
    }

    setAttrs(textNode, {
        x: textX,
        y: textY,
        class: labelClassName,
        dy: '0.35em'
    });

    return this;

};

Label.prototype.getClassName = function () {
    return this.config.specificClassName;
};

Label.prototype.getIndividualClassNames = function (className) {
    return {
        container: className + '-container',
        text: className + '-text'
    };
};

Label.prototype.setConfig = function (config) {
    if (!this.config) {
        this.config = {};
    }
    else {
        mergeConf(config, this.config);
    }
};

Label.prototype.getConfig = function (key) {
    return this.config[key];
};

Label.prototype.getLogicalSpace = function () {
    var config = this.config,
        container = config.container,
        text = this.text,
        className,
        style,
        width,
        height,
        textDim,
        smartLabel = getSmartLabelInstance();

    smartLabel.useEllipsesOnOverflow(1);

    className = this.getIndividualClassNames(this.getClassName()).text;
    // className = lib.getCompositeClassNames(config.className, rules).label;
    style = getSmartComputedStyle(select('svg'), className);
    smartLabel.setStyle(style);

    textDim = smartLabel.getOriSize(text);

    this.textDimensions = textDim;
    width = container.width || textDim.width;
    height = container.height || textDim.height;

    this.logicalSpace = {
        width: width,
        height: height
    };

    return {
        width: width,
        height: height
    };

}

Label.prototype.getWidth = function () {
    if (!this.logicalSpace) {
        this.logicalSpace = this.getLogicalSpace();
    }
    return this.logicalSpace.width;
};

Label.prototype.getHeight = function () {
    if (!this.logicalSpace) {
        this.logicalSpace = this.getLogicalSpace();
    }
    return this.logicalSpace.height;
};


export function label (text, config) {
    return new Label(text, config);
}
