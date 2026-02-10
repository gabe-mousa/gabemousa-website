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
        this.animationSpeedMultiplier = 0.5; // Overall animation speed (default to 0.5x)
        this.waveSpeedMultiplier = 1;
        this.fishSpeedMultiplier = 1;
        this.dolphinSpeedMultiplier = 1;
        this.boatSizeMultiplier = 1;
        this.boatSpeedMultiplier = 1; // Speed at which boat follows cursor

        this.mouseX = 0;
        this.mouseY = 0;
        this.boatX = 0; // Actual boat position
        this.boatY = 0; // Actual boat position
        this.boatIsMoving = false; // Track if boat is currently moving
        this.boatAngle = 0; // Direction the boat is heading
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

        // Initialize mouse position and boat position to center
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.boatX = window.innerWidth / 2;
        this.boatY = window.innerHeight / 2;
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

        // Generate fish shadows (swimming near surface) - increased count
        const fishCount = Math.floor(40 + Math.random() * 50);
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

        // Generate dolphins/large fish - increased count
        const dolphinCount = Math.floor(5 + Math.random() * 10);
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

    getRandomFishColor() {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8AAE', '#C77DFF'];
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

        // Use animation speed to control pixel color variation (less variation = less blinking)
        const colorVariation = this.animationSpeedMultiplier;

        // Color palette based on depth (from shallow to deep)
        if (depth < 0.15) {
            // Very shallow - light turquoise (sandbars, shallows)
            const r = 85 + Math.floor(Math.random() * 25 * colorVariation);
            const g = 195 + Math.floor(Math.random() * 25 * colorVariation);
            const b = 220 + Math.floor(Math.random() * 20 * colorVariation);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.3) {
            // Shallow water - bright blue
            const r = 65 + Math.floor(Math.random() * 20 * colorVariation);
            const g = 170 + Math.floor(Math.random() * 25 * colorVariation);
            const b = 205 + Math.floor(Math.random() * 20 * colorVariation);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.5) {
            // Medium shallow - medium blue
            const r = 50 + Math.floor(Math.random() * 18 * colorVariation);
            const g = 145 + Math.floor(Math.random() * 20 * colorVariation);
            const b = 185 + Math.floor(Math.random() * 18 * colorVariation);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.65) {
            // Medium depth - darker blue
            const r = 38 + Math.floor(Math.random() * 15 * colorVariation);
            const g = 120 + Math.floor(Math.random() * 18 * colorVariation);
            const b = 165 + Math.floor(Math.random() * 15 * colorVariation);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (depth < 0.8) {
            // Deep water - navy blue
            const r = 28 + Math.floor(Math.random() * 12 * colorVariation);
            const g = 95 + Math.floor(Math.random() * 15 * colorVariation);
            const b = 145 + Math.floor(Math.random() * 12 * colorVariation);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Very deep - darkest navy
            const r = 18 + Math.floor(Math.random() * 10 * colorVariation);
            const g = 70 + Math.floor(Math.random() * 15 * colorVariation);
            const b = 120 + Math.floor(Math.random() * 15 * colorVariation);
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

    drawIsland(island) {
        const x = Math.floor(island.x);
        const y = Math.floor(island.y);

        // Draw island from top-down view
        for (let i = 0; i < island.shape.length; i++) {
            for (let j = 0; j < island.shape[i].length; j++) {
                if (island.shape[i][j]) {
                    // Beach/shore (light sand) - static color
                    const isEdge = this.isEdgePixel(island.shape, i, j);
                    if (isEdge) {
                        this.drawPixel(x + i, y + j, '#E8D4A2');
                    } else {
                        // Interior (green vegetation) - use seeded random for consistent color
                        // Create a unique but consistent seed based on position
                        if (!island.colorMap) {
                            island.colorMap = [];
                            for (let ci = 0; ci < island.shape.length; ci++) {
                                island.colorMap[ci] = [];
                                for (let cj = 0; cj < island.shape[ci].length; cj++) {
                                    const seedValue = (ci * 1000 + cj) / 1000;
                                    const green = 140 + Math.floor((Math.sin(seedValue * 12.9898) * 0.5 + 0.5) * 40);
                                    const r = 50 + (Math.sin(seedValue * 78.233) * 0.5 + 0.5) * 30;
                                    const b = 60 + (Math.sin(seedValue * 45.164) * 0.5 + 0.5) * 30;
                                    island.colorMap[ci][cj] = `rgb(${r}, ${green}, ${b})`;
                                }
                            }
                        }
                        this.drawPixel(x + i, y + j, island.colorMap[i][j]);
                    }
                }
            }
        }

        // Add palm trees on larger islands (cached on first draw)
        if (island.width > 10) {
            if (island.hasTree === undefined) {
                island.hasTree = Math.random() > 0.5;
            }
            if (island.hasTree) {
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
    }

    isEdgePixel(shape, i, j) {
        if (i === 0 || j === 0 || i === shape.length - 1 || j === shape[0].length - 1) {
            return shape[i][j];
        }
        return shape[i][j] && (!shape[i-1][j] || !shape[i+1][j] || !shape[i][j-1] || !shape[i][j+1]);
    }

    updateBoatPosition() {
        // Calculate distance to target (mouse position)
        const dx = this.mouseX - this.boatX;
        const dy = this.mouseY - this.boatY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move boat towards mouse if not already there
        const threshold = 5; // Stop when within 5 pixels of cursor
        if (distance > threshold) {
            const speed = 2 * this.boatSpeedMultiplier; // Base speed of 2 pixels per frame
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            this.boatX += moveX;
            this.boatY += moveY;
            this.boatIsMoving = true;

            // Update boat angle to direction of movement
            this.boatAngle = Math.atan2(dy, dx);
        } else {
            this.boatIsMoving = false;
        }
    }

    drawSailboat() {
        // Classic pixel art sailboat (8-bit style)
        const x = Math.floor(this.boatX / this.pixelSize);
        const y = Math.floor(this.boatY / this.pixelSize);
        const s = this.boatSizeMultiplier;

        // Gentle bobbing animation
        const bob = Math.sin(this.time * 2) * 0.5;
        const yOffset = Math.floor(bob);

        // === HULL (simple brown wooden boat) ===
        // Hull bottom - dark outline
        this.drawPixel(x - 5 * s, y + 3 * s + yOffset, '#4E342E');
        this.drawPixel(x - 4 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x - 3 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x - 2 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x - 1 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x + 1 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x + 2 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x + 3 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x + 4 * s, y + 4 * s + yOffset, '#4E342E');
        this.drawPixel(x + 5 * s, y + 3 * s + yOffset, '#4E342E');

        // Hull middle - brown wood
        this.drawPixel(x - 4 * s, y + 3 * s + yOffset, '#8D6E63');
        this.drawPixel(x - 3 * s, y + 3 * s + yOffset, '#A1887F');
        this.drawPixel(x - 2 * s, y + 3 * s + yOffset, '#A1887F');
        this.drawPixel(x - 1 * s, y + 3 * s + yOffset, '#BCAAA4');
        this.drawPixel(x, y + 3 * s + yOffset, '#BCAAA4');
        this.drawPixel(x + 1 * s, y + 3 * s + yOffset, '#BCAAA4');
        this.drawPixel(x + 2 * s, y + 3 * s + yOffset, '#A1887F');
        this.drawPixel(x + 3 * s, y + 3 * s + yOffset, '#A1887F');
        this.drawPixel(x + 4 * s, y + 3 * s + yOffset, '#8D6E63');

        // Deck
        this.drawPixel(x - 3 * s, y + 2 * s + yOffset, '#6D4C41');
        this.drawPixel(x - 2 * s, y + 2 * s + yOffset, '#795548');
        this.drawPixel(x - 1 * s, y + 2 * s + yOffset, '#795548');
        this.drawPixel(x, y + 2 * s + yOffset, '#795548');
        this.drawPixel(x + 1 * s, y + 2 * s + yOffset, '#795548');
        this.drawPixel(x + 2 * s, y + 2 * s + yOffset, '#795548');
        this.drawPixel(x + 3 * s, y + 2 * s + yOffset, '#6D4C41');

        // === MAST (simple brown wooden mast) ===
        this.drawPixel(x, y + 1 * s + yOffset, '#5D4037');
        this.drawPixel(x, y + yOffset, '#5D4037');
        this.drawPixel(x, y - 1 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 2 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 3 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 4 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 5 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 6 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 7 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 8 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 9 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 10 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 11 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 12 * s + yOffset, '#6D4C41');
        this.drawPixel(x, y - 13 * s + yOffset, '#6D4C41');

        // === MAINSAIL (large white triangular sail) ===
        // Row by row from top
        this.drawPixel(x, y - 13 * s + yOffset, '#FFFFFF');

        this.drawPixel(x, y - 12 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 12 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 11 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 11 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 11 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 10 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 10 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 10 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 10 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 9 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 9 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 9 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 9 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 9 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 8 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 8 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 8 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 8 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 8 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 5 * s, y - 8 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 5 * s, y - 7 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 6 * s, y - 7 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 5 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 6 * s, y - 6 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 7 * s, y - 6 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 5 * s, y - 5 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 6 * s, y - 5 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 4 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 4 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 4 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 4 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 4 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 5 * s, y - 4 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 3 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 3 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 3 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 3 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 4 * s, y - 3 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 2 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 2 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 2 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 3 * s, y - 2 * s + yOffset, '#F5F5F5');

        this.drawPixel(x, y - 1 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 1 * s, y - 1 * s + yOffset, '#FFFFFF');
        this.drawPixel(x + 2 * s, y - 1 * s + yOffset, '#F5F5F5');

        // === FLAG at top of mast ===
        const flagWave = Math.sin(this.time * 4) * 0.3;
        this.drawPixel(x + 1 * s, y - 14 * s + yOffset + flagWave, '#E53935');
        this.drawPixel(x + 2 * s, y - 14 * s + yOffset + flagWave, '#D32F2F');
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
            // Islands remain static (no animation)
        });
    }

    setupControls() {
        // Wait for DOM to be ready
        const initControls = () => {
            // Toggle panel open/close
            const toggleBtn = document.getElementById('controls-toggle');
            const controlsPanel = document.getElementById('ocean-controls');

            if (toggleBtn && controlsPanel) {
                toggleBtn.addEventListener('click', () => {
                    controlsPanel.classList.toggle('collapsed');
                });
            }

            // Animation speed control (affects frame rate)
            const animationSpeedSlider = document.getElementById('animation-speed');
            if (animationSpeedSlider) {
                animationSpeedSlider.addEventListener('input', (e) => {
                    this.animationSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.animationSpeedMultiplier.toFixed(1)}x`;
                });
            }

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

            // Boat speed control
            const boatSpeedSlider = document.getElementById('boat-speed');
            if (boatSpeedSlider) {
                boatSpeedSlider.addEventListener('input', (e) => {
                    this.boatSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.boatSpeedMultiplier.toFixed(1)}x`;
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
        this.time += 0.008 * this.waveSpeedMultiplier; // Slower base animation (was 0.016)

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
        this.updateBoatPosition();

        // Draw features in layers (bottom to top)
        // Islands first (on ocean floor/surface)
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
