(function() {
    function TibiaMap() {
        this.map = null;
        this.crosshairs = null;
        this.floor = 7;
        this.mapFloors = [];
        this.options = {};
        this.isColorMap = true;
    }
    const URL_PREFIX = 'https://tibiamaps.github.io/tibia-map-data/';

    let KNOWN_TILES = null;
    const fetchKnownTiles = function() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', URL_PREFIX + 'mapper/tiles.json', true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            if (xhr.status === 200) {
                KNOWN_TILES = new Set(xhr.response);
            }
        };
        xhr.send();
    };
    fetchKnownTiles();
    const isEmbed = location.pathname.indexOf('/embed') !== -1 || location.pathname.indexOf('/poi') !== -1;
    const setUrlPosition = function(coords, forceHash) {
        const url = '#' + coords.x + ',' + coords.y + ',' + coords.floor + ':' + coords.zoom;
        if (forceHash && location.hash != url) {
            window.history.pushState(null, null, url);
        }
    };
    TibiaMap.prototype.setUrlPosition = setUrlPosition;
    const getUrlPosition = function() {
        const position = {
            'x': 32368,
            'y': 32198,
            'floor': 7,
            'zoom': 0
        };
        let parts;
        let hash = window.location.hash.slice(1);
        if (hash.includes('%20')) {
            hash = decodeURIComponent(hash);
            parts = hash.replace(/[^0-9,]/g, '').split(',');
            position.x = parseInt(parts[0], 10);
            position.y = parseInt(parts[1], 10);
            position.floor = parseInt(parts[2], 10);
            return position;
        }
        parts = hash.split(':');
        if (parts[0]) {
            const tempPos = parts[0].split(',');
            if (tempPos.length == 3) {
                position.x = parseInt(tempPos[0], 10);
                position.y = parseInt(tempPos[1], 10);
                position.floor = parseInt(tempPos[2], 10);
            }
        }
        if (parts[1]) {
            position.zoom = parseInt(parts[1], 10);
        }
        return position;
    };
    TibiaMap.prototype.getUrlPosition = getUrlPosition;
    const modifyLeaflet = function() {
        L.CRS.CustomZoom = L.extend({}, L.CRS.Simple, {
            'scale': function(zoom) {
                switch (zoom) {
                    case 0:
                        return 256;
                    case 1:
                        return 512;
                    case 2:
                        return 1792;
                    case 3:
                        return 5120;
                    case 4:
                        return 10240;
                    default:
                        return 256;
                }
            },
            'latLngToPoint': function(latlng, zoom) {
                const projectedPoint = this.projection.project(latlng);
                const scale = this.scale(zoom);
                return this.transformation._transform(projectedPoint, scale);
            },
            'pointToLatLng': function(point, zoom) {
                const scale = this.scale(zoom);
                const untransformedPoint = this.transformation.untransform(point, scale);
                return this.projection.unproject(untransformedPoint);
            }
        });
    };
    TibiaMap.prototype._createMapFloorLayer = function(floor) {
        const _this = this;
        const mapLayer = _this.mapFloors[floor] = new L.GridLayer({
            'floor': floor
        });
        mapLayer.getTileSize = function() {
            const tileSize = L.GridLayer.prototype.getTileSize.call(this);
            const zoom = this._tileZoom;

            if (zoom > 0) {
                return tileSize.divideBy(this._map.getZoomScale(0, zoom)).round();
            }
            return tileSize;
        };
        mapLayer._setZoomTransform = function(level, center, zoom) {
            const coords = getUrlPosition();
            coords.zoom = zoom;
            setUrlPosition(coords, true);
            const scale = this._map.getZoomScale(zoom, level.zoom);
            const translate = level.origin.multiplyBy(scale).subtract(
                this._map._getNewPixelOrigin(center, zoom)
            ).round();
            L.DomUtil.setTransform(level.el, translate, scale);
        };
        mapLayer.createTile = function(coords, done) {
            const tile = document.createElement('canvas');
            const ctx = tile.getContext('2d');
            tile.width = tile.height = 256;

            const latlng = this._map.project({ lng: coords.x, lat: coords.y }, 0);
            Object.keys(latlng).map(function(key) {
                latlng[key] = Math.abs(latlng[key]);
            });

            const tileId = latlng.x + '_' + latlng.y + '_' + this.options.floor;

            if (KNOWN_TILES && !KNOWN_TILES.has(tileId)) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 256, 256);
                return tile;
            }
            ctx.imageSmoothingEnabled = false;
            const image = new Image();
            image.onload = function() {
                ctx.drawImage(image, 0, 0, 256, 256);
                done(null, tile);
            };
            image.src = URL_PREFIX + 'mapper/Minimap_' + (
                _this.isColorMap ? 'Color' : 'WaypointCost'
            ) + '_' + tileId + '.png';
            return tile;
        };
        return mapLayer;
    };
    TibiaMap.prototype._showHoverTile = function() {
        const map = this.map;
        const _this = this;
        map.on('mouseout', function(event) {
            _this.hoverTile.setBounds([
                [0, 0],
                [0, 0]
            ]);
        });
        map.on('mousemove', function(event) {
            const pos = map.project(event.latlng, 0);
            const x = Math.floor(pos.x);
            const y = Math.floor(pos.y);
            const bounds = [map.unproject([x, y], 0), map.unproject([x + 1, y + 1], 0)];
            if (!_this.hoverTile) {
                _this.hoverTile = L.rectangle(bounds, {
                    color: '#009eff',
                    weight: 1,
                    clickable: false,
                    pointerEvents: 'none'
                }).addTo(map);
            } else {
                _this.hoverTile.setBounds(bounds);
            }
        });
    };

    TibiaMap.prototype._toggleMapType = function() {
        this.isColorMap = !this.isColorMap;

        const map = this.map;
        map._resetView(map.getCenter(), map.getZoom(), true);
    };

    TibiaMap.prototype.init = function(options) {
        const _this = this;
        _this.options = options;
        modifyLeaflet();

        const bounds = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };
        const xPadding = window.innerWidth / 256 / 2;
        const yPadding = window.innerHeight / 256 / 2;
        const yMin = bounds.yMin - yPadding;
        const xMin = bounds.xMin - xPadding;
        const yMax = bounds.yMax + 1 + yPadding;
        const xMax = bounds.xMax + 1 + xPadding;
        const maxBounds = L.latLngBounds(L.latLng(-yMin, xMin), L.latLng(-yMax, xMax));
        const map = _this.map = L.map('map', {
            'attributionControl': false,
            'crs': L.CRS.CustomZoom,
            'fadeAnimation': false,
            'keyboardPanOffset': 400,
            'maxBounds': maxBounds,
            'maxNativeZoom': 0,
            'maxZoom': 4,
            'minZoom': 0,
            'scrollWheelZoom': !isEmbed,
            'unloadInvisibleTiles': false,
            'updateWhenIdle': true,
            'zoomAnimationThreshold': 4,
            'touchZoom': false
        });
        const baseMaps = {
            'Floor +7': _this._createMapFloorLayer(0),
            'Floor +6': _this._createMapFloorLayer(1),
            'Floor +5': _this._createMapFloorLayer(2),
            'Floor +4': _this._createMapFloorLayer(3),
            'Floor +3': _this._createMapFloorLayer(4),
            'Floor +2': _this._createMapFloorLayer(5),
            'Floor +1': _this._createMapFloorLayer(6),
            'Ground floor': _this._createMapFloorLayer(7),
            'Floor -1': _this._createMapFloorLayer(8),
            'Floor -2': _this._createMapFloorLayer(9),
            'Floor -3': _this._createMapFloorLayer(10),
            'Floor -4': _this._createMapFloorLayer(11),
            'Floor -5': _this._createMapFloorLayer(12),
            'Floor -6': _this._createMapFloorLayer(13),
            'Floor -7': _this._createMapFloorLayer(14),
            'Floor -8': _this._createMapFloorLayer(15)
        };
        const layers_widget = L.control.layers(baseMaps, {}).addTo(map);
        const current = getUrlPosition();
        _this.floor = current.floor;
        map.setView(map.unproject([current.x, current.y], 0), current.zoom);
        _this.mapFloors[current.floor].addTo(map);
        window.addEventListener('popstate', function(event) {
            const current = getUrlPosition();
            if (current.floor !== _this.floor) {
                _this.floor = current.floor;
                _this.mapFloors[_this.floor].addTo(map);
            }
            if (current.zoom !== map.getZoom()) {
                map.setZoom(current.zoom);
            }
            map.panTo(map.unproject([current.x, current.y], 0));
        });
        map.on('baselayerchange', function(layer) {
            _this.floor = layer.layer.options.floor;
        });
        map.on('click', function(event) {
            const coords = L.CRS.CustomZoom.latLngToPoint(event.latlng, 0);
            const zoom = map.getZoom();
            const coordX = Math.floor(Math.abs(coords.x));
            const coordY = Math.floor(Math.abs(coords.y));
            const coordZ = _this.floor;
            setUrlPosition({
                x: coordX,
                y: coordY,
                floor: coordZ,
                zoom: zoom
            }, true);
            if (window.console) {
                const xID = Math.floor(coordX / 256) * 256;
                const yID = Math.floor(coordY / 256) * 256;
                const id = xID + '_' + yID + '_' + coordZ;
                console.log(id);
            }
        });
        this.crosshairs = L.crosshairs().addTo(map);
        L.control.coordinates({
            position: 'bottomleft',
            enableUserInput: false,
            labelFormatterLat: function(lat) {
                return '<b>Y</b>: ' + Math.floor(lat) + ' <b>Z</b>: ' + _this.floor;
            },
            labelFormatterLng: function(lng) {
                return '<b>X</b>: ' + Math.floor(lng);
            }
        }).addTo(map);
        L.ExivaButton.btns = L.exivaButton({
            crosshairs: this.crosshairs
        }).addTo(map);
        _this._showHoverTile();

        const cityAreas = [
            { name: "Thais", x: 32369, y: 32241, floor: 7 },
            { name: "Carlin", x: 32343, y: 31791, floor: 7 },
            { name: "Kazordoon", x: 32629, y: 31925, floor: 7 },
            { name: "Kazordoon", x: 32826, y: 31762, floor: 7 },
            { name: "Ab'Dendriel", x: 32681, y: 31637, floor: 7 },
            { name: "Edron", x: 33205, y: 31819, floor: 7 },
            { name: "Darashia", x: 33238, y: 32435, floor: 7 },
            { name: "Venore", x: 32957, y: 32076, floor: 7 },
            { name: "Ankrahmun", x: 33158, y: 32829, floor: 7 },
            { name: "Port Hope", x: 32623, y: 32763, floor: 7 },
            { name: "Liberty Bay", x: 32317, y: 32826, floor: 7 },
            { name: "Svargrond", x: 32273, y: 31149, floor: 7 },
            { name: "Yalahar", x: 32802, y: 31206, floor: 7 },
            { name: "Travora", x: 32067, y: 32354, floor: 7 },
            { name: "Farmine", x: 33023, y: 31453, floor: 7 },
            { name: "Gray Beach", x: 33447, y: 31323, floor: 7 },
            { name: "Roshamuul", x: 33553, y: 32379, floor: 7 },
            { name: "Rathleton", x: 33627, y: 31913, floor: 7 }
        ];

        cityAreas.forEach(area => {
            const latLng = map.unproject([area.x, area.y], 0);
            L.marker(latLng)
                .addTo(map)
                .bindPopup(area.name);
        });
    };

    const mapContainer = document.querySelector('#map');
    const map = new TibiaMap();
    map.init(mapContainer.dataset);

    document.documentElement.addEventListener('keydown', function(event) {
        const _map = map.map;
        if (event.key === 'c') {
            const current = getUrlPosition();
            _map.panTo(_map.unproject([current.x, current.y], 0));
        }

        if (event.key === 'e') {
            map.crosshairs._toggleExiva();
        }
    });

}());
