(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["resize.dialog.twig"] = (function() {function root(env, context, frame, runtime, cb) {
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
