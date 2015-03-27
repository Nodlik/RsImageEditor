<div class="crop-resize">
    <div class="crop-resize__action fit">
        <h2>Fit to a rect</h2>

        <div class="fit__sizes sizes">
            <div class="sizes__width">
                <label for="fitSizesWidth">Width</label><br />
                <input type="number" id="fitSizesWidth"  /> px
            </div>
            <div class="sizes__height">
                <label for="fitSizesHeight">Height</label><br />
                <input type="number" id="fitSizesHeight" /> px
            </div>
        </div>

        <div class="fit__methods">
            <p>Choose Method:</p>
            <ul class="module-list">
                <li data-value="resize-all">Resizing on all sides</li>
                <li data-value="stretch-to-width">Stretch width</li>
                <li data-value="stretch-to-height">Stretch height</li>
                <li data-value="stretch-to-rect">Stretch to rect</li>
            </ul>

            <div class="fit__methods-canvas">
                <canvas id="fitCanvas"></canvas>
            </div>
        </div>

        <div class="fit__method-position methods">
            <p>Position:</p>
            <div class="fit-position methods-list" id="fitPosition">
                <div class="fp fp-left-top selected" style="left: 0; top: 0"></div>
                <div class="fp fp-top" style="left: 20px; top: 0"></div>
                <div class="fp fp-right-top" style="right: 0; top: 0"></div>
                <div class="fp fp-left" style="left: 0; top: 20px"></div>
                <div class="fp fp-right" style="right: 0; top: 20px"></div>
                <div class="fp fp-left-bottom" style="left: 0; bottom: 0"></div>
                <div class="fp fp-bottom" style="left: 20px; bottom: 0"></div>
                <div class="fp fp-right-bottom" style="right: 0; bottom: 0"></div>
            </div>
        </div>

        <div class="fit-crop__button">
            <input type="checkbox" id="fitCrop" checked /> <label for="fitCrop">Crop image if its size is larger than the size of rectangle</label>
        </div>

        <div class="fit__button">
            <button class="fit-button crop-button">Apply</button>
        </div>
    </div>

    <div class="crop-resize__action crop" style="margin-top: 20px">
        <h2>Crop</h2>

        <div class="crop-sizes sizes">
            <div class="crop__width">
                <label for="cropSizesWidth">Width</label><br />
                <input type="number" id="cropSizesWidth"  /> px
            </div>
            <div class="crop__height">
                <label for="cropSizesHeight">Height</label><br />
                <input type="number" id="cropSizesHeight" /> px
            </div>
        </div>

        <div class="crop__method-position methods">
            <p>Position:</p>
            <div class="crop-position methods-list" id="cropPosition">
                <div class="fp fp-left-top selected" style="left: 0; top: 0"></div>
                <div class="fp fp-top" style="left: 20px; top: 0"></div>
                <div class="fp fp-right-top" style="right: 0; top: 0"></div>
                <div class="fp fp-left" style="left: 0; top: 20px"></div>
                <div class="fp fp-center" style="left: 20px; top: 20px"></div>
                <div class="fp fp-right" style="right: 0; top: 20px"></div>
                <div class="fp fp-left-bottom" style="left: 0; bottom: 0"></div>
                <div class="fp fp-bottom" style="left: 20px; bottom: 0"></div>
                <div class="fp fp-right-bottom" style="right: 0; bottom: 0"></div>
            </div>
        </div>

        <div class="fit__button">
            <button class="crop-button" id="cropButton">Crop</button>
        </div>
    </div>
</div>