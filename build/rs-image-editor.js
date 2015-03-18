/// <reference path="../Image/RsImage.ts"/>
var Core;
(function (Core) {
    (function (ActionType) {
        ActionType[ActionType["FIXED"] = 0] = "FIXED";
        ActionType[ActionType["NOT_FIXED"] = 1] = "NOT_FIXED";
    })(Core.ActionType || (Core.ActionType = {}));
    var ActionType = Core.ActionType;
})(Core || (Core = {}));
/// <reference path="../Image/RsImage.ts"/>
/// <reference path="EditorAction.ts"/>
var Core;
(function (Core) {
    var ActionDispatcher = (function () {
        function ActionDispatcher(image) {
            this.current = -1;
            this.imagesStates = {};
            this.image = image;
            this.actions = [];
            this.actionsResult = [];
        }
        ActionDispatcher.prototype.process = function (action) {
            var _this = this;
            this.actions = this.actions.splice(this.current);
            this.actions.push(action);
            this.current++;
            if (action.getType() == 1 /* NOT_FIXED */) {
                if (_.has(this.imagesStates, action.getName())) {
                    this.image.setState(this.imagesStates[action.getName()]);
                }
                else {
                    this.imagesStates[action.getName()] = this.image.getState();
                }
            }
            this.actionsResult.push(this.doAction(action.execute, action));
            return _.last(this.actionsResult).then(function (image) {
                _this.updateFirstState(action.getName(), image.getState());
                return image;
            });
        };
        ActionDispatcher.prototype.updateFirstState = function (actionName, newState) {
            var _this = this;
            _.map(this.imagesStates, function (val, act) {
                if (actionName != act) {
                    _this.imagesStates[act] = newState;
                }
            });
        };
        ActionDispatcher.prototype.undo = function () {
            var _this = this;
            if (this.current >= 0) {
                var act = this.actions[this.current];
                this.current--;
                this.actionsResult.push(this.doAction(act.unExecute, act));
                return _.last(this.actionsResult).then(function (image) {
                    _this.updateFirstState(act.getName(), image.getState());
                    return image;
                });
            }
            return Promise.resolve(this.image);
        };
        ActionDispatcher.prototype.redo = function () {
            var _this = this;
            if (this.current < this.actions.length - 1) {
                this.current++;
                var act = this.actions[this.current];
                this.actionsResult.push(this.doAction(act.execute, act));
                return _.last(this.actionsResult).then(function (image) {
                    _this.updateFirstState(act.getName(), image.getState());
                    return image;
                });
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
            this.imageBase64 = '';
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
                    _this.imageData = context.getImageData(0, 0, img.width, img.height);
                    resolve(_this);
                });
            });
        };
        RsImage.prototype.update = function (imageData, imageBase64) {
            this.imageBase64 = imageBase64;
            this.imageData = imageData;
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
        RsImage.prototype.getImageData = function () {
            return this.imageData;
        };
        RsImage.prototype.getImageBase64 = function () {
            return this.imageBase64;
        };
        RsImage.prototype.getWidth = function () {
            return this.imageData.width;
        };
        RsImage.prototype.getHeight = function () {
            return this.imageData.height;
        };
        RsImage.prototype.getName = function () {
            return this.imageName;
        };
        RsImage.prototype.getLabel = function () {
            return '';
        };
        RsImage.prototype.getState = function () {
            return {
                imageData: this.getImageData(),
                base64: this.getImageBase64()
            };
        };
        RsImage.prototype.setState = function (state) {
            this.update(state.imageData, state.base64);
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
/// <reference path="../Image/RsImage.ts"/>
var Core;
(function (Core) {
    var AbstractAction = (function () {
        function AbstractAction(image) {
            this.image = image;
            this.saveOldImage();
        }
        AbstractAction.prototype.drawTempImage = function () {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = this.image.getWidth();
            canvas.height = this.image.getHeight();
            context.putImageData(this.image.getImageData(), 0, 0);
            return {
                canvas: canvas,
                context: context
            };
        };
        AbstractAction.prototype.getName = function () {
            throw new Error('Not implement');
        };
        AbstractAction.prototype.getType = function () {
            throw new Error('Not implement');
        };
        AbstractAction.prototype.saveOldImage = function () {
            this.oldImage = {
                data: this.image.getImageData(),
                base64: this.image.getImageBase64()
            };
        };
        AbstractAction.prototype.execute = function () {
            throw new Error('Not implement');
        };
        AbstractAction.prototype.unExecute = function () {
            this.image.update(this.oldImage.data, this.oldImage.base64);
            return Promise.resolve(this.image);
        };
        return AbstractAction;
    })();
    Core.AbstractAction = AbstractAction;
})(Core || (Core = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Core;
(function (Core) {
    var CamanJSAction = (function (_super) {
        __extends(CamanJSAction, _super);
        function CamanJSAction(image) {
            _super.call(this, image);
            this.image = image;
        }
        CamanJSAction.prototype.getName = function () {
            return 'brightness';
        };
        CamanJSAction.prototype.getType = function () {
            return 1 /* NOT_FIXED */;
        };
        CamanJSAction.prototype.camanAction = function (camanObject) {
            throw new Error('Not implement');
        };
        CamanJSAction.prototype.execute = function () {
            var _this = this;
            this.saveOldImage();
            var canvasObject = this.drawTempImage();
            return new Promise(function (resolve, reject) {
                var self = _this;
                Caman(canvasObject.canvas, function () {
                    self.camanAction(this);
                    this.render(function () {
                        self.image.update(canvasObject.context.getImageData(0, 0, canvasObject.canvas.width, canvasObject.canvas.height), canvasObject.canvas.toDataURL());
                        resolve(self.image);
                    });
                });
            });
        };
        return CamanJSAction;
    })(Core.AbstractAction);
    Core.CamanJSAction = CamanJSAction;
})(Core || (Core = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>
/// <reference path="../../Core/Action/CamanJSAction.ts"/>
var Modules;
(function (Modules) {
    var BrightnessAction = (function (_super) {
        __extends(BrightnessAction, _super);
        function BrightnessAction(image, brightness) {
            _super.call(this, image);
            this.brightness = brightness;
            this.image = image;
        }
        BrightnessAction.prototype.camanAction = function (camanObject) {
            camanObject.brightness(this.brightness);
        };
        return BrightnessAction;
    })(Core.CamanJSAction);
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
            this.imageCollection.getImages().forEach(function (img) {
                _this.renderImage(img);
            });
        };
        GridView.prototype.selected = function () {
            var ids = [];
            this.page.getImagePlace().find('.rs-image-selected').each(function (i, $el) {
                ids.push($($el).data('id'));
            });
            return this.imageCollection.findImage(ids);
        };
        GridView.prototype.renderImage = function (image) {
            this.page.getImagePlace().append($(nunjucks.render('grid.image.html.njs', {
                image: {
                    src: image.getImageBase64(),
                    name: image.getName(),
                    id: image.getId(),
                    label: image.getLabel()
                }
            })));
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
            this.getView().render();
        };
        Page.prototype.getImagePlace = function () {
            return this.editor.getImagePlace();
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
        };
        ModuleInitialization.initAction = function ($button, editorModule, editor) {
        };
        ModuleInitialization.initDelegate = function ($button, editorModule, editor) {
            $button.click(function () {
                editorModule.init(editor.UI().showPopover(editorModule.html()));
                return false;
            });
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
        }
        Editor.prototype.initModule = function ($button, editorModule) {
            UI.ModuleInitialization.init($button, editorModule, this.editor);
        };
        Editor.prototype.initToolbar = function ($toolbar) {
            var _this = this;
            $toolbar.find('#t-button__redo').click(function () {
                _this.redo();
                return false;
            });
            $toolbar.find('#t-button__undo').click(function () {
                _this.undo();
                return false;
            });
        };
        Editor.prototype.redo = function () {
            var _this = this;
            var p = [];
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().redo());
            });
            Promise.all(p).then(function () {
                _this.getPage().getView().render();
            });
        };
        Editor.prototype.undo = function () {
            var _this = this;
            var p = [];
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().undo());
            });
            Promise.all(p).then(function () {
                _this.getPage().getView().render();
            });
        };
        Editor.prototype.showPopover = function (content) {
            this.$popOver.html(content);
            this.$popOver.show();
            return this.$popOver;
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
            this.getPage().render();
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
            this.registerModule('resize', new Modules.ResizeModule(this.editor), 2 /* ANY */);
            this.registerModule('color', new Modules.ColorModule(this.editor), 2 /* ANY */);
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
            return _.map(this.modules, function (value) {
                if ((value.type == type) || (type == 2 /* ANY */) || (value.type == 2 /* ANY */)) {
                    if (value.module.parent() == parent) {
                        return value.module;
                    }
                }
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
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
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
            $el.find('.m_color-ok').click(function () {
                _this.doAction($el.find('.m_color-brightness').val());
                return false;
            });
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
            return 'resize';
        };
        ColorModule.prototype.doAction = function (brightness) {
            var _this = this;
            var promiseArray = [];
            this.editor.UI().selected().forEach(function (img) {
                //img.getActionDispatcher().createAction(BrightnessAction);
                var act = new Modules.BrightnessAction(img, brightness);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.UI().getPage().getView().render();
            });
        };
        return ColorModule;
    })();
    Modules.ColorModule = ColorModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Image/ImageResizer.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
/// <reference path="../../Core/Action/AbstractAction.ts"/>
var Modules;
(function (Modules) {
    var ResizeAction = (function (_super) {
        __extends(ResizeAction, _super);
        function ResizeAction(image, width, height) {
            _super.call(this, image);
            this.width = width;
            this.height = height;
            this.image = image;
        }
        ResizeAction.prototype.getName = function () {
            return 'resize';
        };
        ResizeAction.prototype.getType = function () {
            return 0 /* FIXED */;
        };
        ResizeAction.prototype.execute = function () {
            var _this = this;
            this.saveOldImage();
            var canvasObject = this.drawTempImage();
            return (new Core.ImageResizer(canvasObject.context.getImageData(0, 0, canvasObject.canvas.width, canvasObject.canvas.height), this.width, this.height)).resize().then(function (resizeImage) {
                canvasObject.canvas.width = _this.width;
                canvasObject.canvas.height = _this.height;
                canvasObject.context.putImageData(resizeImage, 0, 0);
                _this.image.update(resizeImage, canvasObject.canvas.toDataURL());
                return _this.image;
            });
        };
        return ResizeAction;
    })(Core.AbstractAction);
    Modules.ResizeAction = ResizeAction;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
var Modules;
(function (Modules) {
    var ResizeModule = (function () {
        function ResizeModule(editor) {
            this.editor = editor;
        }
        ResizeModule.prototype.html = function () {
            return nunjucks.render('resize.dialog.html.njs', {});
        };
        ResizeModule.prototype.init = function ($el) {
            var _this = this;
            $el.find('.m_resize-ok').click(function () {
                _this.doAction($el.find('.m_resize-width').val(), $el.find('.m_resize-height').val());
                return false;
            });
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
            var promiseArray = [];
            this.editor.UI().selected().forEach(function (img) {
                var act = new Modules.ResizeAction(img, width, height);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.UI().getPage().getView().render();
            });
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
