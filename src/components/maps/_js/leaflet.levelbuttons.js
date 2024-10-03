L.LevelButtons = L.Control.extend({
    options: {
        position: 'bottomleft',
        autoZIndex: true,
        color: 'black',
    },
    onAdd: function(map) {
        this._map = map;
        const plugin_container = L.DomUtil.create('div', 'leaflet-control-level-buttons-panel leaflet-bar');
        const up_button = L.DomUtil.create('a', 'leaflet-control-level-buttons-a', plugin_container);
        up_button.textContent = '\u25B2';
        up_button.href = '#';
        L.DomEvent.addListener(up_button, 'click', this._onUpButton, this);
        L.DomEvent.disableClickPropagation(up_button);
        plugin_container.appendChild(up_button);
        const floor_button = L.DomUtil.create('span', 'leaflet-control-level-buttons-span', plugin_container);
        floor_button.id = 'floor_button';
        plugin_container.appendChild(floor_button);
        const down_button = L.DomUtil.create('a', 'leaflet-control-level-buttons-a', plugin_container);
        down_button.textContent = '\u25BC';
        down_button.href = '#';
        L.DomEvent.addListener(down_button, 'click', this._onDownButton, this);
        L.DomEvent.disableClickPropagation(down_button);
        plugin_container.appendChild(down_button);
        L.DomEvent.addListener(document.documentElement, 'keydown', function(event) {
            if (event.key === 'k') {
                this._onUpButton(event);
            }
            if (event.key === 'j') {
                this._onDownButton(event);
            }
        }, this);
        return plugin_container;
    },
    onRemove: function() {},
    _onUpButton: function(event) {
        const upper_floor_index = this._tibia_map_obj.floor - 1;
        if (upper_floor_index >= 0) {
            this._changeFloor(upper_floor_index);
        }
        event.preventDefault();
    },
    _onDownButton: function(event) {
        const lower_floor_index = this._tibia_map_obj.floor + 1;
        if (lower_floor_index <= 15) {
            this._changeFloor(lower_floor_index);
        }
        event.preventDefault();
    },
    setTibiaMap: function(tibia_map_obj) {
        this._tibia_map_obj = tibia_map_obj;
        this._setFloor(this._tibia_map_obj.floor);
    },
    _changeFloor: function(newFloor) {
        if (this._tibia_map_obj && this._tibia_map_obj.changeFloor) {
            this._tibia_map_obj.changeFloor(newFloor);
            this._setFloor(newFloor);
            this._updateUrl(newFloor);
        }
    },
    _setFloor: function(floor) {
        const floor_button = L.DomUtil.get('floor_button');
        const ground_floor = 7;
        let text = '';
        if (floor == ground_floor) {
            text = '0';
        } else if (floor < ground_floor){
            text = '+' + String(ground_floor - floor);
        } else {
            text = '-' + String(floor - ground_floor);
        }
        floor_button.textContent = text;
    },
    _updateUrl: function(floor) {
        if (this._map && typeof this._map.getCenter === 'function') {
            const center = this._map.getCenter();
            const zoom = this._map.getZoom();
            const newUrl = `#${zoom}/${center.lat.toFixed(2)}/${center.lng.toFixed(2)}/${floor}`;
            window.history.pushState(null, '', newUrl);
        }
    }
});

L.levelButtons = function(options) {
    return new L.LevelButtons(options);
};