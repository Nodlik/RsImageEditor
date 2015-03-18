(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["resize.dialog.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["editor.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"rs-editor-block\">\n    <input type=\"file\" id=\"rsFileInput\" style=\"display: none\" multiple />\n    <div id=\"rsToolbarPlace\" class=\"rs-toolbar\"></div>\n    <div class=\"rs-content\">\n        <div id=\"rsImagePlace\" class=\"rs-image-place\"></div>\n        <div id=\"rsPopover\" class=\"rs-popover hide\"></div>\n    </div>\n</div>";
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
output += "\">\n    <div class=\"rs-image-block\">\n        <img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "image")),"src", env.autoesc), env.autoesc);
output += "\" />\n    </div>\n    <div class=\"rs-image-data\">\n        <div class=\"rs-image-data__inf\">\n            <div class=\"rs-image-data__label\">";
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["single.image.html.njs"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"rs-single-image\" id=\"rsSingleImage\">\n\n</div>";
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
