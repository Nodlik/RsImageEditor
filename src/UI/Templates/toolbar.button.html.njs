<div id="t-button__{{ button.name }}" class="rs-toolbar-button {% if button.css != "" %}{{ button.css }}{% endif %}">
    {% if button.icon != "" %}
    <i class="{{ button.icon }}"></i>
    {% else %}
        {{ button.localizedName }}
    {% endif %}
</div>