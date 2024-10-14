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

    const cityAreas = [
        { name: "Ab'Dendriel", x: 32734, y: 31670, floor: 7 },
        { name: "Ankrahmun", x: 33090, y: 32886, floor: 7 },
        { name: "Carlin", x: 32388, y: 31822, floor: 7 },
        { name: "Darashia", x: 33290, y: 32482, floor: 7 },
        { name: "Edron", x: 33177, y: 31767, floor: 7 },
        { name: "Farmine", x: 32986, y: 31541, floor: 10 },
        { name: "Feyrist", x: 33545, y: 32222, floor: 7 },
        { name: "Gray Beach", x: 33455, y: 31347, floor: 7 },
        { name: "Issavi", x: 33902, y: 31464, floor: 7 },
        { name: "Kazordoon", x: 32629, y: 31925, floor: 7 },
        { name: "Kazordoon", x: 32826, y: 31762, floor: 7 },
        { name: "Krailos", x: 33500, y: 31709, floor: 7 },
        { name: "Liberty Bay", x: 32285, y: 32892, floor: 7 },
        { name: "Marapur", x: 33805, y: 32769, floor: 7 },
        { name: "Port Hope", x: 32531, y: 32785, floor: 7 },
        { name: "Rathleton", x: 33487, y: 31985, floor: 7 },
        { name: "Roshamuul", x: 33485, y: 32570, floor: 7 },
        { name: "Svargrond", x: 32340, y: 31109, floor: 7 },
        { name: "Thais", x: 32310, y: 32215, floor: 7 },
        { name: "Travora", x: 32057, y: 32369, floor: 7 },
        { name: "Venore", x: 32954, y: 32024, floor: 7 },
        { name: "Yalahar", x: 32817, y: 31273, floor: 7 },
    ];

    const huntAreas = [
        { name: "Gold Token", x: 32128, y: 31369, floor: 7 },
        { name: "Cobra Bastion", x: 33393, y: 32666, floor: 7 },
        { name: "Ankrahmun Gold Token", x: 32141, y: 31353, floor: 12 },
        { name: "Cobra Bastion", x: 33391, y: 32667, floor: 7 },
        { name: "(0 & +1 flask) Cobra Bastion", x: 33397, y: 32653, floor: 5 },
        { name: "(-1) Cobra Bastion", x: 33362, y: 32749, floor: 8 },
        { name: "Weretiger", x: 33012, y: 32919, floor: 8 },
        { name: "Fire Secret Library", x: 32639, y: 32676, floor: 12 },
        { name: "Ice Secret Library", x: 32480, y: 32578, floor: 14 },
        { name: "Energy Secret Library", x: 32474, y: 32772, floor: 12 },
        { name: "Earth Secret Library", x: 32608, y: 32540, floor: 12 },
        { name: "Skeleton Elite Warrior (Inside)", x: 32948, y: 32282, floor: 10 },
        { name: "Skeleton Elite Warrior (Outside)", x: 32982, y: 32310, floor: 8 },
        { name: "Nightmare Isles", x: 33478, y: 32613, floor: 9 },
        { name: "Ferumbra's Lair (Entrance)", x: 33320, y: 32330, floor: 13 },
        { name: "Ferumbra's Lair (South)", x: 33325, y: 32419, floor: 13 },
        { name: "Ferumbra's Plague Seal", x: 33292, y: 32322, floor: 14 },
        { name: "Ferumbra's DT Seal", x: 33288, y: 32353, floor: 14 },
        { name: "Ferumbra's Jugger Seal", x: 33356, y: 32366, floor: 14 },
        { name: "Ferumbra's Fury Seal", x: 33355, y: 32336, floor: 14 },
        { name: "Ferumbra's Undead Seal", x: 33325, y: 32400, floor: 14 },
        { name: "Ferumbra's Arc", x: 33324, y: 31467, floor: 14 },
        { name: "Ferumbra's Pumin", x: 33297, y: 32403, floor: 14 },
        { name: "Haunted Nexus (Darashia)", x: 33087, y: 32346, floor: 8 },
        { name: "Werehyena -1", x: 33207, y: 32362, floor: 10 },
        { name: "Werehyena -2", x: 33166, y: 32405, floor: 11 },
        { name: "Werelion -1", x: 33121, y: 32252, floor: 11 },
        { name: "Werelion -2", x: 33089, y: 32283, floor: 12 },
        { name: "Plagueseal -1", x: 33212, y: 31457, floor: 11 },
        { name: "Plagueseal -2", x: 33214, y: 31456, floor: 13 },
        { name: "Pumin -1", x: 33460, y: 32788, floor: 8 },
        { name: "Pumin -2", x: 33448, y: 32788, floor: 9 },
        { name: "Pumin -3", x: 33468, y: 32786, floor: 12 },
        { name: "Infernatil", x: 33639, y: 32642, floor: 14 },
        { name: "Infernatil +1", x: 33667, y: 32684, floor: 13 },
        { name: "Undead Seal -1", x: 33387, y: 32336, floor: 11 },
        { name: "Undead Seal -2", x: 33400, y: 32377, floor: 13 },
        { name: "Bazir Caminho", x: 33641, y: 32696, floor: 11 },
        { name: "Bazir Paredes", x: 33640, y: 32652, floor: 10 },
        { name: "DT Seal -1", x: 33432, y: 32703, floor: 13 },
        { name: "DT Seal -2", x: 33458, y: 32723, floor: 14 },
        { name: "Jugger Seal -1", x: 33410, y: 32448, floor: 13 },
        { name: "Jugger Seal -2", x: 33426, y: 32405, floor: 15 },
        { name: "Gloom Pillars", x: 33854, y: 31861, floor: 14 },
        { name: "Jaded Roots", x: 33867, y: 31704, floor: 14 },
        { name: "Putrefactory", x: 34108, y: 31692, floor: 14 },
        { name: "Darklight", x: 34027, y: 31871, floor: 14 },
        { name: "Falcon Bastion", x: 33369, y: 31346, floor: 7 },
        { name: "Falcon (Underground)", x: 33290, y: 31291, floor: 9 },
        { name: "Ancient Lion Knight", x: 32457, y: 32492, floor: 7 },
        { name: "Carnisylvan", x: 32561, y: 32466, floor: 13 },
        { name: "Gunther", x: 33842, y: 32012, floor: 9 },
        { name: "Quara -1", x: 33869, y: 32024, floor: 10 },
        { name: "Quara -2", x: 33865, y: 32013, floor: 11 },
        { name: "Inquisition (DT)", x: 33360, y: 31601, floor: 14 },
        { name: "Ingol (Surface)", x: 33720, y: 32587, floor: 7 },
        { name: "Ingol -1", x: 33764, y: 23568, floor: 8 },
        { name: "Zao Gold Token", x: 32180, y: 31357, floor: 12 },
        { name: "Lizard City", x: 33078, y: 31186, floor: 7 },
        { name: "Draken Walls (North)", x: 33032, y: 31109, floor: 6 },
        { name: "Draken Walls (South)", x: 33116, y: 31247, floor: 6 },
        { name: "Deathling (Port Hope)", x: 32881, y: 32456, floor: 8 },
        { name: "Banuta -1", x: 32879, y: 32630, floor: 11 },
        { name: "Carnivor -1", x: 32752, y: 32629, floor: 8 },
        { name: "Gazer Spectre", x: 32678, y: 32655, floor: 8 },
        { name: "Asura Palace", x: 32948, y: 32679, floor: 7 },
        { name: "Asura Mirror", x: 32814, y: 32751, floor: 9 },
        { name: "True Asura -1", x: 32884, y: 32784, floor: 10 },
        { name: "True Asura -2", x: 32842, y: 32801, floor: 11 },
        { name: "Flimsy -1 (Porthope)", x: 33578, y: 31421, floor: 8 },
        { name: "Flimsy -2 (Porthope)", x: 33497, y: 31436, floor: 9 },
        { name: "Fire Shrine", x: 33586, y: 32261, floor: 7 },
        { name: "Mini Roshamuul -1", x: 33582, y: 32284, floor: 8 },
        { name: "Mini Roshamuul -2", x: 33582, y: 32284, floor: 9 },
        { name: "Feyrist Faun Cave", x: 33554, y: 32211, floor: 8 },
        { name: "Summer Court", x: 33674, y: 32227, floor: 7 },
        { name: "Winter Court", x: 33698, y: 32125, floor: 7 },
        { name: "Dream Laberynth (Fire)", x: 32014, y: 31947, floor: 13 },
        { name: "Dream Laberynth (Ice)", x: 32066, y: 31949, floor: 13 }
    ];
    

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
        if (!L.CRS.CustomZoom) {
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
        }
    };

    TibiaMap.prototype.changeFloor = function(newFloor) {
        if (newFloor >= 0 && newFloor <= 15) {
            if (this.mapFloors[this.floor]) {
                this.map.removeLayer(this.mapFloors[this.floor]);
            }
            
            this.floor = newFloor;
            this.mapFloors[this.floor].addTo(this.map);

            const center = this.map.getCenter();
            const coords = L.CRS.CustomZoom.latLngToPoint(center, 0);
            setUrlPosition.call(this, {
                x: Math.floor(Math.abs(coords.x)),
                y: Math.floor(Math.abs(coords.y)),
                floor: this.floor,
                zoom: this.map.getZoom()
            }, true);
            
            this.map.fire('floorchange', { floor: this.floor });
        }
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
            if (event && event.latlng) {
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
            }
        });
    };

    TibiaMap.prototype.init = function(options) {
        if (this.map) {
            return;
        }
    
        const _this = this;
        _this.options = options;
        modifyLeaflet();
    
        const bounds = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };
        const maxBounds = L.latLngBounds(
            L.latLng(-bounds.yMax - 1, bounds.xMin),
            L.latLng(-bounds.yMin, bounds.xMax + 1)
        );
    
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            return;
        }
    
        const map = _this.map = L.map(mapElement, {
            crs: L.CRS.CustomZoom,
            center: [32768, 32768],
            zoom: 2,
            minZoom: 0,
            maxZoom: 4,
            maxBounds: maxBounds,
            attributionControl: false,
            zoomControl: false,
        });
    
        const baseMaps = {};
        for (let i = 0; i <= 15; i++) {
            const floorName = i <= 7 ? `Floor +${7 - i}` : `Floor -${i - 7}`;
            _this.mapFloors[i] = _this._createMapFloorLayer(i);
            baseMaps[floorName] = _this.mapFloors[i];
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
            if (event && event.latlng) {
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
    
                console.log('Clicked at:', event.latlng, 'Coords:', coordX, coordY);
            }
        });
    
        if (L.control && L.control.zoom) {
            L.control.zoom({ position: 'bottomright' }).addTo(map);
        }
    
        if (L.crosshairs) {
            this.crosshairs = L.crosshairs().addTo(map);
        } 
    
        if (L.ExivaButton && L.exivaButton) {
            L.ExivaButton.btns = L.exivaButton({
                crosshairs: this.crosshairs
            }).addTo(map);
        } 
    
        if (L.LevelButtons) {
            const levelButtons = new L.LevelButtons({ position: 'bottomright' }).addTo(this.map);
            levelButtons.setTibiaMap(this);
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
            }

            const coordinatesStyle = document.createElement('style');
            coordinatesStyle.textContent = `
                .leaflet-control-coordinates {
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }
                .leaflet-control-coordinates .uiElement {
                    margin-bottom: 5px;
                }
                .leaflet-control-coordinates .uiElement:last-child {
                    margin-bottom: 0;
                }
                .leaflet-control-coordinates b {
                    margin-right: 5px;
                }
            `;
            document.head.appendChild(coordinatesStyle);

        _this._showHoverTile();
    
        map.whenReady(function() {
            huntAreas.forEach(area => {
                const latLng = map.unproject([area.x, area.y], 0);
                
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style='background-color:rgba(0,0,0,0.6);color:white;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;'>${area.name}</div>`,
                    iconSize: [80, 80],
                    iconAnchor: [40, 40]
                });
    
                L.marker(latLng, {icon: icon})
                    .addTo(map);
            });
        });
    };
    const mapContainer = document.getElementById('map');
    const tibiaMap = new TibiaMap();
    tibiaMap.init(mapContainer.dataset);
    window.tibiaMap = tibiaMap;
    

    document.documentElement.addEventListener('keydown', function(event) {
        const _map = tibiaMap.map;
        if (event.key === 'c') {
            const current = getUrlPosition();
            _map.panTo(_map.unproject([current.x, current.y], 0));
        }

        if (event.key === 'e') {
            tibiaMap.crosshairs._toggleExiva();
        }
    });

    createCityButtons();

    const processExivaButton = document.getElementById('processExiva');
    if (processExivaButton) {
        processExivaButton.addEventListener('click', function() {
            const exivaText = document.getElementById('exiva').value;
            const direction = exivaText.match(/to the (\w+(-\w+)?)\./);
            
            if (direction) {
                const directionStr = direction[1].charAt(0).toUpperCase() + direction[1].slice(1);
                findHuntAreas(directionStr);
            } else {
                document.getElementById('results').value = "Direção não encontrada no exiva.";
            }
        });
    }
    
    function findHuntAreas(direction) {
        const map = tibiaMap.map;
        if (!map) {
            console.error('Mapa não está disponível');
            return;
        }
    
        const bounds = map.getBounds();
        const center = map.getCenter();
    
        if (!bounds || !center) {
            console.error('Limites ou centro do mapa inválidos');
            return;
        }
    
        console.log('Finding hunt areas in direction:', direction);
    
        const relevantAreas = huntAreas.filter(area => {
            const areaLatLng = map.unproject([area.x, area.y], 0);
            if (!areaLatLng) {
                console.error('Não foi possível desprojetar coordenadas para:', area);
                return false;
            }
            const areaDirection = determineDirection(areaLatLng);
            return areaDirection === direction;
        });
    
        const visibleAreas = relevantAreas.filter(area => {
            const areaLatLng = map.unproject([area.x, area.y], 0);
            return areaLatLng && bounds.contains(areaLatLng);
        });
    
        const invisibleAreas = relevantAreas.filter(area => {
            const areaLatLng = map.unproject([area.x, area.y], 0);
            return areaLatLng && !bounds.contains(areaLatLng);
        });
    
        let resultText = "";
        if (visibleAreas.length > 0) {
            resultText += "Áreas visíveis: " + visibleAreas.map(area => area.name).join(", ") + "\n\n";
        }
        if (invisibleAreas.length > 0) {
            resultText += "Áreas fora da visão: " + invisibleAreas.map(area => area.name).join(", ");
        }
    
        if (resultText === "") {
            resultText = "Nenhuma área de caça encontrada nessa direção.";
        }
    
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
            resultsElement.value = resultText;
        }
    }

    
    function determineDirection(clickPoint) {
        const map = tibiaMap.map;
        if (!map) {
            console.error('Mapa não está disponível');
            return null;
        }
    
        const center = map.getCenter();
        if (!center) {
            console.error('Centro do mapa inválido:', center);
            return null;
        }
    
        if (!clickPoint) {
            console.error('Ponto de clique inválido:', clickPoint);
            return null;
        }
    
        console.log('Center:', center);
        console.log('Click point:', clickPoint);
    
        const dx = clickPoint.lng - center.lng;
        const dy = clickPoint.lat - center.lat;
    
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
        if (angle > -22.5 && angle <= 22.5) return "East";
        if (angle > 22.5 && angle <= 67.5) return "North-east";
        if (angle > 67.5 && angle <= 112.5) return "North";
        if (angle > 112.5 && angle <= 157.5) return "North-west";
        if (angle > 157.5 || angle <= -157.5) return "West";
        if (angle > -157.5 && angle <= -112.5) return "South-west";
        if (angle > -112.5 && angle <= -67.5) return "South";
        if (angle > -67.5 && angle <= -22.5) return "South-east";
    
        return null;
    }
    

    function createCityButtons() {
        const cityButtonsContainer = document.getElementById('city-buttons');
        if (!cityButtonsContainer) {
            console.error('Container de botões de cidade não encontrado');
            return;
        }
    
        cityButtonsContainer.innerHTML = '';
    
        if (Array.isArray(cityAreas) && cityAreas.length > 0) {
            cityAreas.forEach(city => {
                const button = document.createElement('button');
                button.textContent = city.name;
                button.className = 'btn btn-sm btn-outline-light city-btn';
                button.onclick = function() {
                    console.log(`Movendo para ${city.name}: x=${city.x}, y=${city.y}, floor=${city.floor}`);
                    if (tibiaMap && tibiaMap.map) {
                        const latLng = tibiaMap.map.unproject([city.x, city.y], 0);
                        tibiaMap.map.setView(latLng, tibiaMap.map.getZoom());
                        tibiaMap.floor = city.floor;
                        tibiaMap.mapFloors[tibiaMap.floor].addTo(tibiaMap.map);
                        
                        if (tibiaMap.crosshairs && typeof tibiaMap.crosshairs._moveCrosshairs === 'function') {
                            tibiaMap.crosshairs._moveCrosshairs({ latlng: latLng });
                        } else {
                            console.warn('Crosshair não está disponível ou _moveCrosshairs não é uma função');
                        }
                    }
                };
                cityButtonsContainer.appendChild(button);
            });
        } 
    }
    
})();


