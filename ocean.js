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
        this.boatSizeMultiplier = 0.6; // Smaller boat size
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
        // Pixel art sailboat matching reference image
        const x = Math.floor(this.boatX / this.pixelSize);
        const y = Math.floor(this.boatY / this.pixelSize);
        const s = this.boatSizeMultiplier;

        // Gentle bobbing animation
        const bob = Math.sin(this.time * 2) * 0.5;
        const yOffset = Math.floor(bob);

        const p = (dx, dy, color) => {
            this.drawPixel(x + Math.round(dx * s), y + Math.round(dy * s) + yOffset, color);
        };

        // Colors from reference
        const BLACK = '#1a1a1a';
        const DKGRAY = '#555555';
        const MDGRAY = '#888888';
        const LTGRAY = '#bbbbbb';
        const VLGRAY = '#d0d0d0';
        const WHITE = '#ffffff';
        const SAIL_W = '#f0f0f0';
        const SAIL_L = '#e0e0e0';

        const RED = '#cc2222';
        const DKRED = '#991111';

        // === FLAG at top of mast ===
        const fw = Math.sin(this.time * 4) * 0.3;
        p(1, -22 + fw, RED);
        p(2, -22 + fw, RED);
        p(1, -21 + fw, DKRED);

        // === MAST - tall vertical black line (2 pixels wide with highlight) ===
        // Mast extends well above where sails attach, creating visible luff space
        for (let i = -21; i <= 1; i++) {
            p(0, i, BLACK);
        }
        // Mast highlight stripe
        for (let i = -20; i <= 0; i++) {
            p(-1, i, DKGRAY);
        }

        // === LEFT SAIL (jib) - narrow tall triangle to the left of mast ===
        // Widens ~1px every 2 rows for a slim profile
        // Row -15
        p(-2, -15, SAIL_L);

        // Row -14
        p(-2, -14, SAIL_W);

        // Row -13
        p(-2, -13, WHITE);
        p(-3, -13, SAIL_L);

        // Row -12
        p(-2, -12, WHITE);
        p(-3, -12, SAIL_W);

        // Row -11
        p(-2, -11, WHITE);
        p(-3, -11, SAIL_W);
        p(-4, -11, SAIL_L);

        // Row -10
        p(-2, -10, WHITE);
        p(-3, -10, WHITE);
        p(-4, -10, SAIL_W);

        // Row -9
        p(-2, -9, WHITE);
        p(-3, -9, WHITE);
        p(-4, -9, SAIL_W);
        p(-5, -9, SAIL_L);

        // Row -8
        p(-2, -8, WHITE);
        p(-3, -8, WHITE);
        p(-4, -8, SAIL_W);
        p(-5, -8, SAIL_L);

        // Row -7
        p(-2, -7, WHITE);
        p(-3, -7, WHITE);
        p(-4, -7, SAIL_W);
        p(-5, -7, SAIL_W);
        p(-6, -7, SAIL_L);

        // Row -6
        p(-2, -6, WHITE);
        p(-3, -6, WHITE);
        p(-4, -6, WHITE);
        p(-5, -6, SAIL_W);
        p(-6, -6, SAIL_L);

        // Row -5
        p(-2, -5, WHITE);
        p(-3, -5, WHITE);
        p(-4, -5, WHITE);
        p(-5, -5, SAIL_W);
        p(-6, -5, SAIL_W);
        p(-7, -5, SAIL_L);

        // Row -4
        p(-2, -4, WHITE);
        p(-3, -4, WHITE);
        p(-4, -4, WHITE);
        p(-5, -4, SAIL_W);
        p(-6, -4, SAIL_W);
        p(-7, -4, SAIL_L);

        // Row -3
        p(-2, -3, WHITE);
        p(-3, -3, WHITE);
        p(-4, -3, WHITE);
        p(-5, -3, SAIL_W);
        p(-6, -3, SAIL_W);
        p(-7, -3, SAIL_L);

        // Left sail diagonal outline (rigging line)
        p(-2, -15, BLACK);
        p(-2, -14, BLACK);
        p(-3, -13, BLACK);
        p(-3, -12, BLACK);
        p(-4, -11, BLACK);
        p(-4, -10, BLACK);
        p(-5, -9, BLACK);
        p(-5, -8, BLACK);
        p(-6, -7, BLACK);
        p(-6, -6, BLACK);
        p(-7, -5, BLACK);
        p(-7, -4, BLACK);
        p(-7, -3, BLACK);

        // Left rigging line from mast top to sail top
        p(-1, -17, BLACK);
        p(-1, -16, BLACK);
        p(-2, -15, BLACK);

        // === RIGHT SAIL (mainsail) - tall triangle to the right of mast ===
        // Row -16
        p(1, -16, SAIL_L);

        // Row -15
        p(1, -15, SAIL_W);
        p(2, -15, SAIL_L);

        // Row -14
        p(1, -14, WHITE);
        p(2, -14, SAIL_W);
        p(3, -14, SAIL_L);

        // Row -13
        p(1, -13, WHITE);
        p(2, -13, SAIL_W);
        p(3, -13, SAIL_W);

        // Row -12
        p(1, -12, WHITE);
        p(2, -12, WHITE);
        p(3, -12, SAIL_W);
        p(4, -12, SAIL_L);

        // Row -11
        p(1, -11, WHITE);
        p(2, -11, WHITE);
        p(3, -11, SAIL_W);
        p(4, -11, SAIL_W);

        // Row -10
        p(1, -10, WHITE);
        p(2, -10, WHITE);
        p(3, -10, WHITE);
        p(4, -10, SAIL_W);
        p(5, -10, SAIL_L);

        // Row -9
        p(1, -9, WHITE);
        p(2, -9, WHITE);
        p(3, -9, WHITE);
        p(4, -9, SAIL_W);
        p(5, -9, SAIL_L);

        // Row -8
        p(1, -8, WHITE);
        p(2, -8, WHITE);
        p(3, -8, WHITE);
        p(4, -8, SAIL_W);
        p(5, -8, SAIL_W);
        p(6, -8, SAIL_L);

        // Row -7
        p(1, -7, WHITE);
        p(2, -7, WHITE);
        p(3, -7, WHITE);
        p(4, -7, WHITE);
        p(5, -7, SAIL_W);
        p(6, -7, SAIL_W);

        // Row -6
        p(1, -6, WHITE);
        p(2, -6, WHITE);
        p(3, -6, WHITE);
        p(4, -6, WHITE);
        p(5, -6, SAIL_W);
        p(6, -6, SAIL_W);
        p(7, -6, SAIL_L);

        // Row -5
        p(1, -5, WHITE);
        p(2, -5, WHITE);
        p(3, -5, WHITE);
        p(4, -5, WHITE);
        p(5, -5, SAIL_W);
        p(6, -5, SAIL_W);
        p(7, -5, SAIL_L);

        // Row -4
        p(1, -4, WHITE);
        p(2, -4, WHITE);
        p(3, -4, WHITE);
        p(4, -4, WHITE);
        p(5, -4, WHITE);
        p(6, -4, SAIL_W);
        p(7, -4, SAIL_W);
        p(8, -4, SAIL_L);

        // Row -3
        p(1, -3, WHITE);
        p(2, -3, WHITE);
        p(3, -3, WHITE);
        p(4, -3, WHITE);
        p(5, -3, WHITE);
        p(6, -3, SAIL_W);
        p(7, -3, SAIL_W);
        p(8, -3, SAIL_L);

        // Right sail diagonal outline (rigging line)
        p(1, -16, BLACK);
        p(2, -15, BLACK);
        p(3, -14, BLACK);
        p(3, -13, BLACK);
        p(4, -12, BLACK);
        p(4, -11, BLACK);
        p(5, -10, BLACK);
        p(5, -9, BLACK);
        p(6, -8, BLACK);
        p(6, -7, BLACK);
        p(7, -6, BLACK);
        p(7, -5, BLACK);
        p(8, -4, BLACK);
        p(8, -3, BLACK);

        // Right rigging line from mast top to sail top
        p(1, -17, BLACK);
        p(1, -16, BLACK);

        // Bottom edge of sails (horizontal line)
        for (let i = -7; i <= 8; i++) {
            if (i === 0 || i === -1) continue; // skip mast
            p(i, -2, BLACK);
        }

        // === HULL (asymmetrical: left=bow/pointed, right=stern/flat, elongated) ===
        // Hull row 0 (top deck) - long and wide
        for (let i = -9; i <= 12; i++) {
            p(i, 0, VLGRAY);
        }
        p(-10, 0, LTGRAY);
        p(13, 0, LTGRAY);

        // Hull row 1 - body
        for (let i = -7; i <= 11; i++) {
            p(i, 1, LTGRAY);
        }
        p(-8, 1, MDGRAY);
        p(12, 1, MDGRAY);

        // Hull row 2 - lower body, bow narrows
        for (let i = -4; i <= 9; i++) {
            p(i, 2, MDGRAY);
        }
        p(-5, 2, DKGRAY);
        p(10, 2, DKGRAY);

        // Hull row 3 - keel, bow comes to point
        for (let i = -1; i <= 7; i++) {
            p(i, 3, DKGRAY);
        }
        p(-2, 3, DKGRAY);

        // Hull outline - bow (left, pointed)
        p(-11, 0, BLACK);
        p(-9, 1, BLACK);
        p(-6, 2, BLACK);
        p(-3, 3, BLACK);
        // Hull outline - stern (right, blunt)
        p(14, 0, BLACK);
        p(13, 1, BLACK);
        p(11, 2, BLACK);
        p(8, 3, BLACK);
        // Bottom keel outline
        for (let i = -2; i <= 7; i++) {
            p(i, 4, BLACK);
        }
        // Bow tip
        p(-3, 4, BLACK);

        // Mast over hull (redraw to be on top)
        p(0, -1, BLACK);
        p(0, 0, BLACK);
        p(0, 1, BLACK);
        p(-1, -1, DKGRAY);
        p(-1, 0, DKGRAY);
        p(-1, 1, DKGRAY);
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

            // Toggle content visibility with "sail the world" button
            const sailWorldBtn = document.getElementById('sail-world-button');
            if (sailWorldBtn) {
                let contentVisible = true;
                sailWorldBtn.addEventListener('click', () => {
                    contentVisible = !contentVisible;
                    const sections = document.querySelectorAll('section');
                    const nav = document.querySelector('nav');

                    if (contentVisible) {
                        sections.forEach(section => section.classList.remove('hidden-content'));
                        if (nav) nav.classList.remove('hidden-content');
                        sailWorldBtn.textContent = 'sail the world!';
                    } else {
                        sections.forEach(section => section.classList.add('hidden-content'));
                        if (nav) nav.classList.add('hidden-content');
                        sailWorldBtn.textContent = 'return to the world!';
                    }
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
