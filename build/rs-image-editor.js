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
            this.image = null;
            this.caman = null;
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
                _this.createImagePromise();
                _this.getImage().then(function (img) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    _this.originalImage = context.getImageData(0, 0, img.width, img.height);
                    _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                    canvas.width = 1;
                    canvas.height = 1;
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
        RsImage.prototype.getCaman = function (imageData, update) {
            if (update === void 0) { update = false; }
            if ((!update) && (this.caman != null)) {
                return Promise.resolve(this.caman);
            }
            return new Promise(function (resolve, reject) {
                var camanCanvas = document.createElement('canvas');
                var camanContext = camanCanvas.getContext('2d');
                camanCanvas.width = imageData.width;
                camanCanvas.height = imageData.height;
                camanContext.putImageData(imageData, 0, 0);
                Caman(camanCanvas, function () {
                    resolve({
                        caman: this,
                        context: camanContext
                    });
                });
            });
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
            var updateCaman = false;
            if ((this.width != this.processedImage.width) && (this.height != this.processedImage.height)) {
                updateCaman = true;
            }
            if ((this.width != this.originalImage.width) || (this.height != this.originalImage.height)) {
                resizePromise = (new Core.ImageResizer(this.originalImage, this.width, this.height)).resize();
            }
            else {
                resizePromise = Promise.resolve(context.getImageData(0, 0, this.width, this.height));
            }
            canvas.width = 1;
            canvas.height = 1;
            canvas = null;
            /* CAMAN */
            return resizePromise.then(function (imageData) {
                return _this.getCaman(imageData, updateCaman);
            }).then(function (camanContext) {
                _this.caman = camanContext;
                _this.caman.caman.revert();
                _this.caman.caman.brightness(_this.brightness);
                _this.caman.caman.vibrance(_this.vibrance);
                return new Promise(function (resolve, reject) {
                    _this.caman.caman.render(function () {
                        resolve(_this.caman.context.getImageData(0, 0, _this.width, _this.height));
                    });
                });
            }).then(function (imageData) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                _this.processedImage = null;
                _this.processedImage = imageData;
                canvas.width = _this.processedImage.width;
                canvas.height = _this.processedImage.height;
                context.putImageData(_this.processedImage, 0, 0);
                _this.imageBase64 = canvas.toDataURL(_this.imageType, 0.8);
                canvas.width = 1;
                canvas.height = 1;
                canvas = null;
                _this.getImage().then(function () {
                    _this.createImagePromise();
                });
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
        RsImage.prototype.createImagePromise = function () {
            var _this = this;
            this.imagePromise = new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    if (_this.image != null) {
                        _this.image.src = "about:blank";
                    }
                    _this.image = img;
                    resolve(img);
                };
                img.src = _this.imageBase64;
            });
        };
        RsImage.prototype.getImage = function () {
            return this.imagePromise;
        };
        return RsImage;
    })();
    Core.RsImage = RsImage;
})(Core || (Core = {}));
/// <reference path="../Action/ActionDispatcher.ts"/>
var Core;
(function (Core) {
    var ImageResizer = (function () {
        function ImageResizer(original, newWidth, newHeight) {
            this.original = original;
            this.newWidth = newWidth;
            this.newHeight = newHeight;
            this.size = this.original.data.length;
        }
        ImageResizer.prototype.resize = function () {
            return this.picaResize();
        };
        ImageResizer.prototype.picaResize = function (quality) {
            var _this = this;
            if (quality === void 0) { quality = 3; }
            return new Promise(function (resolve, reject) {
                pica.resizeBuffer({
                    src: _this.original.data,
                    width: _this.original.width,
                    height: _this.original.height,
                    toWidth: _this.newWidth,
                    toHeight: _this.newHeight,
                    alpha: true,
                    quality: quality
                }, function (err, data) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    var newImageData = context.createImageData(_this.newWidth, _this.newHeight);
                    for (var i = 0; i < data.length; i++) {
                        newImageData.data[i] = data[i];
                    }
                    canvas.width = 1;
                    canvas.height = 1;
                    resolve(newImageData);
                });
            });
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
    var ZoomType;
    (function (ZoomType) {
        ZoomType[ZoomType["WIDTH"] = 0] = "WIDTH";
        ZoomType[ZoomType["HEIGHT"] = 1] = "HEIGHT";
        ZoomType[ZoomType["SOURCE"] = 2] = "SOURCE";
    })(ZoomType || (ZoomType = {}));
    var SingleView = (function () {
        function SingleView(page, image) {
            this.page = page;
            this.image = image;
            this.canvas = null;
            this.scale = 1;
            this.scale = 1;
        }
        SingleView.prototype.type = function () {
            return 0 /* SINGLE */;
        };
        SingleView.prototype.update = function () {
            this.renderImage();
            this.page.renderInformation();
            $("#zoomValue").text(Math.floor(this.scale * 100) + '%');
        };
        SingleView.prototype.setImages = function (images) {
            if (images.count() != 1) {
                throw new Error('Invalid image collection');
            }
            this.image = images.getImages()[0];
            this.scale = 1;
        };
        SingleView.prototype.showLoading = function () {
        };
        SingleView.prototype.hideLoading = function () {
        };
        SingleView.prototype.render = function () {
            var _this = this;
            this.page.getImagePlace().html(nunjucks.render('single.image.html.njs', {}));
            this.getCanvas();
            this.renderImage();
            this.setScale(this.scale);
            var $b = $('body');
            $b.off('.view');
            $b.on('click.view', '#fitToWidth', function () {
                _this.setZoom(0 /* WIDTH */);
                return false;
            });
            $b.on('click.view', '#sourceSize', function () {
                _this.setZoom(2 /* SOURCE */);
                return false;
            });
        };
        SingleView.prototype.setZoom = function (zoom) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');
            var value = 1;
            if (zoom == 0 /* WIDTH */) {
                value = ($container.width() / $canvas.width());
                $container.css('overflow', 'hidden');
            }
            else if (zoom == 2 /* SOURCE */) {
                $container.css('overflow', 'scroll');
            }
            this.setScale(value);
        };
        SingleView.prototype.setScale = function (scale) {
            var $container = this.page.getImagePlace().find('.rs-single-image');
            var $canvas = $container.find('canvas');
            $container.scrollLeft(0);
            $container.scrollTop(0);
            $canvas.css('transform-origin', '0 0');
            $canvas.css('transform', 'scale(' + scale + ')');
            this.scale = scale;
            $("#zoomValue").text(Math.floor(scale * 100) + '%');
        };
        SingleView.prototype.getScale = function () {
            return this.scale;
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
            this.canvas.width = this.image.getWidth();
            this.canvas.height = this.image.getHeight();
            this.context.putImageData(this.image.getImageData(), 0, 0);
        };
        SingleView.prototype.getCanvas = function () {
            var $canvas = this.page.getImagePlace().find('#' + this.image.getId());
            if ($canvas.length == 0) {
                this.page.getImagePlace().find('#rsSingleImage').html('<canvas id="' + this.image.getId() + '"></canvas>');
            }
            this.canvas = this.page.getImagePlace().find('#' + this.image.getId())[0];
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
        GridView.prototype.setImages = function (images) {
            this.imageCollection = images;
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
        GridView.prototype.update = function () {
            var _this = this;
            var images = this.selected();
            images.forEach(function (el) {
                _this.updateImage(el);
            });
        };
        GridView.prototype.showLoading = function () {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').addClass('loading');
        };
        GridView.prototype.hideLoading = function () {
            this.page.getImagePlace().find('.rs-image-selected').find('.rs-image-block').removeClass('loading');
        };
        GridView.prototype.updateImage = function (image) {
            var $el = this.page.getImagePlace().find('#img__' + image.getId());
            image.getImage().then(function (img) {
                var $imageBlock = $el.find('.rs-image-block');
                $el.find('img').remove();
                $imageBlock[0].appendChild(img);
                $imageBlock.removeClass('loading');
            });
        };
        GridView.prototype.renderImage = function (image) {
            var _this = this;
            image.getImage().then(function (img) {
                var $block = $(nunjucks.render('grid.image.html.njs', {
                    image: {
                        src: img,
                        name: image.getName(),
                        id: image.getId(),
                        label: image.getLabel()
                    }
                }));
                $block.find('.rs-image-block')[0].appendChild(img);
                _this.page.getImagePlace().append($block);
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
            if ((this.page.getParent() !== null) && (this.page.getParent().images().count() > 1)) {
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
            this.view = null;
        }
        Page.prototype.hasParent = function () {
            return (this.parent != null);
        };
        Page.prototype.getParent = function () {
            return this.parent;
        };
        Page.prototype.setImages = function (imageCollection) {
            this.imageCollection = imageCollection;
            this.getView().setImages(this.imageCollection);
        };
        Page.prototype.appendImage = function (image) {
            this.imageCollection.add(image);
        };
        Page.prototype.images = function () {
            return this.imageCollection;
        };
        Page.prototype.getView = function () {
            if (this.view != null) {
                return this.view;
            }
            if (this.imageCollection.getImages().length == 1) {
                this.view = new UI.SingleView(this, this.imageCollection.getImages()[0]);
            }
            else {
                this.view = new UI.GridView(this, this.imageCollection);
            }
            return this.view;
        };
        Page.prototype.getToolbar = function () {
            if (this.imageCollection.getImages().length == 1) {
                return new UI.SingleToolbar(this, this.editor.getEditor());
            }
            return new UI.GridToolbar(this, this.editor.getEditor());
        };
        Page.prototype.renderInformation = function () {
            var inf = this.getView().getInformation();
            if (inf != '') {
                this.getInformationPlace().parent().show();
                this.getInformationPlace().html(inf);
            }
            else {
                this.getInformationPlace().parent().hide();
            }
        };
        Page.prototype.render = function () {
            this.getToolbar().render();
            this.getImagePlace().html("");
            this.renderInformation();
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
        var RsProgressBar = (function (_super) {
            __extends(RsProgressBar, _super);
            function RsProgressBar($el) {
                _super.call(this);
                this.$el = $el;
                this.$label = $('<div class="rs-progress-label"></div>');
                this.$line = $('<div class="rs-progress-line"></div>');
                this.$el.html("");
                this.$el.append(this.$label);
                this.$el.append(this.$line);
            }
            RsProgressBar.prototype.getOpCount = function () {
                return this.opCount;
            };
            RsProgressBar.prototype.start = function (label, opCount) {
                this.opCount = opCount;
                this.setProgress(0, label);
                this.trigger('start');
                this.$el.show();
            };
            RsProgressBar.prototype.setProgress = function (op, label) {
                this.$label.text(label);
                this.$line.css('width', ((op / this.opCount) * 100) + '%');
                if (op >= this.opCount) {
                    this.trigger('stop');
                }
                else {
                    this.trigger('progress', op);
                }
            };
            RsProgressBar.prototype.stop = function (label) {
                var _this = this;
                this.$label.text(label);
                setTimeout(function () {
                    _this.$el.hide();
                }, 200);
            };
            return RsProgressBar;
        })(Widgets.RsWidget);
        Widgets.RsProgressBar = RsProgressBar;
    })(Widgets = UI.Widgets || (UI.Widgets = {}));
})(UI || (UI = {}));
/// <reference path="../Core/RsImageEditor.ts"/>
/// <reference path="../Core/Image/ImageCollection.ts"/>
/// <reference path="../Core/Image/RsImage.ts"/>
/// <reference path="Page.ts"/>
/// <reference path="Module/ModuleInitialization.ts"/>
/// <reference path="Widgets/RsProgressBar.ts"/>
var UI;
(function (UI) {
    var Editor = (function () {
        function Editor($el, editor, images) {
            var _this = this;
            this.$el = $el;
            this.editor = editor;
            this.images = images;
            this.page = null;
            this.gridPage = null;
            this.singlePage = null;
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
            this.progressBar = new UI.Widgets.RsProgressBar(this.$el.find('#rsProgressBar'));
            this.progressBar.on('stop', function (e) {
                _this.progressBar.stop('Loading complete!');
            });
            this.gridPage = new UI.Page(this, this.images);
            this.singlePage = new UI.Page(this, this.images, this.gridPage);
        }
        Editor.prototype.showLoader = function (opCount) {
            this.progressBar.start('Loading image...', opCount);
        };
        Editor.prototype.progressLoader = function (op) {
            this.progressBar.setProgress(op, 'Image ' + op + ' from ' + this.progressBar.getOpCount());
        };
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
            this.getView().showLoading();
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().redo());
            });
            Promise.all(p).then(function () {
                _this.getView().update();
                if (_this.activeModule) {
                    _this.activeModule.selectImage(null);
                }
            });
        };
        Editor.prototype.undo = function () {
            var _this = this;
            var p = [];
            this.getView().showLoading();
            this.selected().forEach(function (img) {
                p.push(img.getActionDispatcher().undo());
            });
            Promise.all(p).then(function () {
                _this.getView().update();
                if (_this.activeModule) {
                    _this.activeModule.selectImage(null);
                }
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
                if (this.images.count() == 1) {
                    this.page = this.singlePage;
                }
                else {
                    this.page = this.gridPage;
                }
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
                if ((this.activeModule.viewType() == this.getType()) || (this.activeModule.viewType() == 2 /* ANY */)) {
                    UI.ModuleInitialization.renderModule(this.activeModule, this.editor);
                }
            }
        };
        Editor.prototype.appendImage = function (image) {
            this.gridPage.appendImage(image);
            if (this.images.count() == 1) {
                this.singlePage.setImages(this.images.getImage(this.images.getImages()[0].getId()));
                this.page = this.singlePage;
            }
            else {
                this.page = this.gridPage;
            }
        };
        /**
         * Go to single image editor
         *
         * @param imageId
         */
        Editor.prototype.editImage = function (imageId) {
            var image = this.images.getImage(imageId);
            this.singlePage.setImages(image);
            this.page = this.singlePage;
            this.render();
        };
        Editor.prototype.selectImage = function ($el) {
            var image = this.images.getImage($el.data('id')).getImages()[0];
            if ($el.hasClass('rs-image-selected')) {
                $el.removeClass('rs-image-selected');
                if (this.activeModule) {
                    this.activeModule.unSelectImage(image);
                }
            }
            else {
                $el.addClass('rs-image-selected');
                if (this.activeModule) {
                    this.activeModule.selectImage(image);
                }
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
            this.registerModule('crop-resize', new Modules.CropResizeModule(this.editor), 1 /* GRID */);
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
            this.total = 0;
            this.total = 0;
        }
        ImageLoader.prototype.load = function (files) {
            var _this = this;
            var i = 0;
            this.total = 0;
            this.editor.UI().showLoader(files.length);
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
                    _this.total++;
                    _this.editor.UI().progressLoader(_this.total);
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
            this.ui.appendImage(image);
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
                    $body.off('.RsSlider');
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
            RsSlider.prototype.set = function (value, label) {
                if (label === void 0) { label = ''; }
                this.$slider.css('left', this.getPixelPos(value) + 'px');
                if (label == '') {
                    this.$slider.text(value.toString());
                }
                else {
                    this.$slider.text(label);
                }
            };
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
        ColorModule.prototype.viewType = function () {
            return 2 /* ANY */;
        };
        ColorModule.prototype.unSelectImage = function (image) {
            this.updateSelectState();
        };
        ColorModule.prototype.selectImage = function (image) {
            this.updateSelectState();
        };
        ColorModule.prototype.updateSelectState = function () {
            var images = this.editor.UI().selected();
            if (images.length == 1) {
                var image = images[0];
                this.brightnessSlider.set(image.brightness);
                this.vibranceSlider.set(image.vibrance);
            }
            else if (images.length > 0) {
                this.setSliderValue('brightness', this.brightnessSlider, images);
                this.setSliderValue('vibrance', this.vibranceSlider, images);
            }
            else {
                this.brightnessSlider.set(0, '-');
                this.vibranceSlider.set(0, '-');
            }
        };
        ColorModule.prototype.setSliderValue = function (prop, slider, images) {
            var v = images[0][prop];
            for (var i = 0; i < images.length; i++) {
                if (v != images[i][prop]) {
                    slider.set(0, '-');
                    return;
                }
            }
            slider.set(v);
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
            this.brightnessSlider = new UI.Widgets.RsSlider($el.find('#brightnessSlider'), -100, 100, 1, brightness);
            this.brightnessSlider.on('stopmove', function (e) {
                _this.doAction(Modules.BrightnessAction, e.data);
            });
            this.vibranceSlider = new UI.Widgets.RsSlider($el.find('#vibranceSlider'), -200, 200, 5, vibrance);
            this.vibranceSlider.on('stopmove', function (e) {
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
            this.editor.UI().getView().showLoading();
            var promiseArray = [];
            this.editor.UI().selected().forEach(function (img) {
                var act = new action(img, value);
                promiseArray.push(img.getActionDispatcher().process(act));
            });
            Promise.all(promiseArray).then(function () {
                _this.editor.UI().getView().update();
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
        CropModule.prototype.selectImage = function (image) {
        };
        CropModule.prototype.unSelectImage = function (image) {
        };
        CropModule.prototype.deinit = function () {
            this.editor.UI().clearPopover();
            if (this.view != null) {
                this.$cropRect.remove();
                this.view.getAreaElement().find('.rs-resizable-item').remove();
            }
        };
        CropModule.prototype.viewType = function () {
            return 0 /* SINGLE */;
        };
        CropModule.prototype.init = function ($el) {
            var _this = this;
            this.view = this.editor.UI().getView();
            this.$cropRect = $('<div class="crop-rect"></div>');
            this.view.getAreaElement().append(this.$cropRect);
            this.cropResizableWidget = new UI.Widgets.RsResizable(this.$cropRect, this.view.getAreaElement());
            $('#crop_ok').click(function () {
                var b = _this.cropResizableWidget.getBounds();
                var w = Math.round(b.width / _this.view.getScale());
                _this.doAction(b.left / _this.view.getScale(), b.top / _this.view.getScale(), w, b.height / _this.view.getScale());
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
/// <reference path="../../Core/Module/HtmlModule.ts"/>
/// <reference path="../../Core/RsImageEditor.ts"/>
var Modules;
(function (Modules) {
    var CropResizeModule = (function () {
        function CropResizeModule(editor) {
            this.editor = editor;
            this.images = [];
            this.fit = null;
        }
        CropResizeModule.prototype.init = function ($el) {
            var _this = this;
            this.images = this.editor.UI().selected();
            this.view = this.editor.UI().getView();
            if (this.images.length > 0) {
                this.fit = new Modules.Fit($el, this.images, this.editor.UI());
                this.fit.on('apply', function (e) {
                    _this.doAction(_this.createFitActions(_this.fit.getRect(), e.data));
                });
            }
        };
        CropResizeModule.prototype.createFitActions = function (rect, method) {
            this.editor.UI().getView().showLoading();
            var result = [];
            this.editor.UI().selected().forEach(function (img) {
                var act = new Modules.FitAction(img, rect, method);
                result.push(img.getActionDispatcher().process(act));
            });
            return result;
        };
        CropResizeModule.prototype.doAction = function (actions) {
            var _this = this;
            Promise.all(actions).then(function () {
                _this.editor.UI().getView().update();
            });
        };
        CropResizeModule.prototype.html = function () {
            return nunjucks.render('crop-resize.dialog.html.njs', {});
        };
        CropResizeModule.prototype.selectImage = function (image) {
        };
        CropResizeModule.prototype.unSelectImage = function (image) {
        };
        CropResizeModule.prototype.viewType = function () {
            return 1 /* GRID */;
        };
        CropResizeModule.prototype.icon = function () {
            return 'fa fa-crop';
        };
        CropResizeModule.prototype.type = function () {
            return 1 /* DELEGATE */;
        };
        CropResizeModule.prototype.parent = function () {
            return null;
        };
        CropResizeModule.prototype.name = function () {
            return 'crop-resize';
        };
        CropResizeModule.prototype.deinit = function () {
            if (this.fit != null) {
                this.fit.destroy();
                this.fit = null;
            }
            this.editor.UI().clearPopover();
        };
        return CropResizeModule;
    })();
    Modules.CropResizeModule = CropResizeModule;
})(Modules || (Modules = {}));
/// <reference path="../../Core/Image/RsImage.ts"/>
/// <reference path="../../Core/Action/EditorAction.ts"/>
var Modules;
(function (Modules) {
    var FitAction = (function () {
        function FitAction(image, rect, method) {
            this.image = image;
            this.rect = rect;
            this.method = method;
            this.isCropped = false;
            if (method == 0 /* RESIZE */) {
                this.size = Modules.SizeCalculation.getFitSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == 1 /* WIDTH */) {
                this.size = Modules.SizeCalculation.getStretchWidthSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else if (method == 2 /* HEIGHT */) {
                this.size = Modules.SizeCalculation.getStretchHeightSize(rect.width, rect.height, this.image.width, this.image.height);
            }
            else {
                this.size = Modules.SizeCalculation.getStretchRectSize(rect.width, rect.height, this.image.width, this.image.height);
            }
        }
        FitAction.prototype.execute = function () {
            var _this = this;
            this.oldWidth = this.image.getWidth();
            this.oldHeight = this.image.getHeight();
            if ((this.size.width > this.rect.width) || (this.size.height > this.rect.height)) {
                this.originalImage = this.image.getOriginalImage();
                this.isCropped = true;
            }
            this.image.width = this.size.width | 0;
            this.image.height = this.size.height | 0;
            return this.image.save().then(function (image) {
                if (_this.isCropped) {
                    var w = _this.image.width;
                    if (w > _this.rect.width) {
                        w = _this.rect.width;
                    }
                    var h = _this.image.height;
                    if (h > _this.rect.height) {
                        h = _this.rect.height;
                    }
                    _this.image.crop(0, 0, w, h);
                    return _this.image.save();
                }
                else {
                    return Promise.resolve(image);
                }
            });
            /*
                        return new Promise<Core.RsImage>(
                            (resolve, reject) => {
                                this.image.save().then((image) => {
                                    if (this.isCropped) {
                                        var w = this.image.width;
                                        if (w > this.rect.width) {
                                            w = this.rect.width;
                                        }
            
                                        var h = this.image.height;
                                        if (h > this.rect.height) {
                                            h = this.rect.height;
                                        }
            
                                        this.image.crop(0, 0, w, h);
                                        this.image.save().then((image) => {
                                            resolve(image);
                                        })
                                    }
                                    else {
                                        resolve(image);
                                    }
                                });
                            }
                        );*/
        };
        FitAction.prototype.unExecute = function () {
            this.image.width = this.oldWidth;
            this.image.height = this.oldHeight;
            if (this.isCropped) {
                this.image.replaceOriginal(this.originalImage);
            }
            return this.image.save();
        };
        return FitAction;
    })();
    Modules.FitAction = FitAction;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    (function (FitMethod) {
        FitMethod[FitMethod["RESIZE"] = 0] = "RESIZE";
        FitMethod[FitMethod["WIDTH"] = 1] = "WIDTH";
        FitMethod[FitMethod["HEIGHT"] = 2] = "HEIGHT";
        FitMethod[FitMethod["RECT"] = 3] = "RECT";
    })(Modules.FitMethod || (Modules.FitMethod = {}));
    var FitMethod = Modules.FitMethod;
    var Fit = (function (_super) {
        __extends(Fit, _super);
        function Fit($el, images, ui) {
            var _this = this;
            _super.call(this);
            this.$el = $el;
            this.images = images;
            this.ui = ui;
            this.selected = 0 /* RESIZE */;
            this.fitCanvas = new Modules.FitMethodCanvas($el.find('#fitCanvas')[0]);
            this.$widthInput = $el.find('.sizes__width input');
            this.$heightInput = $el.find('.sizes__height input');
            this.$button = $el.find('.fit-button');
            this.$methods = $el.find('.module-list li');
            this.$methods.on('click.CropResize', function (e) {
                _this.$methods.removeClass('selected');
                _this.selectMethod($(e.target));
            });
            this.$button.on('click.CropResize', function () {
                _this.trigger('apply', _this.selected);
                return false;
            });
        }
        Fit.prototype.getSelectedMethod = function () {
            return this.selected;
        };
        Fit.prototype.getRect = function () {
            return {
                left: 0,
                top: 0,
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            };
        };
        Fit.prototype.getRectSize = function () {
            return {
                width: parseInt(this.$widthInput.val()),
                height: parseInt(this.$heightInput.val())
            };
        };
        Fit.prototype.selectMethod = function ($item) {
            this.images = this.ui.selected();
            $item.addClass('selected');
            var rect = this.getRectSize();
            if ($item.data('value') == 'resize-all') {
                this.selected = 0 /* RESIZE */;
                this.fitCanvas.drawResizeAll(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-width') {
                this.selected = 1 /* WIDTH */;
                this.fitCanvas.drawStretchToWidth(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-height') {
                this.selected = 2 /* HEIGHT */;
                this.fitCanvas.drawStretchToHeight(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
            else if ($item.data('value') == 'stretch-to-rect') {
                this.selected = 3 /* RECT */;
                this.fitCanvas.drawStretchToRect(rect.width, rect.height, this.images[0].getWidth(), this.images[0].getHeight());
            }
        };
        Fit.prototype.destroy = function () {
            this.$methods.off('.CropResize');
            this.$button.off('.CropResize');
        };
        return Fit;
    })(UI.Widgets.RsWidget);
    Modules.Fit = Fit;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var FitMethodCanvas = (function () {
        function FitMethodCanvas(canvas) {
            this.canvas = canvas;
            this.canvasWidth = 120;
            this.canvasHeight = 120;
            this.canvasPadding = 20;
            this.context = this.canvas.getContext('2d');
        }
        FitMethodCanvas.prototype.initCanvas = function () {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
            this.context.fillStyle = '#FFFFFF';
            this.context.strokeStyle = '#000000';
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        };
        FitMethodCanvas.prototype.getNewSize = function (rect, image) {
            var k = Math.min((this.canvasWidth - this.canvasPadding * 2) / Math.max(rect.width, image.width), (this.canvasHeight - this.canvasPadding * 2) / Math.max(rect.height, image.height));
            return {
                rect: { width: rect.width * k, height: rect.height * k },
                image: { width: image.width * k, height: image.height * k }
            };
        };
        FitMethodCanvas.prototype.drawResizeAll = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();
            var sizes = this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getFitSize(rectWidth, rectHeight, imageWidth, imageHeight));
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.image.width, sizes.image.height);
        };
        FitMethodCanvas.prototype.drawStretchToWidth = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();
            var sizes = this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchWidthSize(rectWidth, rectHeight, imageWidth, imageHeight));
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';
            var visibleRect = {
                width: sizes.image.width,
                height: sizes.image.height
            };
            if (sizes.image.height > sizes.rect.height) {
                visibleRect.height = sizes.rect.height;
            }
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);
            if (sizes.image.height > sizes.rect.height) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding, this.canvasPadding + visibleRect.height, visibleRect.width, sizes.image.height - visibleRect.height);
            }
        };
        FitMethodCanvas.prototype.drawStretchToHeight = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();
            var sizes = this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchHeightSize(rectWidth, rectHeight, imageWidth, imageHeight));
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';
            var visibleRect = {
                width: sizes.image.width,
                height: sizes.image.height
            };
            if (sizes.image.width > sizes.rect.width) {
                visibleRect.width = sizes.rect.width;
            }
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);
            if (sizes.image.width > sizes.rect.width) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding + visibleRect.width, this.canvasPadding, sizes.image.width - visibleRect.width, sizes.image.height);
            }
        };
        FitMethodCanvas.prototype.drawStretchToRect = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            this.initCanvas();
            var sizes = this.getNewSize({ width: rectWidth, height: rectHeight }, Modules.SizeCalculation.getStretchRectSize(rectWidth, rectHeight, imageWidth, imageHeight));
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, sizes.rect.width, sizes.rect.height);
            this.context.strokeStyle = '#FF0000';
            var visibleRect = {
                width: sizes.image.width,
                height: sizes.image.height
            };
            if (sizes.image.width > sizes.rect.width) {
                visibleRect.width = sizes.rect.width;
            }
            if (sizes.image.height > sizes.rect.height) {
                visibleRect.height = sizes.rect.height;
            }
            this.context.strokeRect(this.canvasPadding, this.canvasPadding, visibleRect.width, visibleRect.height);
            if (sizes.image.width > sizes.rect.width) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding + visibleRect.width, this.canvasPadding, sizes.image.width - visibleRect.width, sizes.image.height);
            }
            if (sizes.image.height > sizes.rect.height) {
                this.context.setLineDash([2]);
                this.context.strokeRect(this.canvasPadding, this.canvasPadding + visibleRect.height, visibleRect.width, sizes.image.height - visibleRect.height);
            }
        };
        return FitMethodCanvas;
    })();
    Modules.FitMethodCanvas = FitMethodCanvas;
})(Modules || (Modules = {}));
var Modules;
(function (Modules) {
    var SizeCalculation = (function () {
        function SizeCalculation() {
        }
        SizeCalculation.getFitSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            if ((imageWidth <= rectWidth) && (imageHeight <= rectHeight)) {
                return { width: imageWidth, height: imageHeight };
            }
            var k = Math.min(rectWidth / imageWidth, rectHeight / imageHeight);
            return { width: imageWidth * k, height: imageHeight * k };
        };
        SizeCalculation.getStretchWidthSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            return {
                width: rectWidth,
                height: rectWidth / (imageWidth / imageHeight)
            };
        };
        SizeCalculation.getStretchHeightSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            return {
                width: rectHeight * (imageWidth / imageHeight),
                height: rectHeight
            };
        };
        SizeCalculation.getStretchRectSize = function (rectWidth, rectHeight, imageWidth, imageHeight) {
            var k = Math.max(rectWidth / imageWidth, rectHeight / imageHeight);
            return { width: imageWidth * k, height: imageHeight * k };
        };
        return SizeCalculation;
    })();
    Modules.SizeCalculation = SizeCalculation;
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
        ResizeModule.prototype.selectImage = function (image) {
        };
        ResizeModule.prototype.unSelectImage = function (image) {
        };
        ResizeModule.prototype.deinit = function () {
            this.editor.UI().clearPopover();
        };
        ResizeModule.prototype.viewType = function () {
            return 0 /* SINGLE */;
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
                _this.editor.UI().getView().update();
            });
        };
        return ResizeModule;
    })();
    Modules.ResizeModule = ResizeModule;
})(Modules || (Modules = {}));
