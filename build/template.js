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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["crop-resize.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"crop-resize\">\n    <div class=\"crop-resize__action fit\">\n        <h2>Fit to a rect</h2>\n\n        <div class=\"fit__sizes sizes\">\n            <div class=\"sizes__width\">\n                <label for=\"fitSizesWidth\">Width</label><br />\n                <input type=\"number\" id=\"fitSizesWidth\"  /> px\n            </div>\n            <div class=\"sizes__height\">\n                <label for=\"fitSizesHeight\">Height</label><br />\n                <input type=\"number\" id=\"fitSizesHeight\" /> px\n            </div>\n        </div>\n\n        <div class=\"fit__methods\">\n            <p>Choose Method:</p>\n            <ul class=\"module-list\">\n                <li data-value=\"resize-all\">Resizing on all sides</li>\n                <li data-value=\"stretch-to-width\">Stretch width</li>\n                <li data-value=\"stretch-to-height\">Stretch height</li>\n                <li data-value=\"stretch-to-rect\">Stretch to rect</li>\n            </ul>\n\n            <div class=\"fit__methods-canvas\">\n                <canvas id=\"fitCanvas\"></canvas>\n            </div>\n        </div>\n\n        <div class=\"fit__method-position methods\">\n            <p>Position:</p>\n            <div class=\"fit-position methods-list\" id=\"fitPosition\">\n                <div class=\"fp fp-left-top selected\" style=\"left: 0; top: 0\"></div>\n                <div class=\"fp fp-top\" style=\"left: 20px; top: 0\"></div>\n                <div class=\"fp fp-right-top\" style=\"right: 0; top: 0\"></div>\n                <div class=\"fp fp-left\" style=\"left: 0; top: 20px\"></div>\n                <div class=\"fp fp-right\" style=\"right: 0; top: 20px\"></div>\n                <div class=\"fp fp-left-bottom\" style=\"left: 0; bottom: 0\"></div>\n                <div class=\"fp fp-bottom\" style=\"left: 20px; bottom: 0\"></div>\n                <div class=\"fp fp-right-bottom\" style=\"right: 0; bottom: 0\"></div>\n            </div>\n        </div>\n\n        <div class=\"fit-crop__button\">\n            <input type=\"checkbox\" id=\"fitCrop\" checked /> <label for=\"fitCrop\">Crop image if its size is larger than the size of rectangle</label>\n        </div>\n\n        <div class=\"fit__button\">\n            <button class=\"fit-button crop-button\">Apply</button>\n        </div>\n    </div>\n\n    <div class=\"crop-resize__action crop\" style=\"margin-top: 20px\">\n        <h2>Crop</h2>\n\n        <div class=\"crop-sizes sizes\">\n            <div class=\"crop__width\">\n                <label for=\"cropSizesWidth\">Width</label><br />\n                <input type=\"number\" id=\"cropSizesWidth\"  /> px\n            </div>\n            <div class=\"crop__height\">\n                <label for=\"cropSizesHeight\">Height</label><br />\n                <input type=\"number\" id=\"cropSizesHeight\" /> px\n            </div>\n        </div>\n\n        <div class=\"crop__method-position methods\">\n            <p>Position:</p>\n            <div class=\"crop-position methods-list\" id=\"cropPosition\">\n                <div class=\"fp fp-left-top selected\" style=\"left: 0; top: 0\"></div>\n                <div class=\"fp fp-top\" style=\"left: 20px; top: 0\"></div>\n                <div class=\"fp fp-right-top\" style=\"right: 0; top: 0\"></div>\n                <div class=\"fp fp-left\" style=\"left: 0; top: 20px\"></div>\n                <div class=\"fp fp-center\" style=\"left: 20px; top: 20px\"></div>\n                <div class=\"fp fp-right\" style=\"right: 0; top: 20px\"></div>\n                <div class=\"fp fp-left-bottom\" style=\"left: 0; bottom: 0\"></div>\n                <div class=\"fp fp-bottom\" style=\"left: 20px; bottom: 0\"></div>\n                <div class=\"fp fp-right-bottom\" style=\"right: 0; bottom: 0\"></div>\n            </div>\n        </div>\n\n        <div class=\"fit__button\">\n            <button class=\"crop-button\" id=\"cropButton\">Crop</button>\n        </div>\n    </div>\n</div>";
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["filter.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"m-filter\">\n    <div class=\"m-filter__canvas\">\n        <canvas id=\"mFilter-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "filter")),"name", env.autoesc), env.autoesc);
output += "\" width=\"50\" height=\"30\"></canvas>\n    </div>\n\n    <div class=\"m-filter__name\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "filter")),"displayName", env.autoesc), env.autoesc);
output += "</div>\n\n    <div class=\"m-filter__vignette\">\n        <input type=\"checkbox\" checked id=\"mFilter-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "filter")),"name", env.autoesc), env.autoesc);
output += "-vignette\" /> <br />\n    </div>\n</div>";
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["filters.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <h2>Filters</h2>\n</div>\n\n<div class=\"m-filters__filters-list\">\n\n</div>";
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
output += "<div class=\"rs-editor-block\">\n    <input type=\"file\" id=\"rsFileInput\" style=\"display: none\" multiple />\n    <div id=\"rsToolbarPlace\" class=\"rs-toolbar\">\n        <div id=\"rsToolbarMainAction\" class=\"rs-toolbar-button-block\"></div>\n        <div id=\"rsToolbarEditorAction\" class=\"rs-toolbar-button-block rs-editor-toolbar\"></div>\n    </div>\n    <div class=\"rs-progress-bar\" id=\"rsProgressBar\">\n\n    </div>\n    <div class=\"rs-content\">\n        <div id=\"rsImagePlace\" class=\"rs-image-place\"></div>\n        <div class=\"rs-popover\">\n            <div id=\"rsPopover\"></div>\n            <div id=\"rsInformation\" class=\"rs-information\">\n\n            </div>\n        </div>\n    </div>\n</div>";
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
output += "\" id=\"img__";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"id", env.autoesc), env.autoesc);
output += "\">\n    <div class=\"rs-image-block\">\n        <!--<img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"src", env.autoesc), env.autoesc);
output += "\" />-->\n        <!--";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"src", env.autoesc), env.autoesc);
output += "-->\n    </div>\n    <div class=\"rs-image-data\">\n        <div class=\"rs-image-data__inf\">\n            <div class=\"rs-image-data__label\">";
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
output += "\" class=\"rs-toolbar-button ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"css", env.autoesc) != "") {
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "button")),"css", env.autoesc), env.autoesc);
;
}
output += "\">\n    ";
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
