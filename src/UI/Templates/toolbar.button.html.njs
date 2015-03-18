<div id="t-button__{{ button.name }}" class="rs-toolbar-button">
    {% if button.icon != "" %}
    <i class="{{ button.icon }}"></i>
    {% else %}
        {{ button.localizedName }}
    {% endif %}
</div>