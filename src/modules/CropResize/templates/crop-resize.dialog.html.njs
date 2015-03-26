<div>
    <h2>Crop & Resize</h2>
</div>

<div class="crop-resize">
    <div class="crop-resize__action fit">
        <div class="crop-resize__title">Fit to a rect</div>

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

        <div class="fit__method-position">
            <p>Position:</p>
            <div class="fit-position" id="fitPosition">
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
</div>