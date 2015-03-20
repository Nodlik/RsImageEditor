/// <reference path="../Image/RsImage.ts"/>
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="EditorAction.ts"/>
var Core;
(function (Core) {
    var ActionDispatcher = (function () {
        function ActionDispatcher(image) {
            this.current = -1;
            this.image = image;
            this.actions = [];
            this.actionsResult = [];
        }
        ActionDispatcher.prototype.process = function (action) {
            this.actions.splice(this.current + 1);
            this.actions.push(action);
            this.current++;
            this.actionsResult.splice(this.current);
            this.actionsResult.push(this.doAction(action.execute, action));
            return _.last(this.actionsResult);
        };
        ActionDispatcher.prototype.undo = function () {
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                this.actionsResult.push(this.doAction(act.unExecute, act));
                return _.last(this.actionsResult);
            }
            return Promise.resolve(this.image);
        };
        ActionDispatcher.prototype.redo = function () {
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];
                this.actionsResult.push(this.doAction(act.execute, act));
                return _.last(this.actionsResult);
            }
            return Promise.resolve(this.image);
        };
        ActionDispatcher.prototype.doAction = function (actionFunction, object) {
            var _this = this;
            if (this.actionsResult.length == 0) {
                return actionFunction.apply(object);
            }
            return new Promise(function (resolve, reject) {
                _.last(_this.actionsResult).then(function (img) {
                    actionFunction.apply(object).then(function (img) {
                        resolve(img);
                    });
                });
            });
        };
        return ActionDispatcher;
    })();
    Core.ActionDispatcher = ActionDispatcher;
})(Core || (Core = {}));
/// <reference path="../Action/ActionDispatcher.ts"/>
var Core;
(function (Core) {
    var RsImage = (function () {
        function RsImage(imageName, imageType) {
            this.imageName = imageName;
            this.imageType = imageType;
            this.id = '';
            this.actionDispatcher = null;
            this.imageBase64 = ''; // BASE 64 processed image
            this.brightness = 0;
            this.vibrance = 0;
            this.hue = 0;
            this.gamma = 0;
            this.clip = 0;
            this.stackBlur = 0;
            this.contrast = 0;
            this.saturation = 0;
            this.exposure = 0;
            this.sepia = 0;
            this.noise = 0;
            this.sharpen = 0;
            this.actionDispatcher = new Core.ActionDispatcher(this);
        }
        RsImage.prototype.create = function (imageBase64) {
            var _this = this;
            this.imageBase64 = imageBase64;
            return new Promise(function (resolve, reject) {
                _this.getImage().then(function (img) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    _this.originalImage = context.getImageData(0, 0, img.width, img.height);
                    _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                    _this.init();
                    resolve(_this);
                });
            });
        };
        RsImage.prototype.init = function () {
            this.processedImage = this.originalImage;
            this.width = this.originalImage.width;
            this.height = this.originalImage.height;
            this.brightness = 0;
        };
        RsImage.prototype.getOriginalCoordinates = function (x, y) {
            return {
                x: (this.originalImage.width * x) / this.processedImage.width,
                y: (this.originalImage.height * y) / this.processedImage.height
            };
        };
        RsImage.prototype.getOriginalImage = function () {
            return this.originalImage;
        };
        RsImage.prototype.replaceOriginal = function (image) {
            this.originalImage = image;
        };
        RsImage.prototype.crop = function (left, top, width, height) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.originalImage.width;
            canvas.height = this.originalImage.height;
            context.putImageData(this.originalImage, 0, 0);
            var corner = this.getOriginalCoordinates(left, top);
            var size = this.getOriginalCoordinates(width, height);
            this.originalImage = context.getImageData(corner.x, corner.y, size.x, size.y);
            this.width = width;
            this.height = height;
        };
        RsImage.prototype.save = function () {
            var _this = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;
            context.putImageData(this.originalImage, 0, 0);
            /* RESIZE */
            var resizePromise;
            if ((this.width != this.originalImage.width) || (this.height != this.originalImage.height)) {
                resizePromise = (new Core.ImageResizer(this.originalImage, this.width, this.height)).resize();
            }
            else {
                resizePromise = Promise.resolve(context.getImageData(0, 0, this.width, this.height));
            }
            /* CAMAN */
            return resizePromise.then(function (imageData) {
                canvas.width = imageData.width;
                canvas.height = imageData.height;
                context.putImageData(imageData, 0, 0);
                return new Promise(function (resolve, reject) {
                    var self = _this;
                    Caman(canvas, function () {
                        var caman = this;
                        caman.brightness(self.brightness);
                        caman.vibrance(self.vibrance);
                        caman.render(function () {
                            resolve(context.getImageData(0, 0, imageData.width, imageData.height));
                        });
                    });
                });
            }).then(function (imageData) {
                _this.processedImage = imageData;
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.width = _this.processedImage.width;
                canvas.height = _this.processedImage.height;
                context.putImageData(_this.processedImage, 0, 0);
                _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                return _this;
            });
        };
        RsImage.prototype.getSize = function () {
            return Math.round(atob(this.getImageBase64().substr(this.getImageBase64().indexOf(';base64') + 8)).length / (1000));
        };
        RsImage.prototype.getImageData = function () {
            return this.processedImage;
        };
        RsImage.prototype.getWidth = function () {
            return this.processedImage.width;
        };
        RsImage.prototype.getHeight = function () {
            return this.processedImage.height;
        };
        RsImage.prototype.getName = function () {
            return this.imageName;
        };
        RsImage.prototype.getLabel = function () {
            return '';
        };
        RsImage.prototype.getType = function () {
            return this.imageType;
        };
        RsImage.prototype.getImageBase64 = function () {
            return this.imageBase64;
        };
        RsImage.prototype.getActionDispatcher = function () {
            return this.actionDispatcher;
        };
        RsImage.prototype.setId = function (id) {
            this.id = id;
        };
        RsImage.prototype.getId = function () {
            return this.id;
        };
        RsImage.prototype.getImage = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve(img);
                };
                img.src = _this.imageBase64;
            });
        };
        return RsImage;
    })();
    Core.RsImage = RsImage;
})(Core || (Core = {}));
/// <reference path="../Action/ActionDispatcher.ts"/>
var Core;
(function (Core) {
    var ImagePixel = (function () {
        function ImagePixel(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        ImagePixel.prototype.devig = function (val) {
            this.r /= val;
            this.g /= val;
            this.b /= val;
            this.a /= val;
            return this;
        };
        return ImagePixel;
    })();
    var ImageResizer = (function () {
        function ImageResizer(original, newWidth, newHeight) {
            this.original = original;
            this.newWidth = newWidth;
            this.newHeight = newHeight;
            this.size = this.original.data.length;
        }
        ImageResizer.prototype.resize = function () {
            var wSize = this.getWidthGridSize();
            var hSize = this.getHeightGridSize();
            if ((wSize > 2) && (hSize > 2)) {
                return Promise.resolve(this.downScaleSuperSampling(wSize, hSize));
            }
            else {
                return this.upScale();
            }
        };
        ImageResizer.prototype.upScale = function () {
            var _this = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.original.width;
            canvas.height = this.original.height;
            context.putImageData(this.original, 0, 0);
            var img = new Image();
            return new Promise(function (resolve, reject) {
                img.onload = function () {
                    canvas.width = _this.newWidth;
                    canvas.height = _this.newHeight;
                    context.drawImage(img, 0, 0, _this.newWidth, _this.newHeight);
                    resolve(context.getImageData(0, 0, _this.newWidth, _this.newHeight));
                };
                img.src = canvas.toDataURL();
            });
        };
        ImageResizer.prototype.downScaleSuperSampling = function (wSize, hSize) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var result = context.createImageData(this.newWidth, this.newHeight);
            var cut = this.cutImageData(wSize, hSize);
            var c = 0;
            for (var row = 0; row < this.newHeight; row++) {
                for (var col = 0; col < this.newWidth; col++) {
                    var p = cut[row][col];
                    if (p) {
                        result.data[c] = p.r;
                        result.data[c + 1] = p.g;
                        result.data[c + 2] = p.b;
                        result.data[c + 3] = p.a;
                        c += 4;
                    }
                }
            }
            return result;
        };
        ImageResizer.prototype.cutImageData = function (wSize, hSize) {
            var rowNumber = 0;
            var data = [];
            for (var row = 0; row < this.original.height; row = row + hSize) {
                data[rowNumber] = [];
                for (var col = 0; col < this.original.width; col = col + wSize) {
                    var p = new ImagePixel(0, 0, 0, 0);
                    var c = 0;
                    for (var i = row; i < row + hSize; i++) {
                        for (var j = col; j < col + wSize; j++) {
                            var n = ((i * this.original.width) + j) * 4;
                            if (n + 3 < this.size) {
                                p.r = p.r + this.original.data[n];
                                p.g = p.g + this.original.data[n + 1];
                                p.b = p.b + this.original.data[n + 2];
                                p.a = p.a + this.original.data[n + 3];
                                c++;
                            }
                        }
                    }
                    data[rowNumber].push(p.devig(c));
                }
                rowNumber++;
            }
            return data;
        };
        ImageResizer.prototype.getWidthGridSize = function () {
            return Math.floor(this.original.width / this.newWidth);
        };
        ImageResizer.prototype.getHeightGridSize = function () {
            return Math.floor(this.original.height / this.newHeight);
        };
        return ImageResizer;
    })();
    Core.ImageResizer = ImageResizer;
})(Core || (Core = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
var Modules;
(function (Modules) {
    var BrightnessAction = (function () {
        function BrightnessAction(image, brightness) {
            this.image = image;
            this.brightness = brightness;
        }
        BrightnessAction.prototype.execute = function () {
            this.oldBrightness = this.image.brightness;
            this.image.brightness = this.brightness;
            return this.image.save();
        };
        BrightnessAction.prototype.unExecute = function () {
            this.image.brightness = this.oldBrightness;
            return this.image.save();
        };
        return BrightnessAction;
    })();
    Modules.BrightnessAction = BrightnessAction;
})(Modules || (Modules = {}));
var Core;
(function (Core) {
    (function (ModuleType) {
        ModuleType[ModuleType["ACTION"] = 0] = "ACTION";
        ModuleType[ModuleType["DELEGATE"] = 1] = "DELEGATE";
        ModuleType[ModuleType["GROUP"] = 2] = "GROUP";
    })(Core.ModuleType || (Core.ModuleType = {}));
    var ModuleType = Core.ModuleType;
})(Core || (Core = {}));
/// <reference path="ModuleType.ts"/>
/// <reference path="EditorModule.ts"/>
var Core;
(function (Core) {
    var ImageManager = (function () {
        function ImageManager() {
            this.images = {};
            this.collections = [];
        }
        ImageManager.prototype.newCollection = function (images) {
            var c = new Core.ImageCollection(this);
            for (var img in images) {
                c.add(img);
            }
            this.collections.push(c);
            return c;
        };
        /**
         * generate unique id to image
         *
         * @param image
         */
        ImageManager.prototype.tryAdd = function (image) {
            // wtf?
            if (image.getId() == '') {
                var key = Math.random().toString(36).substring(7);
                while (_.has(this.images, key)) {
                    key = Math.random().toString(36).substring(7);
                }
                image.setId(key);
                this.add(image);
            }
        };
        ImageManager.prototype.add = function (image) {
            this.images[image.getId()] = image;
        };
        ImageManager.prototype.has = function (image) {
            return _.has(this.images, image.getId());
        };
        ImageManager.prototype.remove = function (image) {
        };
        return ImageManager;
    })();
    Core.ImageManager = ImageManager;
})(Core || (Core = {}));
/// <reference path="ImageManager.ts"/>
/// <reference path="RsImage.ts"/>
var Core;
(function (Core) {
    var ImageCollection = (function () {
        function ImageCollection(manager) {
            this.manager = manager;
            this.images = [];
        }
        ImageCollection.prototype.add = function (image) {
            this.manager.tryAdd(image);
            this.images.push(image);
        };
        ImageCollection.prototype.has = function (image) {
            return (this.images.indexOf(image) > -1);
        };
        ImageCollection.prototype.remove = function (image) {
            var idx = this.images.indexOf(image);
            if (idx > -1) {
                this.images.splice(idx, 1);
            }
        };
        ImageCollection.prototype.getResolutionStats = function () {
            var min = {
                width: this.images[0].width,
                height: this.images[0].height
            };
            var max = {
                width: 0,
                height: 0
            };
            this.images.forEach(function (img) {
                if ((img.width * img.height) < (min.width * min.height)) {
                    min.width = img.width;
                    min.height = img.height;
                }
                if ((img.width * img.height) > (max.width * max.height)) {
                    max.width = img.width;
                    max.height = img.height;
                }
            });
            return {
                min: min,
                max: max
            };
        };
        ImageCollection.prototype.count = function () {
            return this.images.length;
        };
        ImageCollection.prototype.getImages = function () {
            return this.images;
        };
        ImageCollection.prototype.getImage = function (imageId) {
            var result = new ImageCollection(this.manager);
            this.images.forEach(function (image) {
                if (image.getId() == imageId) {
                    result.add(image);
                }
            });
            return result;
        };
        ImageCollection.prototype.findImage = function (ids) {
            var result = [];
            this.images.forEach(function (image) {
                if (_.contains(ids, image.getId())) {
                    result.push(image);
                }
            });
            return result;
        };
        return ImageCollection;
    })();
    Core.ImageCollection = ImageCollection;
})(Core || (Core = {}));
var UI;
(function (UI) {
    var SingleView = (function () {
        function SingleView(page, image) {
            this.page = page;
            this.image = image;
            this.canvas = null;
        }
        SingleView.prototype.type = function () {
            return 0 /* SINGLE */;
        };
        SingleView.prototype.render = function () {
            this.page.getImagePlace().html(nunjucks.render('single.image.html.njs', {}));
            this.getCanvas();
            this.renderImage();
        };
        SingleView.prototype.selected = function () {
            return [this.image];
        };
        SingleView.prototype.getAreaElement = function () {
            return this.page.getImagePlace().find('#rsSingleImage');
        };
        SingleView.prototype.getInformation = function () {
            return nunjucks.render('single.information.html.njs', {
                resolution: this.image.width + 'x' + this.image.height,
                size: this.image.getSize() + ' kb',
                type: this.image.getType()
            });
        };
        SingleView.prototype.renderImage = function () {
            this.context.putImageData(this.image.getImageData(), 0, 0);
        };
        SingleView.prototype.getCanvas = function () {
            var $canvas = this.page.getImagePlace().find('#' + this.image.getId());
            if ($canvas.length == 0) {
                this.page.getImagePlace().find('#rsSingleImage').html('<canvas id="' + this.image.getId() + '"></canvas>');
            }
            this.canvas = this.page.getImagePlace().find('#' + this.image.getId())[0];
            this.canvas.width = this.image.getWidth();
            this.canvas.height = this.image.getHeight();
            this.context = this.canvas.getContext('2d');
        };
        return SingleView;
    })();
    UI.SingleView = SingleView;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var GridView = (function () {
        function GridView(page, imageCollection) {
            this.page = page;
            this.imageCollection = imageCollection;
        }
        GridView.prototype.type = function () {
            return 1 /* GRID */;
        };
        GridView.prototype.render = function () {
            var _this = this;
            this.page.getImagePlace().html("");
            var images = this.imageCollection.getImages();
            if (images.length > 0) {
                var i = 0;
                var intervalId = setInterval(function () {
                    _this.renderImage(images[i]);
                    i++;
                    if (i == images.length) {
                        clearInterval(intervalId);
                    }
                }, 10);
            }
        };
        GridView.prototype.getInformation = function () {
            if (this.imageCollection.count() > 0) {
                var r = this.imageCollection.getResolutionStats();
                return nunjucks.render('grid.information.html.njs', {
                    count: this.imageCollection.count(),
                    minResolution: r.min.width + 'x' + r.min.height,
                    maxResolution: r.max.width + 'x' + r.max.height
                });
            }
            return '';
        };
        GridView.prototype.selected = function () {
            var ids = [];
            this.page.getImagePlace().find('.rs-image-selected').each(function (i, $el) {
                ids.push($($el).data('id'));
            });
            return this.imageCollection.findImage(ids);
        };
        GridView.prototype.renderImage = function (image) {
            var $block = $(nunjucks.render('grid.image.html.njs', {
                image: {
                    //src: image.getImageBase64(),
                    name: image.getName(),
                    id: image.getId(),
                    label: image.getLabel()
                }
            }));
            this.page.getImagePlace().append($block);
            var $canvas = $('<canvas id="' + image.getId() + '"></canvas>');
            $block.find('.rs-image-block').append($canvas);
            var c = $canvas[0];
            var ctx = c.getContext('2d');
            c.width = 150;
            c.height = 120;
            // todo keep ratio
            new Core.ImageResizer(image.getImageData(), 150, 120).resize().then(function (imageData) {
                ctx.putImageData(imageData, 0, 0);
            });
        };
        return GridView;
    })();
    UI.GridView = GridView;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var Toolbar = (function () {
        function Toolbar(page, editor) {
            this.page = page;
            this.editor = editor;
            this.$toolbar = this.editor.UI().getToolbarPlace();
        }
        Toolbar.prototype.render = function () {
            this.$toolbar.html("");
            if (this.page.getParent() !== null) {
                this.renderBackButton(this.$toolbar);
            }
            this.renderCommonButton(this.$toolbar);
        };
        Toolbar.prototype.renderModuleToolbar = function (type, $el) {
            var _this = this;
            var modules = this.editor.getModuleManager().getModules(this.editor.UI().getType(), null);
            modules.forEach(function (m) {
                var $button = $(nunjucks.render('toolbar.button.html.njs', {
                    button: {
                        name: m.name(),
                        icon: m.icon(),
                        localizedName: m.name()
                    }
                }));
                $el.append($button);
                _this.editor.UI().initModule($button, m);
            });
        };
        Toolbar.prototype.renderCommonButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'upload',
                    icon: 'fa fa-upload',
                    localizedName: 'upload'
                }
            })));
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'undo',
                    icon: 'fa fa-undo',
                    localizedName: 'undo'
                }
            })));
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'redo',
                    icon: 'fa fa-repeat',
                    localizedName: 'redo'
                }
            })));
        };
        Toolbar.prototype.renderBackButton = function ($el) {
            $el.append($(nunjucks.render('toolbar.button.html.njs', {
                button: {
                    name: 'back',
                    icon: 'fa fa-arrow-left',
                    localizedName: 'back'
                }
            })));
        };
        return Toolbar;
    })();
    UI.Toolbar = Toolbar;
})(UI || (UI = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var GridToolbar = (function (_super) {
        __extends(GridToolbar, _super);
        function GridToolbar(page, editor) {
            _super.call(this, page, editor);
        }
        GridToolbar.prototype.render = function () {
            _super.prototype.render.call(this);
            this.renderModuleToolbar(1 /* GRID */, this.$toolbar);
            this.editor.UI().initToolbar(this.$toolbar);
        };
        return GridToolbar;
    })(UI.Toolbar);
    UI.GridToolbar = GridToolbar;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var SingleToolbar = (function (_super) {
        __extends(SingleToolbar, _super);
        function SingleToolbar(page, editor) {
            _super.call(this, page, editor);
        }
        SingleToolbar.prototype.render = function () {
            _super.prototype.render.call(this);
            this.renderModuleToolbar(0 /* SINGLE */, this.$toolbar);
            this.editor.UI().initToolbar(this.$toolbar);
        };
        return SingleToolbar;
    })(UI.Toolbar);
    UI.SingleToolbar = SingleToolbar;
})(UI || (UI = {}));
/// <reference path="View/ViewInterface.ts"/>
/// <reference path="View/SingleView.ts"/>
/// <reference path="View/GridView.ts"/>
/// <reference path="Toolbar/Toolbar.ts"/>
/// <reference path="Toolbar/GridToolbar.ts"/>
/// <reference path="Toolbar/SingleToolbar.ts"/>
var UI;
(function (UI) {
    var Page = (function () {
        function Page(editor, imageCollection, parent) {
            if (parent === void 0) { parent = null; }
            this.editor = editor;
            this.imageCollection = imageCollection;
            this.parent = parent;
        }
        Page.prototype.hasParent = function () {
            return (this.parent != null);
        };
        Page.prototype.getParent = function () {
            return this.parent;
        };
        Page.prototype.appendImage = function (image) {
            this.imageCollection.add(image);
        };
        Page.prototype.getView = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleView(this, this.imageCollection.getImages()[0]);
            }
            return new UI.GridView(this, this.imageCollection);
        };
        Page.prototype.getToolbar = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleToolbar(this, this.editor.getEditor());
            }
            return new UI.GridToolbar(this, this.editor.getEditor());
        };
        Page.prototype.render = function () {
            this.getToolbar().render();
            this.getImagePlace().html("");
            var inf = this.getView().getInformation();
            if (inf != '') {
                this.getInformationPlace().parent().show();
                this.getInformationPlace().html(inf);
            }
            else {
                this.getInformationPlace().parent().hide();
            }
            this.getView().render();
        };
        Page.prototype.getImagePlace = function () {
            return this.editor.getImagePlace();
        };
        Page.prototype.getInformationPlace = function () {
            return this.editor.getInformationPlace();
        };
        return Page;
    })();
    UI.Page = Page;
})(UI || (UI = {}));
var UI;
(function (UI) {
    var ModuleInitialization = (function () {
        function ModuleInitialization() {
        }
        ModuleInitialization.init = function ($button, editorModule, editor) {
            if (editorModule.type() == 0 /* ACTION */) {
                this.initAction($button, editorModule, editor);
            }
            else if (editorModule.type() == 1 /* DELEGATE */) {
                this.initDelegate($button, editorModule, editor);
            }
            else {
                alert('GROUP!!!');
            }
            return editorModule;
        };
        ModuleInitialization.initAction = function ($button, editorModule, editor) {
        };
        ModuleInitialization.initDelegate = function ($button, editorModule, editor) {
            var _this = this;
            $button.click(function () {
                $('.rs-toolbar-button').removeClass('active');
                $button.addClass('active');
                _this.renderModule(editorModule, editor);
            });
        };
        ModuleInitialization.renderModule = function (editorModule, editor) {
            if (editor.UI().getActiveModule() != null) {
                editor.UI().getActiveModule().deinit();
            }
            editorModule.init(editor.UI().showPopover(editorModule.html()));
            editor.UI().setActiveModule(editorModule);
            return false;
        };
        return ModuleInitialization;
    })();
    UI.ModuleInitialization = ModuleInitialization;
})(UI || (UI = {}));
/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
var UI;
(function (UI) {
    var Editor = (function () {
        function Editor($el, editor, images) {
            var _this = this;
            this.$el = $el;
            this.editor = editor;
            this.images = images;
            this.page = null;
            this.activeModule = null;
            this.$el.html(nunjucks.render('editor.html.njs', {}));
            var $fileLoader = this.$el.find('#rsFileInput');
            $fileLoader.on('change', function () {
                editor.getLoader().load(this.files);
            });
            this.$el.on('click', '#t-button__upload', function () {
                $fileLoader.trigger('click');
                return false;
            });
            this.$el.on('click', '.rs-image-block, .rs-image-data__inf', function (e) {
                _this.editImage($(e.target).closest('.rs-image').data('id'));
            });
            this.$el.on('click', '#t-button__back', function () {
                _this.back();
                return false;
            });
            this.$el.on('click', '.rs-image-selection-checkbox', function (e) {
                _this.selectImage($(e.target).closest('.rs-image'));
            });
            this.$toolbarPlace = this.$el.find('#rsToolbarPlace');
            this.$popOver = this.$el.find('#rsPopover');
            this.$imagePlace = this.$el.find('#rsImagePlace');
            this.$informationPlace = this.$el.find('#rsInformation');
        }
        Editor.prototype.initModule = function ($button, editorModule) {
            UI.ModuleInitialization.init($button, editorModule, this.editor);
        };
        Editor.prototype.getActiveModule = function () {
            return this.activeModule;
        };
        Editor.prototype.setActiveModule = function (editorModule) {
            this.activeModule = editorModule;
        };
        Editor.prototype.initToolbar = function ($toolbar) {
            var _this = this;
            if (this.activeModule != null) {
                $toolbar.find('#t-button__' + this.activeModule.name()).addClass('active');
            }
            $toolbar.find('#t-button__redo').click(function () {
                _this.redo();
                return false;
            });
            $toolbar.find('#t-button__undo').click(function () {
                _this.undo();
                return false;
            });
        };
        Editor.prototype.getView = function () {
            return this.getPage().getView();
        };
        Editor.prototype.redo = function () {
            var _this = this;
            var p = [];
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().redo());
            });
            Promise.all(p).then(function () {
                _this.render();
            });
        };
        Editor.prototype.undo = function () {
            var _this = this;
            var p = [];
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().undo());
            });
            Promise.all(p).then(function () {
                _this.render();
            });
        };
        Editor.prototype.showPopover = function (content) {
            this.$popOver.html(content);
            this.$popOver.show();
            return this.$popOver;
        };
        Editor.prototype.clearPopover = function () {
            this.$popOver.html("");
            this.$popOver.hide();
        };
        Editor.prototype.back = function () {
            if (this.page.hasParent()) {
                this.page = this.page.getParent();
                this.render();
            }
        };
        Editor.prototype.getImagePlace = function () {
            return this.$imagePlace;
        };
        Editor.prototype.getToolbarPlace = function () {
            return this.$toolbarPlace;
        };
        Editor.prototype.getInformationPlace = function () {
            return this.$informationPlace;
        };
        /**
         * Get selected image in editor
         * @returns Core.RsImage[]
         */
        Editor.prototype.selected = function () {
            return this.getPage().getView().selected();
        };
        Editor.prototype.getEditor = function () {
            return this.editor;
        };
        Editor.prototype.getPage = function () {
            if (this.page == null) {
                this.page = new UI.Page(this, this.images);
            }
            return this.page;
        };
        Editor.prototype.getType = function () {
            return this.getPage().getView().type();
        };
        Editor.prototype.render = function () {
            if (this.activeModule != null) {
                this.activeModule.deinit();
            }
            this.getPage().render();
            if (this.activeModule != null) {
                UI.ModuleInitialization.renderModule(this.activeModule, this.editor);
            }
        };
        /**
         * Go to single image editor
         *
         * @param imageId
         */
        Editor.prototype.editImage = function (imageId) {
            var image = this.images.getImage(imageId);
            this.page = new UI.Page(this, image, this.page);
            this.render();
        };
        Editor.prototype.selectImage = function ($el) {
            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');
            }
            else {
                $el.addClass('rs-image-selected');
            }
        };
        return Editor;
    })();
    UI.Editor = Editor;
})(UI || (UI = {}));
/// <reference path="EditorModule.ts"/>
var Core;
(function (Core) {
    (function (ModuleViewType) {
        ModuleViewType[ModuleViewType["SINGLE"] = 0] = "SINGLE";
        ModuleViewType[ModuleViewType["GRID"] = 1] = "GRID";
        ModuleViewType[ModuleViewType["ANY"] = 2] = "ANY";
    })(Core.ModuleViewType || (Core.ModuleViewType = {}));
    var ModuleViewType = Core.ModuleViewType;
    var ModuleManager = (function () {
        function ModuleManager(editor) {
            this.editor = editor;
            this.modules = {};
            this.registerModule('resize', new Modules.ResizeModule(this.editor), 0 /* SINGLE */);
            this.registerModule('color', new Modules.ColorModule(this.editor), 2 /* ANY */);
            this.registerModule('crop', new Modules.CropModule(this.editor), 0 /* SINGLE */);
        }
        ModuleManager.prototype.registerModule = function (name, editorModule, type) {
            if (!(name in this.modules)) {
                this.modules[name] = {
                    module: editorModule,
                    type: type
                };
            }
        };
        ModuleManager.prototype.getModule = function (name) {
            if (name in this.modules) {
                return this.modules[name].module;
            }
            throw new Error('Invalid module name');
        };
        ModuleManager.prototype.getModules = function (type, parent) {
            if (type === void 0) { type = 2 /* ANY */; }
            if (parent === void 0) { parent = null; }
            return _.map(_.filter(this.modules, function (value) {
                if ((value.type == type) || (type == 2 /* ANY */) || (value.type == 2 /* ANY */)) {
                    if (value.module.parent() == parent) {
                        return true;
                    }
                }
                return false;
            }), function (value) {
                return value.module;
            });
        };
        return ModuleManager;
    })();
    Core.ModuleManager = ModuleManager;
})(Core || (Core = {}));
/// <reference path="../RsImageEditor.ts"/>
/// <reference path="../Image/RsImage.ts"/>
var Core;
(function (Core) {
    var ImageLoader = (function () {
        function ImageLoader(editor) {
            this.editor = editor;
        }
        ImageLoader.prototype.load = function (files) {
            var _this = this;
            var i = 0;
            var p = new Promise(function (resolve, reject) {
                var intervalId = setInterval(function () {
                    if (i < files.length) {
                        var isLast = false;
                        if (i == files.length - 1) {
                            isLast = true;
                        }
                        _this.loadFile(files[i], resolve, isLast);
                        i++;
                    }
                    else {
                        clearInterval(intervalId);
                    }
                }, 100);
            });
            p.then(function () {
                _this.editor.UI().render();
            });
        };
        ImageLoader.prototype.loadFile = function (file, resolve, isLast) {
            var _this = this;
            if (!file.type.match(/image.*/)) {
                return false;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Core.RsImage(file.name, file.type);
                img.create(e.target.result).then(function (image) {
                    _this.editor.appendImage(image);
                    if (isLast) {
                        resolve(1);
                    }
                });
            };
            reader.readAsDataURL(file);
        };
        return ImageLoader;
    })();
    Core.ImageLoader = ImageLoader;
})(Core || (Core = {}));
/// <reference path="../UI/Editor.ts"/>
/// <reference path="Image/ImageManager.ts"/>
/// <reference path="Module/ModuleManager.ts"/>
/// <reference path="Loader/ImageLoader.ts"/>
var Core;
(function (Core) {
    var RsImageEditor = (function () {
        function RsImageEditor($editor) {
            this.imageManager = new Core.ImageManager();
            this.ui = new UI.Editor($editor, this, this.imageManager.newCollection([]));
            this.moduleManager = new Core.ModuleManager(this);
            this.loader = new Core.ImageLoader(this);
            this.ui.render();
        }
        RsImageEditor.prototype.UI = function () {
            return this.ui;
        };
        RsImageEditor.prototype.getModuleManager = function () {
            return this.moduleManager;
        };
        RsImageEditor.prototype.appendImage = function (image) {
            this.ui.getPage().appendImage(image);
        };
        RsImageEditor.prototype.getLoader = function () {
            return this.loader;
        };
        RsImageEditor.prototype.getImageManager = function () {
            return this.imageManager;
        };
        return RsImageEditor;
    })();
    Core.RsImageEditor = RsImageEditor;
})(Core || (Core = {}));
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsWidget = (function () {
            function RsWidget() {
                this.events = {};
            }
            RsWidget.prototype.on = function (eventName, callback, eventNamespace) {
                if (eventNamespace === void 0) { eventNamespace = '_'; }
                if (!_.has(this.events, eventName)) {
                    this.events[eventName] = {};
                }
                if (!_.has(this.events[eventName], eventNamespace)) {
                    this.events[eventName][eventNamespace] = [];
                }
                this.events[eventName][eventNamespace].push(callback);
            };
            RsWidget.prototype.off = function (eventNamespace) {
                var _this = this;
                if (eventNamespace === void 0) { eventNamespace = '_'; }
                _.map(this.events, function (event, eventName) {
                    _this.events[eventName] = _.omit(event, eventNamespace);
                });
            };
            RsWidget.prototype.trigger = function (eventName, data) {
                var _this = this;
                if (data === void 0) { data = null; }
                if (_.has(this.events, eventName)) {
                    _.map(this.events[eventName], function (callbacks, eventNamespace) {
                        callbacks.forEach(function (f) {
                            f({
                                data: data,
                                widget: _this
                            });
                        });
                    });
                }
            };
            return RsWidget;
        })();
        Widgets.RsWidget = RsWidget;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="RsWidget.ts"/>
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsSlider = (function (_super) {
            __extends(RsSlider, _super);
            function RsSlider($el, min, max, step, start) {
                var _this = this;
                if (step === void 0) { step = 1; }
                if (start === void 0) { start = 0; }
                _super.call(this);
                this.$el = $el;
                this.min = min;
                this.max = max;
                this.step = step;
                this.start = start;
                this.$slider = $('<div class="rs-slider-handle"></div>');
                this.$el.html("");
                this.$el.addClass('rs-slider');
                this.$el.append(this.$slider);
                this.$slider.css('left', this.getPixelPos(this.start) + 'px');
                var $body = $(document);
                this.$slider.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$slider.css('left'));
                    $body.on('mousemove.RsSlider', function (moveEvent) {
                        var pos = moveEvent.clientX - x;
                        if (pos < 0) {
                            pos = 0;
                        }
                        var size = _this.$el.width() - _this.$slider.width();
                        if (pos > size) {
                            pos = size;
                        }
                        _this.$slider.css('left', pos + 'px');
                        _this.trigger('move', _this.getVal(pos));
                    });
                    $body.on('mouseup.RsSlider', function () {
                        var newPos = parseInt(_this.$slider.css('left'));
                        _this.trigger('stopmove', _this.getVal(newPos));
                        $body.off('.RsSlider');
                    });
                });
                this.on('move', function (e) {
                    _this.$slider.text(e.data);
                });
                this.trigger('move', this.start);
            }
            RsSlider.prototype.getVal = function (pixelPos) {
                return Math.round((pixelPos * ((this.max - this.min) / this.step)) / (this.$el.width() - this.$slider.width())) * this.step + this.min;
            };
            RsSlider.prototype.getPixelPos = function (val) {
                return (((val - this.min) / this.step) * (this.$el.width() - this.$slider.width())) / ((this.max - this.min) / this.step);
            };
            return RsSlider;
        })(Widgets.RsWidget);
        Widgets.RsSlider = RsSlider;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsSlider.ts"/>
var Modules;
(function (Modules) {
    var ColorModule = (function () {
        function ColorModule(editor) {
            this.editor = editor;
        }
        ColorModule.prototype.html = function () {
            return nunjucks.render('color.dialog.html.njs', {});
        };
        ColorModule.prototype.init = function ($el) {
            var _this = this;
            var brightness = 0;
            var vibrance = 0;
            if (this.editor.UI().getType() == 0 /* SINGLE */) {
                var img = this.editor.UI().selected()[0];
                brightness = img.brightness;
                vibrance = img.vibrance;
            }
            new UI.Widgets.RsSlider($el.find('#brightnessSlider'), -100, 100, 1, brightness).on('stopmove', function (e) {
                _this.doAction(Modules.BrightnessAction, e.data);
            });
            new UI.Widgets.RsSlider($el.find('#vibranceSlider'), -200, 200, 5, vibrance).on('stopmove', function (e) {
                _this.doAction(Modules.VibranceAction, e.data);
            });
        };
        ColorModule.prototype.deinit = function () {
            this.editor.UI().clearPopover();
        };
        ColorModule.prototype.icon = function () {
            return 'fa fa-image';
        };
        ColorModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        ColorModule.prototype.parent = function () {
            return null;
        };
        ColorModule.prototype.name = function () {
            return 'color';
        };
        ColorModule.prototype.doAction = function (action, value) {
            var _this = this;
            var promiseArray = [];
            this.editor.UI().selected().forEach(function (img) {
                var act = new action(img, value);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.UI().render();
            });
        };
        return ColorModule;
    })();
    Modules.ColorModule = ColorModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
var Modules;
(function (Modules) {
    var VibranceAction = (function () {
        function VibranceAction(image, value) {
            this.image = image;
            this.value = value;
        }
        VibranceAction.prototype.execute = function () {
            this.oldValue = this.image.vibrance;
            this.image.vibrance = this.value;
            return this.image.save();
        };
        VibranceAction.prototype.unExecute = function () {
            this.image.vibrance = this.oldValue;
            return this.image.save();
        };
        return VibranceAction;
    })();
    Modules.VibranceAction = VibranceAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
var Modules;
(function (Modules) {
    var CropAction = (function () {
        function CropAction(image, left, top, width, height) {
            this.image = image;
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
        }
        CropAction.prototype.execute = function () {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.originalImage = this.image.getOriginalImage();
            this.image.crop(this.left, this.top, this.width, this.height);
            return this.image.save();
        };
        CropAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            this.image.replaceOriginal(this.originalImage);
            return this.image.save();
        };
        return CropAction;
    })();
    Modules.CropAction = CropAction;
})(Modules || (Modules = {}));
/// <reference path="RsWidget.ts"/>
var UI;
(function (UI) {
    var Widgets;
    (function (Widgets) {
        var RsResizableItem = (function (_super) {
            __extends(RsResizableItem, _super);
            function RsResizableItem($el, $parent, index) {
                _super.call(this);
                this.$el = $el;
                this.$parent = $parent;
                this.index = index;
                this.itemHalfSize = 5;
                this.init();
            }
            RsResizableItem.prototype.getElementCorners = function () {
                var topLeft = { x: this.$el.position().left, y: this.$el.position().top };
                var topRight = { x: topLeft.x + this.$el.width(), y: topLeft.y };
                var bottomRight = { x: topLeft.x + this.$el.width(), y: topLeft.y + this.$el.height() };
                var bottomLeft = { x: topLeft.x, y: topLeft.y + this.$el.height() };
                return {
                    topLeft: topLeft,
                    topRight: topRight,
                    bottomRight: bottomRight,
                    bottomLeft: bottomLeft
                };
            };
            RsResizableItem.prototype.getPosition = function () {
                return this.position;
            };
            RsResizableItem.prototype.getIndex = function () {
                return this.index;
            };
            RsResizableItem.prototype.toPlace = function () {
                var cord;
                var elementCorners = this.getElementCorners();
                if (this.index == 0) {
                    cord = elementCorners.topLeft;
                }
                else if (this.index == 1) {
                    cord = {
                        x: elementCorners.topLeft.x + (elementCorners.topRight.x - elementCorners.topLeft.x) / 2,
                        y: elementCorners.topRight.y
                    };
                }
                else if (this.index == 2) {
                    cord = elementCorners.topRight;
                }
                else if (this.index == 3) {
                    cord = {
                        x: elementCorners.topRight.x,
                        y: elementCorners.topRight.y + (elementCorners.bottomRight.y - elementCorners.topRight.y) / 2
                    };
                }
                else if (this.index == 4) {
                    cord = elementCorners.bottomRight;
                }
                else if (this.index == 5) {
                    cord = {
                        x: elementCorners.topLeft.x + (elementCorners.topRight.x - elementCorners.topLeft.x) / 2,
                        y: elementCorners.bottomRight.y
                    };
                }
                else if (this.index == 6) {
                    cord = elementCorners.bottomLeft;
                }
                else if (this.index == 7) {
                    cord = {
                        x: elementCorners.topLeft.x,
                        y: elementCorners.topRight.y + (elementCorners.bottomRight.y - elementCorners.topRight.y) / 2
                    };
                }
                this.position = cord;
                this.$item.css({
                    'left': (cord.x - this.itemHalfSize) + 'px',
                    'top': (cord.y - this.itemHalfSize) + 'px'
                });
            };
            RsResizableItem.prototype.init = function () {
                var _this = this;
                this.$item = $('<div class="rs-resizable-item item_' + this.index + '"></div>');
                this.$parent.append(this.$item);
                this.toPlace();
                var $body = $(document);
                this.$item.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$item.css('left')) - _this.itemHalfSize;
                    var y = downEvent.clientY - parseInt(_this.$item.css('top')) - _this.itemHalfSize;
                    $body.on('mousemove.RsResize_' + _this.index, function (moveEvent) {
                        var pos = {
                            x: moveEvent.clientX - x,
                            y: moveEvent.clientY - y
                        };
                        _this.moveItem(pos);
                        _this.trigger('move', {
                            index: _this.index,
                            newPosition: _this.position,
                            oldPosition: {
                                x: x,
                                y: y
                            }
                        });
                    });
                    $body.on('mouseup.RsResize_' + _this.index, function () {
                        $body.off('.RsResize_' + _this.index);
                    });
                });
            };
            RsResizableItem.prototype.moveItem = function (pos) {
                var c = this.getElementCorners();
                if ((this.index == 0) || (this.index == 7) || (this.index == 6)) {
                    if (pos.x >= c.topRight.x - 10) {
                        pos.x = c.topRight.x - 10;
                    }
                }
                if ((this.index == 0) || (this.index == 1) || (this.index == 2)) {
                    if (pos.y >= c.bottomRight.y - 10) {
                        pos.y = c.bottomRight.y - 10;
                    }
                }
                if ((this.index == 1) || (this.index == 5)) {
                    this.$item.css({
                        'top': (pos.y - 5) + 'px'
                    });
                }
                else if ((this.index == 7) || (this.index == 3)) {
                    this.$item.css({
                        'left': (pos.x - 5) + 'px'
                    });
                }
                else {
                    this.$item.css({
                        'left': (pos.x - 5) + 'px',
                        'top': (pos.y - 5) + 'px'
                    });
                }
                this.position = {
                    x: parseInt(this.$item.css('left')) + 5,
                    y: parseInt(this.$item.css('top')) + 5
                };
            };
            return RsResizableItem;
        })(Widgets.RsWidget);
        var RsResizable = (function (_super) {
            __extends(RsResizable, _super);
            function RsResizable($el, $parent) {
                var _this = this;
                _super.call(this);
                this.$el = $el;
                this.$parent = $parent;
                this.items = [];
                this.$el.addClass('rs-resizable');
                for (var i = 0; i < 8; i++) {
                    var item = new RsResizableItem(this.$el, this.$parent, i);
                    this.items.push(item);
                    item.on('move', function (ev) {
                        _this.onItemMove(ev.data.index, ev.data.newPosition, ev.data.oldPosition);
                    });
                }
                var $body = $(document);
                this.$el.mousedown(function (downEvent) {
                    var x = downEvent.clientX - parseInt(_this.$el.css('left'));
                    var y = downEvent.clientY - parseInt(_this.$el.css('top'));
                    $body.on('mousemove.RsResize', function (moveEvent) {
                        var pos = {
                            x: moveEvent.clientX - x,
                            y: moveEvent.clientY - y
                        };
                        _this.$el.css({
                            'left': pos.x,
                            'top': pos.y
                        });
                        _this.updateItems();
                    });
                    $body.on('mouseup.RsResize', function () {
                        $body.off('.RsResize');
                    });
                });
            }
            RsResizable.prototype.onItemMove = function (index, newPosition, oldPosition) {
                if (index == 0) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        top: newPosition.y + 'px',
                        width: (this.items[4].getPosition().x - newPosition.x) + 'px',
                        height: (this.items[4].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([4]);
                }
                else if (index == 1) {
                    this.$el.css({
                        top: newPosition.y + 'px',
                        height: (this.items[4].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([4]);
                }
                else if (index == 2) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        top: newPosition.y + 'px',
                        width: (newPosition.x - this.items[6].getPosition().x) + 'px',
                        height: (this.items[6].getPosition().y - newPosition.y) + 'px'
                    });
                    this.updateItems([6]);
                }
                else if (index == 3) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        width: (newPosition.x - this.items[6].getPosition().x) + 'px'
                    });
                    this.updateItems([6]);
                }
                else if (index == 4) {
                    this.$el.css({
                        right: newPosition.x + 'px',
                        bottom: newPosition.y + 'px',
                        width: (newPosition.x - this.items[0].getPosition().x) + 'px',
                        height: (newPosition.y - this.items[0].getPosition().y) + 'px'
                    });
                    this.updateItems([0]);
                }
                else if (index == 5) {
                    this.$el.css({
                        bottom: newPosition.y + 'px',
                        height: (newPosition.y - this.items[0].getPosition().y) + 'px'
                    });
                    this.updateItems([0]);
                }
                else if (index == 6) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        bottom: newPosition.y + 'px',
                        width: (this.items[2].getPosition().x - newPosition.x) + 'px',
                        height: (newPosition.y - this.items[2].getPosition().y) + 'px'
                    });
                    this.updateItems([2]);
                }
                else if (index == 7) {
                    this.$el.css({
                        left: newPosition.x + 'px',
                        width: (this.items[2].getPosition().x - newPosition.x) + 'px'
                    });
                    this.updateItems([2]);
                }
            };
            RsResizable.prototype.getBounds = function () {
                return {
                    width: this.$el.width(),
                    height: this.$el.height(),
                    left: this.items[0].getPosition().x,
                    top: this.items[0].getPosition().y
                };
            };
            RsResizable.prototype.updateItems = function (stopItem) {
                if (stopItem === void 0) { stopItem = []; }
                this.trigger('resize', {
                    width: this.$el.width(),
                    height: this.$el.height(),
                    left: this.items[0].getPosition().x,
                    top: this.items[0].getPosition().y
                });
                this.items.forEach(function (item) {
                    if (!_.contains(stopItem, item.getIndex())) {
                        item.toPlace();
                    }
                });
            };
            return RsResizable;
        })(Widgets.RsWidget);
        Widgets.RsResizable = RsResizable;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
/// <reference path="../../UI/Widgets/RsResizable.ts"/>
var Modules;
(function (Modules) {
    var CropModule = (function () {
        function CropModule(editor) {
            this.editor = editor;
            this.view = null;
        }
        CropModule.prototype.html = function () {
            return nunjucks.render('crop.dialog.html.njs', {});
        };
        CropModule.prototype.deinit = function () {
            if (this.view != null) {
                this.$cropRect.remove();
                this.view.getAreaElement().find('.rs-resizable-item').remove();
            }
        };
        CropModule.prototype.init = function ($el) {
            var _this = this;
            this.view = this.editor.UI().getView();
            this.$cropRect = $('<div class="crop-rect"></div>');
            this.view.getAreaElement().append(this.$cropRect);
            this.cropResizableWidget = new UI.Widgets.RsResizable(this.$cropRect, this.view.getAreaElement());
            $('#crop_ok').click(function () {
                var b = _this.cropResizableWidget.getBounds();
                _this.doAction(b.left, b.top, b.width, b.height);
            });
        };
        CropModule.prototype.icon = function () {
            return 'fa fa-crop';
        };
        CropModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        CropModule.prototype.parent = function () {
            return null;
        };
        CropModule.prototype.name = function () {
            return 'crop';
        };
        CropModule.prototype.doAction = function (left, top, width, height) {
            var _this = this;
            var promiseArray = [];
            this.editor.UI().selected().forEach(function (img) {
                var act = new Modules.CropAction(img, left, top, width, height);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.UI().render();
            });
        };
        return CropModule;
    })();
    Modules.CropModule = CropModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
var Modules;
(function (Modules) {
    var ResizeAction = (function () {
        function ResizeAction(image, width, height) {
            this.image = image;
            this.width = width;
            this.height = height;
        }
        ResizeAction.prototype.execute = function () {
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            this.image.width = this.width;
            this.image.height = this.height;
            return this.image.save();
        };
        ResizeAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            return this.image.save();
        };
        return ResizeAction;
    })();
    Modules.ResizeAction = ResizeAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
var Modules;
(function (Modules) {
    var ResizeModule = (function () {
        function ResizeModule(editor) {
            this.editor = editor;
            this.isLocked = true;
            this.image = null;
        }
        ResizeModule.prototype.html = function () {
            return nunjucks.render('resize-single.dialog.html.njs', {
                isLocked: this.isLocked
            });
        };
        ResizeModule.prototype.deinit = function () {
            this.editor.UI().clearPopover();
        };
        ResizeModule.prototype.init = function ($el) {
            var _this = this;
            this.image = this.editor.UI().selected()[0];
            this.$widthInput = $el.find('.m__single-resize__val.width input');
            this.$heightInput = $el.find('.m__single-resize__val.height input');
            this.$lock = $el.find('.m__single-resize__lock');
            this.$widthInput.val(this.image.width.toString());
            this.$heightInput.val(this.image.height.toString());
            var render = _.debounce(function () {
                _this.doAction(_this.$widthInput.val(), _this.$heightInput.val());
            }, 500);
            this.$lock.click(function () {
                if (_this.isLocked) {
                    _this.isLocked = false;
                    _this.$lock.find('i').attr('class', 'fa fa-unlock');
                }
                else {
                    _this.isLocked = true;
                    _this.update(_this.image);
                    render();
                    _this.$lock.find('i').attr('class', 'fa fa-lock');
                }
            });
            this.$widthInput.on('input', function () {
                var val = parseInt(_this.$widthInput.val());
                if (!isNaN(val) && (val >= 50)) {
                    if (_this.isLocked) {
                        _this.$heightInput.val(Math.round(_this.image.getOriginalImage().height * val / _this.image.getOriginalImage().width) + '');
                    }
                    var h = parseInt(_this.$heightInput.val());
                    if (!isNaN(h) && (h >= 30)) {
                        render();
                    }
                }
            });
            this.$heightInput.on('input', function () {
                var val = parseInt(_this.$heightInput.val());
                if (!isNaN(val) && (val >= 30)) {
                    if (_this.isLocked) {
                        _this.$widthInput.val(Math.round(_this.image.getOriginalImage().width * val / _this.image.getOriginalImage().height) + '');
                    }
                    var w = parseInt(_this.$widthInput.val());
                    if (!isNaN(w) && (w >= 50)) {
                        render();
                    }
                }
            });
        };
        ResizeModule.prototype.update = function (image) {
            var w = parseInt(this.$widthInput.val());
            var h = parseInt(this.$heightInput.val());
            if (!isNaN(w) && !isNaN(h) && (w >= 50) && (h >= 30)) {
                if (w > h) {
                    this.$heightInput.val(Math.round(image.getOriginalImage().height * w / image.getOriginalImage().width) + '');
                }
                else {
                    this.$widthInput.val(Math.round(image.getOriginalImage().width * h / image.getOriginalImage().height) + '');
                }
            }
        };
        ResizeModule.prototype.icon = function () {
            return 'fa fa-expand';
        };
        ResizeModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        ResizeModule.prototype.parent = function () {
            return null;
        };
        ResizeModule.prototype.name = function () {
            return 'resize';
        };
        ResizeModule.prototype.doAction = function (width, height) {
            var _this = this;
            var act = new Modules.ResizeAction(this.image, width, height);
            this.image.getActionDispatcher().process(act).then(function () {
                _this.editor.UI().render();
            });
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
