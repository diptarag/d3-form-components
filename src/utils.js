
var classRules = {
    button: ['container', 'text', 'symbol'],
    inputButton: ['container', 'text', 'input', 'icon'],
    selectButton: ['container', 'text', 'arrow'],
    label: ['container', 'text']
};

export function getIndividualClassNames (className, component) {
    var rules = classRules[component],
        classNames = {},
        i,
        len = rules.length;

    for (i = 0; i < len; i++) {
        classNames[rules[i]] = className + '-' + rules[i];
    }
    return classNames;
}

export function getSmartComputedStyle (group, css) {
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

export function getTextDimensions (text, className, group, smartLabel) {
    var style = getSmartComputedStyle(group, className),
        dimensions;

    smartLabel.setStyle(style);
    dimensions = smartLabel.getOriSize(text);
    return {
        width: dimensions.width,
        height: dimensions.height
    };
}

export function mergeConf (source, sink, theirsMergeEnabled) {
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

export function setStyle(selection, styles) {
    var key;

    for (key in styles) {
        selection.style(key, styles[key]);
    }
}

export function setAttrs(selection, attrs) {
    var key;

    for (key in attrs) {
        selection.attr(key, attrs[key]);
    }
}

export function isDIV (ele) {
    if (ele && ele.nodeName && ele.nodeName.toUpperCase() === 'DIV') {
        return true;
    }

    return false;
}
