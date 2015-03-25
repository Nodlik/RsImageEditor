<div>
    <h2>Crop & Resize</h2>
</div>

<div class="crop-resize">
    <div class="crop-resize__action fit">
        <div class="crop-resize__title">Fit to a rect</div>

        <div class="fit__sizes sizes">
            <div class="sizes__width">
                Width<br />
                <input type="number" value="800" />px
            </div>
            <div class="sizes__height">
                Height<br />
                <input type="number" value="400" />px
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

        <div class="fit__button">
            <button class="fit-button">Apply</button>
        </div>
    </div>
</div>