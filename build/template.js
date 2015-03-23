(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["color.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <h2>Color</h2>\n</div>\n<div class=\"m__color-item\">\n    Brightness\n    <div id=\"brightnessSlider\"></div>\n</div>\n<div class=\"m__color-item\">\n    Vibrance\n    <div id=\"vibranceSlider\"></div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["crop.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <button id=\"crop_ok\">OK!</button>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["resize-grid.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <input class=\"m_resize-width\" type=\"text\" placeholder=\"width\" value=\"150\" /> <br />\n    <input class=\"m_resize-height\" type=\"text\" placeholder=\"height\"value=\"100\" /> <br /> <br />\n\n    <button class=\"m_resize-ok\" value=\"ok\">OK!</button>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["resize-single.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <h2>Size</h2>\n</div>\n\n<div class=\"m__single-resize\">\n    <div class=\"m__single-resize__val width\">\n        Width <br />\n        <input type=\"number\" /> px\n    </div>\n\n    <div class=\"m__single-resize__lock\">\n        <i class=\"\n        ";
if(runtime.contextOrFrameLookup(context, frame, "isLocked")) {
output += "\n        fa fa-lock\n        ";
;
}
else {
output += "\n        fa fa-unlock\n        ";
;
}
output += "\"></i>\n    </div>\n\n    <div class=\"m__single-resize__val height\">\n        Height <br />\n        <input type=\"number\" /> px\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["editor.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"rs-editor-block\">\n    <input type=\"file\" id=\"rsFileInput\" style=\"display: none\" multiple />\n    <div id=\"rsToolbarPlace\" class=\"rs-toolbar\"></div>\n    <div class=\"rs-content\">\n        <div id=\"rsImagePlace\" class=\"rs-image-place\"></div>\n        <div class=\"rs-popover\">\n            <div id=\"rsPopover\"></div>\n            <div id=\"rsInformation\" class=\"rs-information\">\n\n            </div>\n        </div>\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["grid.image.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"rs-image\" data-id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"id", env.autoesc), env.autoesc);
output += "\">\n    <div class=\"rs-image-block\">\n        <!--<img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"src", env.autoesc), env.autoesc);
output += "\" />-->\n    </div>\n    <div class=\"rs-image-data\">\n        <div class=\"rs-image-data__inf\">\n            <div class=\"rs-image-data__label\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"label", env.autoesc), env.autoesc);
output += "</div>\n            <div class=\"rs-image-data__name\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"name", env.autoesc), env.autoesc);
output += "</div>\n        </div>\n        <div class=\"rs-image-data__select\">\n            <input type=\"checkbox\" class=\"rs-image-selection-checkbox\" />\n        </div>\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["grid.information.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<h2 class=\"rs-information__title\">\n    Information\n</h2>\n<div class=\"rs-information__total\">\n    <div>\n        Pictures <br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "count"), env.autoesc);
output += "</b>\n    </div>\n    <div>\n        Min resolution <br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "minResolution"), env.autoesc);
output += "</b>\n    </div>\n\n    <div>\n        Max resolution<br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "maxResolution"), env.autoesc);
output += "</b>\n    </div>\n</div>\n<div class=\"rs-information__resolution\">\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["single.image.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"rs-single-image\">\n    <div class=\"rs-canvas-place\" id=\"rsSingleImage\">\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["single.information.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<h2 class=\"rs-information__title\">\n    Zoom\n</h2>\n<div class=\"rs-information__zoom\">\n    <a href=\"#to-width\" id=\"fitToWidth\">Fit to width</a>\n    <a href=\"#source\" id=\"sourceSize\">Original size</a>\n\n    <div class=\"rs-information__zoom-value\">\n        Actual zoom: <b id=\"zoomValue\">100%</b>\n    </div>\n</div>\n\n<h2 class=\"rs-information__title\">\n    Information\n</h2>\n<div class=\"rs-information__total\">\n    <div>\n        Resolution <br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "resolution"), env.autoesc);
output += "</b>\n    </div>\n    <div>\n        Size <br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "size"), env.autoesc);
output += "</b>\n    </div>\n    <div>\n        Type <br />\n        <b>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "type"), env.autoesc);
output += "</b>\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["toolbar.button.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div id=\"t-button__";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"name", env.autoesc), env.autoesc);
output += "\" class=\"rs-toolbar-button\">\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"icon", env.autoesc) != "") {
output += "\n    <i class=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"icon", env.autoesc), env.autoesc);
output += "\"></i>\n    ";
;
}
else {
output += "\n        ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"localizedName", env.autoesc), env.autoesc);
output += "\n    ";
;
}
output += "\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
