(function() {
	const URL_PREFIX = 'https://tibiamaps.github.io/tibia-map-data/';
	
	class TibiaMap {
	  constructor() {
		this.map = null;
		this.crosshairs = null;
		this.floor = 7;
		this.mapFloors = [];
		this.options = {};
		this.isColorMap = true;
		this.KNOWN_TILES = null;
	  }
  
	  init(options) {
		this.options = options;
		this.modifyLeaflet();
		this.fetchKnownTiles().then(() => {
		  this.setupMap();
		});
	  }
  
	  fetchKnownTiles() {
		return fetch(`${URL_PREFIX}mapper/tiles.json`)
		  .then(response => response.json())
		  .then(data => {
			this.KNOWN_TILES = new Set(data);
		  });
	  }
  
	  modifyLeaflet() {
		L.CRS.CustomZoom = L.extend({}, L.CRS.Simple, {
		  scale: function(zoom) {
			const scales = [256, 512, 1792, 5120, 10240];
			return scales[zoom] || 256;
		  },
		  latLngToPoint: function(latlng, zoom) {
			const projectedPoint = this.projection.project(latlng);
			const scale = this.scale(zoom);
			return this.transformation._transform(projectedPoint, scale);
		  },
		  pointToLatLng: function(point, zoom) {
			const scale = this.scale(zoom);
			const untransformedPoint = this.transformation.untransform(point, scale);
			return this.projection.unproject(untransformedPoint);
		  }
		});
	  }
  
	  createMapFloorLayer(floor) {
		const _this = this; // Preserve the context of 'TibiaMap' instance
		const mapLayer = new L.GridLayer({ floor });
	  
		mapLayer.getTileSize = function() {
		  const tileSize = L.GridLayer.prototype.getTileSize.call(this);
		  const zoom = this._tileZoom;
		  return zoom > 0 ? tileSize.divideBy(this._map.getZoomScale(0, zoom)).round() : tileSize;
		};
	  
		mapLayer._setZoomTransform = function(level, center, zoom) {
		  const coords = _this.getUrlPosition();
		  coords.zoom = zoom;
		  _this.setUrlPosition(coords, true);
		  const scale = _this.map.getZoomScale(zoom, level.zoom);
		  const translate = level.origin.multiplyBy(scale).subtract(
			_this.map._getNewPixelOrigin(center, zoom)
		  ).round();
		  L.DomUtil.setTransform(level.el, translate, scale);
		};
	  
		mapLayer.createTile = function(coords, done) {
		  const tile = document.createElement('canvas');
		  const ctx = tile.getContext('2d');
		  tile.width = tile.height = 256;
	  
		  const latlng = _this.map.project({ lng: coords.x, lat: coords.y }, 0);
		  Object.keys(latlng).forEach(key => { latlng[key] = Math.abs(latlng[key]); });
	  
		  const tileId = `${latlng.x}_${latlng.y}_${floor}`;
	  
		  if (_this.KNOWN_TILES && !_this.KNOWN_TILES.has(tileId)) {
			console.log(`Tile ${tileId} is not known.`);
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, 256, 256);
			done(null, tile);
			return tile;
		  }
  
		  ctx.imageSmoothingEnabled = false;
		  const image = new Image();
		  image.onload = function() {
			ctx.drawImage(image, 0, 0, 256, 256);
			done(null, tile);
		  };
		  image.onerror = function() {
			console.error(`Error loading image ${image.src}`);
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, 256, 256);
			done(null, tile);
		  };
		  image.src = `${URL_PREFIX}mapper/Minimap_${_this.isColorMap ? 'Color' : 'WaypointCost'}_${tileId}.png`;
		  console.log(`Loading image from ${image.src}`);
		  return tile;
		};
	  
		return mapLayer;
	  }
	  
	  setupMap() {
		const bounds = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };
		const xPadding = window.innerWidth / 256 / 2;
		const yPadding = window.innerHeight / 256 / 2;
		const yMin = bounds.yMin - yPadding;
		const xMin = bounds.xMin - xPadding;
		const yMax = bounds.yMax + 1 + yPadding;
		const xMax = bounds.xMax + 1 + xPadding;
		const maxBounds = L.latLngBounds(L.latLng(-yMin, xMin), L.latLng(-yMax, xMax));
	
		this.map = L.map('map', {
		  attributionControl: false,
		  crs: L.CRS.CustomZoom,
		  fadeAnimation: false,
		  keyboardPanOffset: 400,
		  maxBounds: maxBounds,
		  maxNativeZoom: 0,
		  maxZoom: 4,
		  minZoom: 0,
		  unloadInvisibleTiles: false,
		  updateWhenIdle: true,
		  zoomAnimationThreshold: 4,
		  touchZoom: false
		});
	
		const baseMaps = {};
		for (let i = 0; i <= 15; i++) {
		  const layer = this.createMapFloorLayer(i);
		  baseMaps[`Floor ${i - 7}`] = layer;
		  this.mapFloors[i] = layer;
		}
	
		L.control.layers(baseMaps, {}).addTo(this.map);
		this.setInitialView();
		this.addEventListeners();
		this.addCustomControls();
	
		this.showHoverTile();
		this.addMarker(32462, 32077, 'Cyclops Thais');
	  }
	
	  setUrlPosition(coords, forceHash) {
		const url = `#${coords.x},${coords.y},${coords.floor}:${coords.zoom}`;
		if (forceHash && location.hash !== url) {
		  window.history.pushState(null, null, url);
		}
	  }
	
	  getUrlPosition() {
		const position = { x: 32818, y: 32430, floor: 7, zoom: 0 };
		let hash = window.location.hash.slice(1);
	
		if (hash.includes('%20')) {
		  hash = decodeURIComponent(hash);
		  const parts = hash.replace(/[^0-9,]/g, '').split(',');
		  position.x = parseInt(parts[0], 10);
		  position.y = parseInt(parts[1], 10);
		  position.floor = parseInt(parts[2], 10);
		  return position;
		}
	
		const parts = hash.split(':');
		if (parts[0]) {
		  const tempPos = parts[0].split(',');
		  if (tempPos.length === 3) {
			position.x = parseInt(tempPos[0], 10);
			position.y = parseInt(tempPos[1], 10);
			position.floor = parseInt(tempPos[2], 10);
		  }
		}
		if (parts[1]) {
		  position.zoom = parseInt(parts[1], 10);
		}
		return position;
	  }
	
	  setInitialView() {
		const current = this.getUrlPosition();
		this.floor = current.floor;
		this.map.setView(this.map.unproject([current.x, current.y], 0), current.zoom);
		if (this.mapFloors[current.floor]) {
		  this.mapFloors[current.floor].addTo(this.map);
		}
	
		window.addEventListener('popstate', () => {
		  const current = this.getUrlPosition();
		  if (current.floor !== this.floor) {
			this.floor = current.floor;
			if (this.mapFloors[this.floor]) {
			  this.mapFloors[this.floor].addTo(this.map);
			}
		  }
		  if (current.zoom !== this.map.getZoom()) {
			this.map.setZoom(current.zoom);
		  }
		  this.map.panTo(this.map.unproject([current.x, current.y], 0));
		});
	  }
	
	  addEventListeners() {
		this.map.on('baselayerchange', layer => {
		  this.floor = layer.layer.options.floor;
		});
	
		this.map.on('click', event => {
		  const coords = L.CRS.CustomZoom.latLngToPoint(event.latlng, 0);
		  const zoom = this.map.getZoom();
		  const coordX = Math.floor(Math.abs(coords.x));
		  const coordY = Math.floor(Math.abs(coords.y));
		  const coordZ = this.floor;
		  this.setUrlPosition({
			x: coordX,
			y: coordY,
			floor: coordZ,
			zoom: zoom
		  }, true);
	
		  if (window.console) {
			const xID = Math.floor(coordX / 256) * 256;
			const yID = Math.floor(coordY / 256) * 256;
			const id = `${xID}_${yID}_${coordZ}`;
			console.log(id);
		  }
		});
	
		document.documentElement.addEventListener('keydown', event => {
		  if (event.key === 'c') {
			const current = this.getUrlPosition();
			this.map.panTo(this.map.unproject([current.x, current.y], 0));
		  }
		  if (event.key === 'e') {
			this.crosshairs._toggleExiva();
		  }
		  if (event.key === 'p') {
			this.toggleMapType();
		  }
		});
	  }
	
	  addCustomControls() {
		this.crosshairs = L.crosshairs().addTo(this.map);
	
		L.control.coordinates({
		  position: 'bottomleft',
		  enableUserInput: false,
		  labelFormatterLat: lat => `<b>Y</b>: ${Math.floor(lat)} <b>Z</b>: ${this.floor}`,
		  labelFormatterLng: lng => `<b>X</b>: ${Math.floor(lng)}`
		}).addTo(this.map);
	
		L.LevelButtons.btns = L.levelButtons({
		  layers_widget: L.control.layers({}, {}).addTo(this.map)
		}).addTo(this.map);
	
		L.ExivaButton.btns = L.exivaButton({
		  crosshairs: this.crosshairs
		}).addTo(this.map);
	  }
	
	  showHoverTile() {
		this.map.on('mouseout', () => {
		  if (this.hoverTile) {
			this.hoverTile.setBounds([[0, 0], [0, 0]]);
		  }
		});
		this.map.on('mousemove', event => {
		  const pos = this.map.project(event.latlng, 0);
		  const x = Math.floor(pos.x);
		  const y = Math.floor(pos.y);
		  const bounds = [this.map.unproject([x, y], 0), this.map.unproject([x + 1, y + 1], 0)];
		  if (!this.hoverTile) {
			this.hoverTile = L.rectangle(bounds, {
			  weight: 1,
			  clickable: false,
			  pointerEvents: 'none'
			}).addTo(this.map);
		  } else {
			this.hoverTile.setBounds(bounds);
		  }
		});
	  }
	
	  toggleMapType() {
		this.isColorMap = !this.isColorMap;
		this.map._resetView(this.map.getCenter(), this.map.getZoom(), true);
	  }
	
	  addMarker(x, y, popupText) {
		const latLng = this.map.unproject([x, y], 0);
		L.marker(latLng).addTo(this.map).bindPopup(popupText);
	  }
	}
	
	const mapContainer = document.querySelector('#map');
	if (mapContainer) {
	  const map = new TibiaMap();
	  map.init(mapContainer.dataset);
	}
  })();
  