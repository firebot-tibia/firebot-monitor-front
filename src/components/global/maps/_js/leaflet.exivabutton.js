L.ExivaButton = L.Control.extend({
	options: {
		position: 'bottomright',
		autoZIndex: true,
		crosshairs: null,
	},
	onAdd: function(map) {
		this._map = map;
		const container = L.DomUtil.create('div', 'leaflet-control-exiva-button-panel leaflet-bar leaflet-control');
		const button = L.DomUtil.create('a', 'leaflet-control-exiva-button leaflet-bar-part', container);
		button.textContent = 'E';
		button.title = 'Toggle exiva overlay'
		button.href = '#';
		L.DomEvent.addListener(button, 'click', this._onClick, this);
		L.DomEvent.disableClickPropagation(button);
		return container;
	},
	_onClick: function(event) {
		L.DomEvent.stopPropagation(event);
		L.DomEvent.preventDefault(event);
		this.options.crosshairs._toggleExiva();
	},
});

L.exivaButton = function(options) {
	return new L.ExivaButton(options);
};

        // const layersControl = L.control.layers(baseMaps);
        // if (L.control && L.control.layers) {
        //     layersControl.addTo(map);
        // } else {
        //     console.warn('Layers control not available');
        // }