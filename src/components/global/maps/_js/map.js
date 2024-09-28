(function() {
    const URL_PREFIX = 'https://tibiamaps.github.io/tibia-map-data/';
    let KNOWN_TILES = null;

    function TibiaMap() {
        this.map = null;
        this.crosshairs = null;
        this.floor = 7;
        this.mapFloors = [];
        this.options = {};
        this.isColorMap = true;
        this.hoverTile = null;
    }

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

    const setUrlPosition = function(coords, forceHash) {
        const url = '#' + coords.x + ',' + coords.y + ',' + coords.floor + ':' + coords.zoom;
        if (forceHash || location.hash !== url) {
            window.history.pushState(null, null, url);
            if (this.floor !== undefined) {
                this.floor = coords.floor;
            }
        }
    };

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

    const modifyLeaflet = function() {
        L.CRS.CustomZoom = L.extend({}, L.CRS.Simple, {
            scale: function(zoom) {
                switch (zoom) {
                    case 0: return 256;
                    case 1: return 512;
                    case 2: return 1792;
                    case 3: return 5120;
                    case 4: return 10240;
                    default: return 256;
                }
            },
            zoom: function(scale) {
                switch (scale) {
                    case 256: return 0;
                    case 512: return 1;
                    case 1792: return 2;
                    case 5120: return 3;
                    case 10240: return 4;
                    default: return 0;
                }
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
    };

    TibiaMap.prototype._createMapFloorLayer = function(floor) {
        const _this = this;
        const mapLayer = L.GridLayer.extend({
            createTile: function(coords, done) {
                const tile = document.createElement('canvas');
                const ctx = tile.getContext('2d');
                tile.width = tile.height = 256;

                const latlng = this._map.project({ lng: coords.x, lat: coords.y }, 0);
                Object.keys(latlng).forEach(function(key) {
                    latlng[key] = Math.abs(latlng[key]);
                });

                const tileId = `${Math.floor(latlng.x)}_${Math.floor(latlng.y)}_${floor}`;

                if (KNOWN_TILES && !KNOWN_TILES.has(tileId)) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 256, 256);
                    done(null, tile);
                    return tile;
                }

                ctx.imageSmoothingEnabled = false;
                const image = new Image();
                image.crossOrigin = "Anonymous";
                image.onload = function() {
                    ctx.drawImage(image, 0, 0, 256, 256);
                    done(null, tile);
                };
                image.onerror = function() {
                    console.error('Failed to load tile:', tileId);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 256, 256);
                    done(null, tile);
                };
                image.src = URL_PREFIX + 'mapper/Minimap_' + (
                    _this.isColorMap ? 'Color' : 'WaypointCost'
                ) + '_' + tileId + '.png';

                return tile;
            },
            floor: floor,
            minZoom: 0,
            maxZoom: 4,
            tileSize: 256,
            bounds: L.latLngBounds(L.latLng(-65536, 0), L.latLng(0, 65536)),
            noWrap: true
        });

        return new mapLayer();
    };

    TibiaMap.prototype._showHoverTile = function() {
        const map = this.map;
        const _this = this;
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

    TibiaMap.prototype.init = function(options) {
        const _this = this;
        _this.options = options;
        modifyLeaflet();
    
        const bounds = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };
        const maxBounds = L.latLngBounds(
            L.latLng(-bounds.yMax - 1, bounds.xMin),
            L.latLng(-bounds.yMin, bounds.xMax + 1)
        );
    
        const map = _this.map = L.map('map', {
            crs: L.CRS.CustomZoom,
            center: [32768, 32768],
            zoom: 2,
            minZoom: 0,
            maxZoom: 4,
            maxBounds: maxBounds,
            attributionControl: false,
            zoomControl: false,
            scrollWheelZoom: true, 
            doubleClickZoom: true  
        });
    
        if (L.control && L.control.zoom) {
            L.control.zoom({ position: 'topright' }).addTo(map);
        } else {
            console.warn('Zoom control not available');
        }
    
        const baseMaps = {};
        for (let i = 0; i <= 15; i++) {
            const floorName = i <= 7 ? `Floor +${7 - i}` : `Floor -${i - 7}`;
            _this.mapFloors[i] = _this._createMapFloorLayer(i);
            baseMaps[floorName] = _this.mapFloors[i];
        }
    
        const layersControl = L.control.layers(baseMaps);
        if (L.control && L.control.layers) {
            layersControl.addTo(map);
        } else {
            console.warn('Layers control not available');
        }
    
        const current = getUrlPosition();
        _this.floor = current.floor;
        map.setView(map.unproject([current.x, current.y], 0), current.zoom);
        _this.mapFloors[_this.floor].addTo(map);
    
        setUrlPosition.call(_this, {
            x: current.x,
            y: current.y,
            floor: current.floor,
            zoom: current.zoom
        }, true);
    
        map.on('baselayerchange', function(layer) {
            _this.floor = layer.layer.options.floor;
            const center = map.getCenter();
            const coords = L.CRS.CustomZoom.latLngToPoint(center, 0);
            setUrlPosition.call(_this, {
                x: Math.floor(Math.abs(coords.x)),
                y: Math.floor(Math.abs(coords.y)),
                floor: _this.floor,
                zoom: map.getZoom()
            }, true);
        });
    
        map.on('moveend', function() {
            const center = map.getCenter();
            const coords = L.CRS.CustomZoom.latLngToPoint(center, 0);
            setUrlPosition.call(_this, {
                x: Math.floor(Math.abs(coords.x)),
                y: Math.floor(Math.abs(coords.y)),
                floor: _this.floor,
                zoom: map.getZoom()
            }, false);
        });
    
        map.on('click', function(event) {
            const coords = L.CRS.CustomZoom.latLngToPoint(event.latlng, 0);
            const zoom = map.getZoom();
            const coordX = Math.floor(Math.abs(coords.x));
            const coordY = Math.floor(Math.abs(coords.y));
            setUrlPosition.call(_this, {
                x: coordX,
                y: coordY,
                floor: _this.floor,
                zoom: zoom
            }, true);
        });
    
        if (L.crosshairs) {
            this.crosshairs = L.crosshairs().addTo(map);
        } else {
            console.warn('Crosshairs not available');
        }
    
        if (L.control && L.control.coordinates) {
            L.control.coordinates({
                position: 'bottomleft',
                enableUserInput: false,
                labelFormatterLat: function(lat) {
                    return '<b>Y</b>: ' + Math.floor(-lat) + ' <b>Z</b>: ' + _this.floor;
                },
                labelFormatterLng: function(lng) {
                    return '<b>X</b>: ' + Math.floor(lng);
                }
            }).addTo(map);
        } else {
            console.warn('Coordinates control not available');
        }
    
        if (L.ExivaButton && L.exivaButton) {
            L.ExivaButton.btns = L.exivaButton({
                crosshairs: this.crosshairs
            }).addTo(map);
        } else {
            console.warn('Exiva button not available');
        }
    
        if (L.LevelButtons) {
            const levelButtons = new L.LevelButtons({ position: 'bottomright' }).addTo(map);
            levelButtons.setTibiaMap(this);
            levelButtons.options.layers_widget = layersControl;
        } else {
            console.warn('LevelButtons not available');
        }
    
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
            { name: "Rathleton", x: 33627, y: 31913, floor: 7 },
        ];
    
        const huntAreas = [
            { name: "GS Tomb", x: 33136, y: 32587, floor: 7 },
            { name: "Hydra (Passage)", x: 32978, y: 32636, floor: 7 },
            { name: "Lion's Rock", x: 33146, y: 32357, floor: 7 },
            { name: "Mahrdis", x: 33255, y: 32833, floor: 7 },
            { name: "Oasis Tomb", x: 33133, y: 32640, floor: 7 },
            { name: "Peninsula Tomb", x: 33027, y: 32869, floor: 7 },
            { name: "Rahemons", x: 33133, y: 32640, floor: 7 },
            { name: "Stone Tomb", x: 33282, y: 32743, floor: 7 },
            { name: "Terramite", x: 33041, y: 32692, floor: 7 },
            { name: "Vashresamun", x: 33208, y: 32591, floor: 7 },
            { name: "Mother of Scarab Lair", x: 33290, y: 32603, floor: 7 },
            { name: "Gold Token", x: 32128, y: 31369, floor: 7 },
            { name: "Cobra Bastion (-1)", x: 33393, y: 32666, floor: 7 },
        ];
    
        huntAreas.forEach(area => {
            const latLng = map.unproject([area.x, area.y], 0);
            L.marker(latLng)
                .addTo(map)
                .bindPopup(area.name);
        });
    
        cityAreas.forEach(area => {
            const latLng = map.unproject([area.x, area.y], 0);
            L.marker(latLng)
                .addTo(map)
                .bindPopup(area.name);
        });
    };
    
    const mapContainer = document.querySelector('#map');
    const tibiaMap = new TibiaMap();
    tibiaMap.init(mapContainer.dataset);
    window.tibiaMap = tibiaMap;

    document.addEventListener('keydown', function(event) {
        if (event.key === 'c') {
            const current = getUrlPosition();
            tibiaMap.map.panTo(tibiaMap.map.unproject([current.x, current.y], 0));
        }
        if (event.key === 'e') {
            tibiaMap.crosshairs._toggleExiva();
        }
    });
})();

