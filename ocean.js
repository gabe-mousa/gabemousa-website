// Top-Down Pixel Art Ocean Background (Bird's Eye View)
class PixelOcean {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.imageRendering = 'pixelated';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        // Animation control parameters
        this.pixelSize = 6; // Size of each "pixel" in the pixel art
        this.waveSpeedMultiplier = 1;
        this.fishSpeedMultiplier = 1;
        this.dolphinSpeedMultiplier = 1;
        this.boatSizeMultiplier = 1;

        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;

        this.resize();
        this.generateOcean();
        this.setupEventListeners();
        this.setupControls();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.ceil(this.canvas.width / this.pixelSize);
        this.rows = Math.ceil(this.canvas.height / this.pixelSize);
        this.oceanMap = null; // Clear ocean map on resize
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.generateOcean();
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Initialize mouse position to center
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
    }

    generateOcean() {
        // Generate a completely random ocean map (not pattern-based)
        this.generateOceanMap();

        // Generate random ocean features from top-down view
        this.features = [];

        // Generate islands (larger, more visible from top)
        const islandCount = Math.floor(3 + Math.random() * 5);
        for (let i = 0; i < islandCount; i++) {
            this.features.push({
                type: 'island',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                width: 8 + Math.floor(Math.random() * 15),
                height: 8 + Math.floor(Math.random() * 15),
                shape: this.generateIslandShape()
            });
        }

        // Generate fish shadows (swimming near surface)
        const fishCount = Math.floor(30 + Math.random() * 40);
        for (let i = 0; i < fishCount; i++) {
            this.features.push({
                type: 'fish',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                angle: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.8,
                size: 1 + Math.floor(Math.random() * 2),
                phase: Math.random() * Math.PI * 2,
                color: this.getRandomFishColor()
            });
        }

        // Generate coral reefs (visible through shallow water)
        const reefCount = Math.floor(8 + Math.random() * 12);
        for (let i = 0; i < reefCount; i++) {
            this.features.push({
                type: 'reef',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                width: 5 + Math.floor(Math.random() * 8),
                height: 5 + Math.floor(Math.random() * 8),
                color: this.getRandomReefColor(),
                pattern: this.generateReefPattern()
            });
        }

        // Generate rocks
        const rockCount = Math.floor(10 + Math.random() * 15);
        for (let i = 0; i < rockCount; i++) {
            this.features.push({
                type: 'rock',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                size: 1 + Math.floor(Math.random() * 3)
            });
        }

        // Generate seaweed patches (visible from top)
        const seaweedCount = Math.floor(12 + Math.random() * 20);
        for (let i = 0; i < seaweedCount; i++) {
            this.features.push({
                type: 'seaweed',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                size: 2 + Math.floor(Math.random() * 4),
                phase: Math.random() * Math.PI * 2
            });
        }

        // Generate dolphins/large fish
        const dolphinCount = Math.floor(3 + Math.random() * 6);
        for (let i = 0; i < dolphinCount; i++) {
            this.features.push({
                type: 'dolphin',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                angle: Math.random() * Math.PI * 2,
                speed: 0.6 + Math.random() * 0.9,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Generate kelp forests
        const kelpCount = Math.floor(5 + Math.random() * 8);
        for (let i = 0; i < kelpCount; i++) {
            this.features.push({
                type: 'kelp',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                width: 4 + Math.floor(Math.random() * 6),
                height: 4 + Math.floor(Math.random() * 6)
            });
        }
    }

    generateOceanMap() {
        // Generate a completely random, unique ocean depth map
        this.oceanMap = [];

        // Create random seed points for depth variation
        const depthSeeds = [];
        const numSeeds = 20 + Math.floor(Math.random() * 30);

        for (let i = 0; i < numSeeds; i++) {
            depthSeeds.push({
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                depth: Math.random(), // 0 = shallow, 1 = deep
                influence: 20 + Math.random() * 40
            });
        }

        // Generate ocean currents/flow patterns (random paths)
        const currents = [];
        const numCurrents = 5 + Math.floor(Math.random() * 10);

        for (let i = 0; i < numCurrents; i++) {
            const current = {
                points: [],
                strength: 0.3 + Math.random() * 0.5
            };

            let cx = Math.random() * this.cols;
            let cy = Math.random() * this.rows;
            const angle = Math.random() * Math.PI * 2;
            const numPoints = 10 + Math.floor(Math.random() * 20);

            for (let j = 0; j < numPoints; j++) {
                current.points.push({x: cx, y: cy});
                cx += Math.cos(angle + Math.sin(j * 0.3) * 0.8) * (5 + Math.random() * 10);
                cy += Math.sin(angle + Math.cos(j * 0.3) * 0.8) * (5 + Math.random() * 10);
            }

            currents.push(current);
        }

        // Build the depth map for each pixel
        for (let y = 0; y < this.rows; y++) {
            this.oceanMap[y] = [];
            for (let x = 0; x < this.cols; x++) {
                let depth = 0.5; // Base medium depth
                let totalInfluence = 0;

                // Calculate influence from depth seeds
                for (const seed of depthSeeds) {
                    const dist = Math.sqrt(Math.pow(x - seed.x, 2) + Math.pow(y - seed.y, 2));
                    const influence = Math.max(0, 1 - dist / seed.influence);
                    depth += (seed.depth - 0.5) * influence;
                    totalInfluence += influence;
                }

                // Add current influence
                for (const current of currents) {
                    let minDist = Infinity;
                    for (const point of current.points) {
                        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
                        minDist = Math.min(minDist, dist);
                    }
                    if (minDist < 15) {
                        depth += (0.5 - depth) * current.strength * (1 - minDist / 15);
                    }
                }

                // Add some fine grain noise
                depth += (Math.random() - 0.5) * 0.15;

                // Clamp depth
                depth = Math.max(0, Math.min(1, depth));

                this.oceanMap[y][x] = depth;
            }
        }
    }

    generateIslandShape() {
        const size = 5 + Math.floor(Math.random() * 8);
        const shape = [];
        for (let i = 0; i < size; i++) {
            shape[i] = [];
            for (let j = 0; j < size; j++) {
                const dist = Math.sqrt(Math.pow(i - size/2, 2) + Math.pow(j - size/2, 2));
                shape[i][j] = dist < size / 2 + Math.random() * 2 - 1;
            }
        }
        return shape;
    }

    generateReefPattern() {
        const size = 5;
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = Math.random() > 0.4;
            }
        }
        return pattern;
    }

    getRandomFishColor() {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8AAE', '#C77DFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomReefColor() {
        const colors = ['#FF6B9D', '#C77DFF', '#FFA07A', '#FF8AAE', '#E76F51'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getLocalWaveAnimation(x, y, time) {
        // Subtle wave animation on top of the static map
        const wave1 = Math.sin(x * 0.2 + time * 1.2) * 0.03;
        const wave2 = Math.cos(y * 0.18 + time * 0.9) * 0.03;
        const wave3 = Math.sin((x + y) * 0.12 + time * 0.6) * 0.02;
        return wave1 + wave2 + wave3;
    }

    getOceanColor(x, y, time) {
        // Use pre-generated ocean map for completely random appearance
        if (!this.oceanMap || y >= this.oceanMap.length || x >= this.oceanMap[0].length) {
            return 'rgb(40, 120, 160)'; // Fallback color
        }

        // Get base depth from the random map
        let depth = this.oceanMap[y][x];

        // Add subtle animated waves on top
        depth += this.getLocalWaveAnimation(x, y, time);

        // Clamp depth
        depth = Math.max(0, Math.min(1, depth));

        // Color palette based on depth (from shallow to deep)
        if (depth < 0.15) {
            // Very shallow - light turquoise (sandbars, shallows)
            const r = 85 + Math.floor(Math.random() * 25);
            const g = 195 + Math.floor(Math.random() * 25);
            const b = 220 + Math.floor(Math.random() * 20);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.3) {
            // Shallow water - bright blue
            const r = 65 + Math.floor(Math.random() * 20);
            const g = 170 + Math.floor(Math.random() * 25);
            const b = 205 + Math.floor(Math.random() * 20);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.5) {
            // Medium shallow - medium blue
            const r = 50 + Math.floor(Math.random() * 18);
            const g = 145 + Math.floor(Math.random() * 20);
            const b = 185 + Math.floor(Math.random() * 18);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.65) {
            // Medium depth - darker blue
            const r = 38 + Math.floor(Math.random() * 15);
            const g = 120 + Math.floor(Math.random() * 18);
            const b = 165 + Math.floor(Math.random() * 15);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.8) {
            // Deep water - navy blue
            const r = 28 + Math.floor(Math.random() * 12);
            const g = 95 + Math.floor(Math.random() * 15);
            const b = 145 + Math.floor(Math.random() * 12);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Very deep - darkest navy
            const r = 18 + Math.floor(Math.random() * 10);
            const g = 70 + Math.floor(Math.random() * 15);
            const b = 120 + Math.floor(Math.random() * 15);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            Math.floor(x * this.pixelSize),
            Math.floor(y * this.pixelSize),
            this.pixelSize,
            this.pixelSize
        );
    }

    drawFish(fish) {
        // Top-down view: fish as small oval shapes with direction
        const x = Math.floor(fish.x);
        const y = Math.floor(fish.y);

        const dx = Math.cos(fish.angle);
        const dy = Math.sin(fish.angle);

        // Fish body shadow
        const shadowColor = this.adjustBrightness(fish.color, -40);
        this.drawPixel(x, y, shadowColor);

        if (fish.size > 1) {
            this.drawPixel(x + Math.round(dx), y + Math.round(dy), shadowColor);
            this.drawPixel(x - Math.round(dx), y - Math.round(dy), this.adjustBrightness(fish.color, -50));
        }
    }

    drawDolphin(dolphin) {
        // Top-down view: larger marine animal
        const x = Math.floor(dolphin.x);
        const y = Math.floor(dolphin.y);

        const dx = Math.cos(dolphin.angle);
        const dy = Math.sin(dolphin.angle);

        // Dolphin body (larger shadow)
        this.drawPixel(x, y, 'rgba(50, 50, 80, 0.6)');
        this.drawPixel(x + Math.round(dx), y + Math.round(dy), 'rgba(50, 50, 80, 0.5)');
        this.drawPixel(x - Math.round(dx), y - Math.round(dy), 'rgba(50, 50, 80, 0.5)');
        this.drawPixel(x + Math.round(dy), y - Math.round(dx), 'rgba(50, 50, 80, 0.4)');
        this.drawPixel(x - Math.round(dy), y + Math.round(dx), 'rgba(50, 50, 80, 0.4)');
    }

    drawReef(reef) {
        const x = Math.floor(reef.x);
        const y = Math.floor(reef.y);

        // Draw coral reef from top-down (colorful patches)
        for (let i = 0; i < reef.width; i++) {
            for (let j = 0; j < reef.height; j++) {
                if (reef.pattern[Math.min(i, reef.pattern.length - 1)][Math.min(j, reef.pattern[0].length - 1)]) {
                    const brightness = Math.random() * 30 - 15;
                    const alpha = 0.5 + Math.random() * 0.3;
                    const color = this.adjustBrightness(reef.color, brightness);
                    this.drawPixel(x + i, y + j, color.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
                }
            }
        }
    }

    drawIsland(island) {
        const x = Math.floor(island.x);
        const y = Math.floor(island.y);

        // Draw island from top-down view
        for (let i = 0; i < island.shape.length; i++) {
            for (let j = 0; j < island.shape[i].length; j++) {
                if (island.shape[i][j]) {
                    // Beach/shore (light sand)
                    const isEdge = this.isEdgePixel(island.shape, i, j);
                    if (isEdge) {
                        this.drawPixel(x + i, y + j, '#E8D4A2');
                    } else {
                        // Interior (green vegetation)
                        const green = 140 + Math.floor(Math.random() * 40);
                        this.drawPixel(x + i, y + j, `rgb(${50 + Math.random() * 30}, ${green}, ${60 + Math.random() * 30})`);
                    }
                }
            }
        }

        // Add palm trees on larger islands
        if (island.width > 10 && Math.random() > 0.5) {
            const treeX = x + Math.floor(island.width / 2);
            const treeY = y + Math.floor(island.height / 2);
            // Palm tree from above (star pattern)
            this.drawPixel(treeX, treeY, '#2F5233');
            this.drawPixel(treeX - 1, treeY, '#3D6B40');
            this.drawPixel(treeX + 1, treeY, '#3D6B40');
            this.drawPixel(treeX, treeY - 1, '#3D6B40');
            this.drawPixel(treeX, treeY + 1, '#3D6B40');
        }
    }

    isEdgePixel(shape, i, j) {
        if (i === 0 || j === 0 || i === shape.length - 1 || j === shape[0].length - 1) {
            return shape[i][j];
        }
        return shape[i][j] && (!shape[i-1][j] || !shape[i+1][j] || !shape[i][j-1] || !shape[i][j+1]);
    }

    drawSeaweed(seaweed) {
        // Top-down view: seaweed patch
        const x = Math.floor(seaweed.x);
        const y = Math.floor(seaweed.y);
        const sway = Math.sin(this.time * 1.5 + seaweed.phase) * 0.5;

        for (let i = 0; i < seaweed.size; i++) {
            for (let j = 0; j < seaweed.size; j++) {
                if (Math.random() > 0.4) {
                    const green = 90 + Math.floor(Math.random() * 40);
                    const offset = Math.floor(sway * (i % 2 === 0 ? 1 : -1));
                    this.drawPixel(x + i + offset, y + j, `rgba(30, ${green}, 50, 0.6)`);
                }
            }
        }
    }

    drawRock(rock) {
        // Top-down view: rocks/stones
        const x = Math.floor(rock.x);
        const y = Math.floor(rock.y);

        for (let i = 0; i < rock.size; i++) {
            for (let j = 0; j < rock.size; j++) {
                if (i + j < rock.size + 1) {
                    const gray = 80 + Math.floor(Math.random() * 30);
                    this.drawPixel(x + i, y + j, `rgb(${gray}, ${gray}, ${gray + 10})`);
                }
            }
        }
    }

    drawKelp(kelp) {
        // Top-down view: kelp forest (darker green patches)
        const x = Math.floor(kelp.x);
        const y = Math.floor(kelp.y);

        for (let i = 0; i < kelp.width; i++) {
            for (let j = 0; j < kelp.height; j++) {
                if (Math.random() > 0.3) {
                    const green = 70 + Math.floor(Math.random() * 30);
                    this.drawPixel(x + i, y + j, `rgba(20, ${green}, 40, 0.5)`);
                }
            }
        }
    }

    drawSailboat() {
        // Top-down view of sailboat (with size multiplier)
        const x = Math.floor(this.mouseX / this.pixelSize);
        const y = Math.floor(this.mouseY / this.pixelSize);
        const size = this.boatSizeMultiplier;

        // Create wake/ripples behind the boat
        const wakeOffset = Math.sin(this.time * 3) * 0.5;
        this.drawPixel(x - 2 * size, y + 2 * size, 'rgba(150, 200, 220, 0.5)');
        this.drawPixel(x + 2 * size, y + 2 * size, 'rgba(150, 200, 220, 0.5)');
        this.drawPixel(x - 3 * size + wakeOffset, y + 3 * size, 'rgba(140, 190, 210, 0.3)');
        this.drawPixel(x + 3 * size + wakeOffset, y + 3 * size, 'rgba(140, 190, 210, 0.3)');

        // Boat hull from above (brown wooden boat shape)
        // Bow (front - pointed)
        this.drawPixel(x, y - 2 * size, '#8B4513');

        // Upper hull
        this.drawPixel(x - 1 * size, y - 1 * size, '#A0522D');
        this.drawPixel(x, y - 1 * size, '#A0522D');
        this.drawPixel(x + 1 * size, y - 1 * size, '#A0522D');

        // Mid hull (widest part)
        this.drawPixel(x - 2 * size, y, '#A0522D');
        this.drawPixel(x - 1 * size, y, '#8B6914');
        this.drawPixel(x, y, '#8B6914');
        this.drawPixel(x + 1 * size, y, '#8B6914');
        this.drawPixel(x + 2 * size, y, '#A0522D');

        // Lower hull
        this.drawPixel(x - 1 * size, y + 1 * size, '#A0522D');
        this.drawPixel(x, y + 1 * size, '#A0522D');
        this.drawPixel(x + 1 * size, y + 1 * size, '#A0522D');

        // Stern (back - flat)
        this.drawPixel(x - 1 * size, y + 2 * size, '#8B4513');
        this.drawPixel(x, y + 2 * size, '#8B4513');
        this.drawPixel(x + 1 * size, y + 2 * size, '#8B4513');

        // Sail from top (white triangular shape)
        const sailSway = Math.sin(this.time * 2) * 0.3;

        // Main sail (to the right side)
        this.drawPixel(x + 1 * size, y - 1 * size, '#FFFFFF');
        this.drawPixel(x + 2 * size, y - 1 * size, '#F5F5F5');
        this.drawPixel(x + 3 * size + sailSway, y - 1 * size, '#FFFFFF');
        this.drawPixel(x + 1 * size, y, '#F8F8F8');
        this.drawPixel(x + 2 * size, y, '#FFFFFF');
        this.drawPixel(x + 3 * size + sailSway, y, '#F5F5F5');
        this.drawPixel(x + 4 * size + sailSway, y, '#FFFFFF');
        this.drawPixel(x + 2 * size, y + 1 * size, '#F5F5F5');
        this.drawPixel(x + 3 * size + sailSway, y + 1 * size, '#FFFFFF');

        // Mast center line (dark)
        this.drawPixel(x, y, '#654321');
        this.drawPixel(x, y - 1 * size, '#654321');
    }

    adjustBrightness(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }

    updateFeatures() {
        this.features.forEach(feature => {
            if (feature.type === 'fish') {
                // Fish swim in their current direction (with speed multiplier)
                feature.x += Math.cos(feature.angle) * feature.speed * this.fishSpeedMultiplier;
                feature.y += Math.sin(feature.angle) * feature.speed * this.fishSpeedMultiplier;

                // Occasionally change direction
                if (Math.random() > 0.98) {
                    feature.angle += (Math.random() - 0.5) * 0.5;
                }

                // Wrap around screen
                if (feature.x < -5) feature.x = this.cols + 5;
                if (feature.x > this.cols + 5) feature.x = -5;
                if (feature.y < -5) feature.y = this.rows + 5;
                if (feature.y > this.rows + 5) feature.y = -5;
            } else if (feature.type === 'dolphin') {
                // Dolphins swim smoothly (with speed multiplier)
                feature.x += Math.cos(feature.angle) * feature.speed * this.dolphinSpeedMultiplier;
                feature.y += Math.sin(feature.angle) * feature.speed * this.dolphinSpeedMultiplier;

                // Smooth direction changes
                if (Math.random() > 0.97) {
                    feature.angle += (Math.random() - 0.5) * 0.3;
                }

                // Wrap around screen
                if (feature.x < -5) feature.x = this.cols + 5;
                if (feature.x > this.cols + 5) feature.x = -5;
                if (feature.y < -5) feature.y = this.rows + 5;
                if (feature.y > this.rows + 5) feature.y = -5;
            }
        });
    }

    setupControls() {
        // Wait for DOM to be ready
        const initControls = () => {
            // Wave speed control
            const waveSpeedSlider = document.getElementById('wave-speed');
            if (waveSpeedSlider) {
                waveSpeedSlider.addEventListener('input', (e) => {
                    this.waveSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.waveSpeedMultiplier.toFixed(1)}x`;
                });
            }

            // Fish speed control
            const fishSpeedSlider = document.getElementById('fish-speed');
            if (fishSpeedSlider) {
                fishSpeedSlider.addEventListener('input', (e) => {
                    this.fishSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.fishSpeedMultiplier.toFixed(1)}x`;
                });
            }

            // Dolphin speed control
            const dolphinSpeedSlider = document.getElementById('dolphin-speed');
            if (dolphinSpeedSlider) {
                dolphinSpeedSlider.addEventListener('input', (e) => {
                    this.dolphinSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.dolphinSpeedMultiplier.toFixed(1)}x`;
                });
            }

            // Boat size control
            const boatSizeSlider = document.getElementById('boat-size');
            if (boatSizeSlider) {
                boatSizeSlider.addEventListener('input', (e) => {
                    this.boatSizeMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.boatSizeMultiplier.toFixed(1)}x`;
                });
            }

            // Pixel size control
            const pixelSizeSlider = document.getElementById('pixel-size');
            if (pixelSizeSlider) {
                pixelSizeSlider.addEventListener('input', (e) => {
                    this.pixelSize = parseInt(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.pixelSize}px`;
                    this.resize();
                    this.generateOcean();
                });
            }

            // Regenerate ocean button
            const regenerateBtn = document.getElementById('regenerate-ocean');
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => {
                    this.generateOcean();
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initControls);
        } else {
            initControls();
        }
    }

    animate() {
        this.time += 0.016 * this.waveSpeedMultiplier; // Apply wave speed multiplier

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ocean with animated wave patterns (top-down view)
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const color = this.getOceanColor(x, y, this.time);
                this.drawPixel(x, y, color);
            }
        }

        // Update moving features
        this.updateFeatures();

        // Draw features in layers (bottom to top in water column)
        // Deep features first
        this.features.filter(f => f.type === 'kelp').forEach(f => this.drawKelp(f));
        this.features.filter(f => f.type === 'reef').forEach(f => this.drawReef(f));
        this.features.filter(f => f.type === 'rock').forEach(f => this.drawRock(f));
        this.features.filter(f => f.type === 'seaweed').forEach(f => this.drawSeaweed(f));

        // Islands (on surface)
        this.features.filter(f => f.type === 'island').forEach(f => this.drawIsland(f));

        // Swimming creatures
        this.features.filter(f => f.type === 'fish').forEach(f => this.drawFish(f));
        this.features.filter(f => f.type === 'dolphin').forEach(f => this.drawDolphin(f));

        // Sailboat on top of everything (on the surface)
        this.drawSailboat();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize ocean when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PixelOcean());
} else {
    new PixelOcean();
}
