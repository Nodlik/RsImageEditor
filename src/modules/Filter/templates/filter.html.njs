<div class="m-filter">
    <div class="m-filter__canvas">
        <canvas id="mFilter-{{ filter.name }}" width="50" height="30"></canvas>
    </div>

    <div class="m-filter__name">{{ filter.displayName }}</div>

    <div class="m-filter__vignette">
        <input type="checkbox" checked id="mFilter-{{ filter.name }}-vignette" /> <br />
    </div>
</div>