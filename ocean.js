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
        this.pixelSize = 6;
        this.animationSpeedMultiplier = 0.5;
        this.waveSpeedMultiplier = 1;
        this.fishSpeedMultiplier = 1;
        this.dolphinSpeedMultiplier = 1;
        this.boatSizeMultiplier = 0.6;
        this.boatSpeedMultiplier = 1;

        this.mouseX = 0;
        this.mouseY = 0;
        this.boatX = 0;
        this.boatY = 0;
        this.boatIsMoving = false;
        this.boatAngle = 0;
        this.time = 0;
        this.lastTimestamp = 0;

        // Pause state
        this.isPaused = false;

        // Pre-sorted feature arrays
        this.islands = [];
        this.fish = [];
        this.dolphins = [];

        // ImageData buffer (allocated in resize)
        this.imageData = null;
        this.pixels = null;

        this.resize();
        this.generateOcean();
        this.setupEventListeners();
        this.setupControls();
        this.animate(0);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.ceil(this.canvas.width / this.pixelSize);
        this.rows = Math.ceil(this.canvas.height / this.pixelSize);
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        this.pixels = this.imageData.data;
        this.oceanMap = null;
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

        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.boatX = window.innerWidth / 2;
        this.boatY = window.innerHeight / 2;
    }

    generateOcean() {
        this.generateOceanMap();

        this.islands = [];
        this.fish = [];
        this.dolphins = [];

        const islandCount = 5 + Math.floor(Math.random() * 10);
        for (let i = 0; i < islandCount; i++) {
            this.islands.push({
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                width: 8 + Math.floor(Math.random() * 100),
                height: 8 + Math.floor(Math.random() * 100),
                shape: this.generateIslandShape()
            });
        }

        const fishCount = 40 + Math.floor(Math.random() * 50);
        for (let i = 0; i < fishCount; i++) {
            this.fish.push({
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                angle: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.8,
                size: 1 + Math.floor(Math.random() * 2),
                phase: Math.random() * Math.PI * 2,
                color: this.getRandomFishColorRGB()
            });
        }

        const dolphinCount = 5 + Math.floor(Math.random() * 10);
        for (let i = 0; i < dolphinCount; i++) {
            this.dolphins.push({
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                angle: Math.random() * Math.PI * 2,
                speed: 0.6 + Math.random() * 0.9,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    generateOceanMap() {
        this.oceanMap = [];

        const depthSeeds = [];
        const numSeeds = 20 + Math.floor(Math.random() * 30);

        for (let i = 0; i < numSeeds; i++) {
            depthSeeds.push({
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                depth: Math.random(),
                influence: 20 + Math.random() * 40
            });
        }

        const currents = [];
        const numCurrents = 5 + Math.floor(Math.random() * 10);

        for (let i = 0; i < numCurrents; i++) {
            const current = { points: [], strength: 0.3 + Math.random() * 0.5 };
            let cx = Math.random() * this.cols;
            let cy = Math.random() * this.rows;
            const angle = Math.random() * Math.PI * 2;
            const numPoints = 10 + Math.floor(Math.random() * 20);

            for (let j = 0; j < numPoints; j++) {
                current.points.push({ x: cx, y: cy });
                cx += Math.cos(angle + Math.sin(j * 0.3) * 0.8) * (5 + Math.random() * 10);
                cy += Math.sin(angle + Math.cos(j * 0.3) * 0.8) * (5 + Math.random() * 10);
            }
            currents.push(current);
        }

        for (let y = 0; y < this.rows; y++) {
            this.oceanMap[y] = new Float32Array(this.cols);
            for (let x = 0; x < this.cols; x++) {
                let depth = 0.5;

                for (const seed of depthSeeds) {
                    const dx = x - seed.x;
                    const dy = y - seed.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const influence = Math.max(0, 1 - dist / seed.influence);
                    depth += (seed.depth - 0.5) * influence;
                }

                for (const current of currents) {
                    let minDist = Infinity;
                    for (const point of current.points) {
                        const dx = x - point.x;
                        const dy = y - point.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) minDist = dist;
                    }
                    if (minDist < 15) {
                        depth += (0.5 - depth) * current.strength * (1 - minDist / 15);
                    }
                }

                depth += (Math.random() - 0.5) * 0.15;
                if (depth < 0) depth = 0;
                if (depth > 1) depth = 1;
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
                const di = i - size / 2;
                const dj = j - size / 2;
                const dist = Math.sqrt(di * di + dj * dj);
                shape[i][j] = dist < size / 2 + Math.random() * 2 - 1;
            }
        }
        return shape;
    }

    getRandomFishColorRGB() {
        const colors = [
            [255, 107, 107], [255, 217, 61], [107, 203, 119],
            [77, 150, 255], [255, 138, 174], [199, 125, 255]
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Write a filled pixel-art block directly into the ImageData buffer
    setPixel(x, y, r, g, b, a) {
        const ps = this.pixelSize;
        const px = Math.floor(x * ps);
        const py = Math.floor(y * ps);
        const w = this.canvas.width;
        const h = this.canvas.height;
        const data = this.pixels;

        const xEnd = px + ps > w ? w : px + ps;
        const yEnd = py + ps > h ? h : py + ps;

        if (px >= w || py >= h || px + ps <= 0 || py + ps <= 0) return;

        const xStart = px < 0 ? 0 : px;
        const yStart = py < 0 ? 0 : py;

        if (a === 255) {
            for (let sy = yStart; sy < yEnd; sy++) {
                let idx = (sy * w + xStart) * 4;
                for (let sx = xStart; sx < xEnd; sx++) {
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                    idx += 4;
                }
            }
        } else {
            // Alpha blending for semi-transparent pixels
            const aFrac = a / 255;
            const invA = 1 - aFrac;
            for (let sy = yStart; sy < yEnd; sy++) {
                let idx = (sy * w + xStart) * 4;
                for (let sx = xStart; sx < xEnd; sx++) {
                    data[idx] = (r * aFrac + data[idx] * invA) | 0;
                    data[idx + 1] = (g * aFrac + data[idx + 1] * invA) | 0;
                    data[idx + 2] = (b * aFrac + data[idx + 2] * invA) | 0;
                    data[idx + 3] = 255;
                    idx += 4;
                }
            }
        }
    }

    drawOcean() {
        const time = this.time;
        const rows = this.rows;
        const cols = this.cols;
        const ps = this.pixelSize;
        const w = this.canvas.width;
        const data = this.pixels;
        const colorVariation = Math.max(0.1, this.animationSpeedMultiplier * 0.5);

        for (let y = 0; y < rows; y++) {
            const mapRow = this.oceanMap[y];
            if (!mapRow) continue;

            for (let x = 0; x < cols; x++) {
                // Inline wave animation
                let depth = mapRow[x]
                    + Math.sin(x * 0.2 + time * 1.2) * 0.03
                    + Math.cos(y * 0.18 + time * 0.9) * 0.03
                    + Math.sin((x + y) * 0.12 + time * 0.6) * 0.02;

                if (depth < 0) depth = 0;
                if (depth > 1) depth = 1;

                // Seeded random for consistent color variation per pixel
                const seed = (x * 73856093) ^ (y * 19349663) ^ (Math.floor(time / 10) * 83492791);
                const random = (Math.sin(seed) + 1) * 0.5;

                let r, g, b;
                if (depth < 0.15) {
                    r = 85 + (random * 25 * colorVariation) | 0;
                    g = 195 + (random * 25 * colorVariation) | 0;
                    b = 220 + (random * 20 * colorVariation) | 0;
                } else if (depth < 0.3) {
                    r = 65 + (random * 20 * colorVariation) | 0;
                    g = 170 + (random * 25 * colorVariation) | 0;
                    b = 205 + (random * 20 * colorVariation) | 0;
                } else if (depth < 0.5) {
                    r = 50 + (random * 18 * colorVariation) | 0;
                    g = 145 + (random * 20 * colorVariation) | 0;
                    b = 185 + (random * 18 * colorVariation) | 0;
                } else if (depth < 0.65) {
                    r = 38 + (random * 15 * colorVariation) | 0;
                    g = 120 + (random * 18 * colorVariation) | 0;
                    b = 165 + (random * 15 * colorVariation) | 0;
                } else if (depth < 0.8) {
                    r = 28 + (random * 12 * colorVariation) | 0;
                    g = 95 + (random * 15 * colorVariation) | 0;
                    b = 145 + (random * 12 * colorVariation) | 0;
                } else {
                    r = 18 + (random * 10 * colorVariation) | 0;
                    g = 70 + (random * 15 * colorVariation) | 0;
                    b = 120 + (random * 15 * colorVariation) | 0;
                }

                // Write directly to ImageData buffer — fill the pixel block
                const px = x * ps;
                const py = y * ps;
                const xEnd = px + ps > w ? w : px + ps;
                const yEnd = py + ps;

                for (let sy = py; sy < yEnd; sy++) {
                    let idx = (sy * w + px) * 4;
                    for (let sx = px; sx < xEnd; sx++) {
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = 255;
                        idx += 4;
                    }
                }
            }
        }
    }

    drawFishAll() {
        for (const f of this.fish) {
            const x = Math.floor(f.x);
            const y = Math.floor(f.y);
            const dx = Math.cos(f.angle);
            const dy = Math.sin(f.angle);

            const sr = Math.max(0, f.color[0] - 40);
            const sg = Math.max(0, f.color[1] - 40);
            const sb = Math.max(0, f.color[2] - 40);

            this.setPixel(x, y, sr, sg, sb, 255);

            if (f.size > 1) {
                this.setPixel(x + Math.round(dx), y + Math.round(dy), sr, sg, sb, 255);
                const tr = Math.max(0, f.color[0] - 50);
                const tg = Math.max(0, f.color[1] - 50);
                const tb = Math.max(0, f.color[2] - 50);
                this.setPixel(x - Math.round(dx), y - Math.round(dy), tr, tg, tb, 255);
            }
        }
    }

    drawDolphinAll() {
        for (const d of this.dolphins) {
            const x = Math.floor(d.x);
            const y = Math.floor(d.y);
            const dx = Math.cos(d.angle);
            const dy = Math.sin(d.angle);
            const rdx = Math.round(dx);
            const rdy = Math.round(dy);

            this.setPixel(x, y, 50, 50, 80, 153);
            this.setPixel(x + rdx, y + rdy, 50, 50, 80, 128);
            this.setPixel(x - rdx, y - rdy, 50, 50, 80, 128);
            this.setPixel(x + Math.round(dy), y - Math.round(dx), 50, 50, 80, 102);
            this.setPixel(x - Math.round(dy), y + Math.round(dx), 50, 50, 80, 102);
        }
    }

    isEdgePixel(shape, i, j) {
        if (i === 0 || j === 0 || i === shape.length - 1 || j === shape[0].length - 1) {
            return shape[i][j];
        }
        return shape[i][j] && (!shape[i - 1][j] || !shape[i + 1][j] || !shape[i][j - 1] || !shape[i][j + 1]);
    }

    drawIslandAll() {
        for (const island of this.islands) {
            const x = Math.floor(island.x);
            const y = Math.floor(island.y);

            // Pre-compute color map on first draw
            if (!island.colorMap) {
                island.colorMap = [];
                for (let ci = 0; ci < island.shape.length; ci++) {
                    island.colorMap[ci] = [];
                    for (let cj = 0; cj < island.shape[ci].length; cj++) {
                        const seedValue = (ci * 1000 + cj) / 1000;
                        const green = 140 + Math.floor((Math.sin(seedValue * 12.9898) * 0.5 + 0.5) * 40);
                        const r = 50 + ((Math.sin(seedValue * 78.233) * 0.5 + 0.5) * 30) | 0;
                        const b = 60 + ((Math.sin(seedValue * 45.164) * 0.5 + 0.5) * 30) | 0;
                        island.colorMap[ci][cj] = [r, green, b];
                    }
                }
            }

            for (let i = 0; i < island.shape.length; i++) {
                for (let j = 0; j < island.shape[i].length; j++) {
                    if (island.shape[i][j]) {
                        if (this.isEdgePixel(island.shape, i, j)) {
                            this.setPixel(x + i, y + j, 232, 212, 162, 255);
                        } else {
                            const c = island.colorMap[i][j];
                            this.setPixel(x + i, y + j, c[0], c[1], c[2], 255);
                        }
                    }
                }
            }

            if (island.width > 10) {
                if (island.hasTree === undefined) {
                    island.hasTree = Math.random() > 0.5;
                }
                if (island.hasTree) {
                    const treeX = x + Math.floor(island.width / 2);
                    const treeY = y + Math.floor(island.height / 2);
                    this.setPixel(treeX, treeY, 47, 82, 51, 255);
                    this.setPixel(treeX - 1, treeY, 61, 107, 64, 255);
                    this.setPixel(treeX + 1, treeY, 61, 107, 64, 255);
                    this.setPixel(treeX, treeY - 1, 61, 107, 64, 255);
                    this.setPixel(treeX, treeY + 1, 61, 107, 64, 255);
                }
            }
        }
    }

    updateBoatPosition(dt) {
        const dx = this.mouseX - this.boatX;
        const dy = this.mouseY - this.boatY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const threshold = 5;
        if (distance > threshold) {
            // 120 pixels/sec base speed, scaled by dt
            const speed = 120 * this.boatSpeedMultiplier * dt;
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            this.boatX += moveX;
            this.boatY += moveY;
            this.boatIsMoving = true;
            this.boatAngle = Math.atan2(dy, dx);
        } else {
            this.boatIsMoving = false;
        }
    }

    // Helper to parse a hex color to [r, g, b]
    hexToRGB(hex) {
        const num = parseInt(hex.slice(1), 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    drawSailboat() {
        const x = Math.floor(this.boatX / this.pixelSize);
        const y = Math.floor(this.boatY / this.pixelSize);
        const s = this.boatSizeMultiplier;

        const bob = Math.sin(this.time * 2) * 0.5;
        const yOffset = Math.floor(bob);

        const p = (dx, dy, rgb) => {
            this.setPixel(x + Math.round(dx * s), y + Math.round(dy * s) + yOffset, rgb[0], rgb[1], rgb[2], 255);
        };

        const BLACK = [26, 26, 26];
        const DKGRAY = [85, 85, 85];
        const MDGRAY = [136, 136, 136];
        const LTGRAY = [187, 187, 187];
        const VLGRAY = [208, 208, 208];
        const WHITE = [255, 255, 255];
        const SAIL_W = [240, 240, 240];
        const SAIL_L = [224, 224, 224];
        const RED = [204, 34, 34];
        const DKRED = [153, 17, 17];

        // Flag
        const fw = Math.sin(this.time * 4) * 0.3;
        p(1, -22 + fw, RED);
        p(2, -22 + fw, RED);
        p(1, -21 + fw, DKRED);

        // Mast
        for (let i = -21; i <= 1; i++) p(0, i, BLACK);
        for (let i = -20; i <= 0; i++) p(-1, i, DKGRAY);

        // Left sail (jib)
        p(-2, -15, SAIL_L);
        p(-2, -14, SAIL_W);
        p(-2, -13, WHITE); p(-3, -13, SAIL_L);
        p(-2, -12, WHITE); p(-3, -12, SAIL_W);
        p(-2, -11, WHITE); p(-3, -11, SAIL_W); p(-4, -11, SAIL_L);
        p(-2, -10, WHITE); p(-3, -10, WHITE); p(-4, -10, SAIL_W);
        p(-2, -9, WHITE); p(-3, -9, WHITE); p(-4, -9, SAIL_W); p(-5, -9, SAIL_L);
        p(-2, -8, WHITE); p(-3, -8, WHITE); p(-4, -8, SAIL_W); p(-5, -8, SAIL_L);
        p(-2, -7, WHITE); p(-3, -7, WHITE); p(-4, -7, SAIL_W); p(-5, -7, SAIL_W); p(-6, -7, SAIL_L);
        p(-2, -6, WHITE); p(-3, -6, WHITE); p(-4, -6, WHITE); p(-5, -6, SAIL_W); p(-6, -6, SAIL_L);
        p(-2, -5, WHITE); p(-3, -5, WHITE); p(-4, -5, WHITE); p(-5, -5, SAIL_W); p(-6, -5, SAIL_W); p(-7, -5, SAIL_L);
        p(-2, -4, WHITE); p(-3, -4, WHITE); p(-4, -4, WHITE); p(-5, -4, SAIL_W); p(-6, -4, SAIL_W); p(-7, -4, SAIL_L);
        p(-2, -3, WHITE); p(-3, -3, WHITE); p(-4, -3, WHITE); p(-5, -3, SAIL_W); p(-6, -3, SAIL_W); p(-7, -3, SAIL_L);

        // Left sail outline
        p(-2, -15, BLACK); p(-2, -14, BLACK);
        p(-3, -13, BLACK); p(-3, -12, BLACK);
        p(-4, -11, BLACK); p(-4, -10, BLACK);
        p(-5, -9, BLACK); p(-5, -8, BLACK);
        p(-6, -7, BLACK); p(-6, -6, BLACK);
        p(-7, -5, BLACK); p(-7, -4, BLACK); p(-7, -3, BLACK);

        // Left rigging
        p(-1, -17, BLACK); p(-1, -16, BLACK); p(-2, -15, BLACK);

        // Right sail (mainsail)
        p(1, -16, SAIL_L);
        p(1, -15, SAIL_W); p(2, -15, SAIL_L);
        p(1, -14, WHITE); p(2, -14, SAIL_W); p(3, -14, SAIL_L);
        p(1, -13, WHITE); p(2, -13, SAIL_W); p(3, -13, SAIL_W);
        p(1, -12, WHITE); p(2, -12, WHITE); p(3, -12, SAIL_W); p(4, -12, SAIL_L);
        p(1, -11, WHITE); p(2, -11, WHITE); p(3, -11, SAIL_W); p(4, -11, SAIL_W);
        p(1, -10, WHITE); p(2, -10, WHITE); p(3, -10, WHITE); p(4, -10, SAIL_W); p(5, -10, SAIL_L);
        p(1, -9, WHITE); p(2, -9, WHITE); p(3, -9, WHITE); p(4, -9, SAIL_W); p(5, -9, SAIL_L);
        p(1, -8, WHITE); p(2, -8, WHITE); p(3, -8, WHITE); p(4, -8, SAIL_W); p(5, -8, SAIL_W); p(6, -8, SAIL_L);
        p(1, -7, WHITE); p(2, -7, WHITE); p(3, -7, WHITE); p(4, -7, WHITE); p(5, -7, SAIL_W); p(6, -7, SAIL_W);
        p(1, -6, WHITE); p(2, -6, WHITE); p(3, -6, WHITE); p(4, -6, WHITE); p(5, -6, SAIL_W); p(6, -6, SAIL_W); p(7, -6, SAIL_L);
        p(1, -5, WHITE); p(2, -5, WHITE); p(3, -5, WHITE); p(4, -5, WHITE); p(5, -5, SAIL_W); p(6, -5, SAIL_W); p(7, -5, SAIL_L);
        p(1, -4, WHITE); p(2, -4, WHITE); p(3, -4, WHITE); p(4, -4, WHITE); p(5, -4, WHITE); p(6, -4, SAIL_W); p(7, -4, SAIL_W); p(8, -4, SAIL_L);
        p(1, -3, WHITE); p(2, -3, WHITE); p(3, -3, WHITE); p(4, -3, WHITE); p(5, -3, WHITE); p(6, -3, SAIL_W); p(7, -3, SAIL_W); p(8, -3, SAIL_L);

        // Right sail outline
        p(1, -16, BLACK); p(2, -15, BLACK);
        p(3, -14, BLACK); p(3, -13, BLACK);
        p(4, -12, BLACK); p(4, -11, BLACK);
        p(5, -10, BLACK); p(5, -9, BLACK);
        p(6, -8, BLACK); p(6, -7, BLACK);
        p(7, -6, BLACK); p(7, -5, BLACK);
        p(8, -4, BLACK); p(8, -3, BLACK);

        // Right rigging
        p(1, -17, BLACK); p(1, -16, BLACK);

        // Bottom edge of sails
        for (let i = -7; i <= 8; i++) {
            if (i === 0 || i === -1) continue;
            p(i, -2, BLACK);
        }

        // Hull
        for (let i = -9; i <= 12; i++) p(i, 0, VLGRAY);
        p(-10, 0, LTGRAY); p(13, 0, LTGRAY);

        for (let i = -7; i <= 11; i++) p(i, 1, LTGRAY);
        p(-8, 1, MDGRAY); p(12, 1, MDGRAY);

        for (let i = -4; i <= 9; i++) p(i, 2, MDGRAY);
        p(-5, 2, DKGRAY); p(10, 2, DKGRAY);

        for (let i = -1; i <= 7; i++) p(i, 3, DKGRAY);
        p(-2, 3, DKGRAY);

        // Hull outline
        p(-11, 0, BLACK); p(-9, 1, BLACK); p(-6, 2, BLACK); p(-3, 3, BLACK);
        p(14, 0, BLACK); p(13, 1, BLACK); p(11, 2, BLACK); p(8, 3, BLACK);
        for (let i = -2; i <= 7; i++) p(i, 4, BLACK);
        p(-3, 4, BLACK);

        // Mast over hull
        p(0, -1, BLACK); p(0, 0, BLACK); p(0, 1, BLACK);
        p(-1, -1, DKGRAY); p(-1, 0, DKGRAY); p(-1, 1, DKGRAY);
    }

    updateFeatures(dt) {
        // Scale factor: original code assumed ~60fps, so 1 "tick" ≈ 16.67ms
        const scale = dt * 60;

        for (const f of this.fish) {
            f.x += Math.cos(f.angle) * f.speed * this.fishSpeedMultiplier * scale;
            f.y += Math.sin(f.angle) * f.speed * this.fishSpeedMultiplier * scale;

            if (Math.random() > 0.98) {
                f.angle += (Math.random() - 0.5) * 0.5;
            }

            if (f.x < -5) f.x = this.cols + 5;
            if (f.x > this.cols + 5) f.x = -5;
            if (f.y < -5) f.y = this.rows + 5;
            if (f.y > this.rows + 5) f.y = -5;
        }

        for (const d of this.dolphins) {
            d.x += Math.cos(d.angle) * d.speed * this.dolphinSpeedMultiplier * scale;
            d.y += Math.sin(d.angle) * d.speed * this.dolphinSpeedMultiplier * scale;

            if (Math.random() > 0.97) {
                d.angle += (Math.random() - 0.5) * 0.3;
            }

            if (d.x < -5) d.x = this.cols + 5;
            if (d.x > this.cols + 5) d.x = -5;
            if (d.y < -5) d.y = this.rows + 5;
            if (d.y > this.rows + 5) d.y = -5;
        }
    }

    setupControls() {
        const initControls = () => {
            const toggleBtn = document.getElementById('controls-toggle');
            const controlsPanel = document.getElementById('ocean-controls');

            if (toggleBtn && controlsPanel) {
                toggleBtn.addEventListener('click', () => {
                    controlsPanel.classList.toggle('collapsed');
                });
            }

            const sailWorldBtn = document.getElementById('sail-world-button');
            const oceanControls = document.getElementById('ocean-controls');
            const pauseBtn = document.getElementById('pause-animation-button');
            const floatingButtons = document.getElementById('floating-buttons');
            if (sailWorldBtn) {
                let contentVisible = true;
                sailWorldBtn.addEventListener('click', () => {
                    contentVisible = !contentVisible;
                    const sections = document.querySelectorAll('section');
                    const nav = document.querySelector('nav');

                    if (contentVisible) {
                        sections.forEach(section => section.classList.remove('hidden-content'));
                        if (nav) nav.classList.remove('hidden-content');
                        if (floatingButtons) floatingButtons.classList.remove('sail-mode');
                        if (oceanControls) oceanControls.classList.remove('sail-mode');
                        sailWorldBtn.textContent = 'sail the world!';
                    } else {
                        sections.forEach(section => section.classList.add('hidden-content'));
                        if (nav) nav.classList.add('hidden-content');
                        if (floatingButtons) floatingButtons.classList.add('sail-mode');
                        if (oceanControls) oceanControls.classList.add('sail-mode');
                        sailWorldBtn.textContent = 'return to the world!';
                    }
                });
            }

            const animationSpeedSlider = document.getElementById('animation-speed');
            if (animationSpeedSlider) {
                animationSpeedSlider.addEventListener('input', (e) => {
                    this.animationSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.animationSpeedMultiplier.toFixed(1)}x`;
                });
            }

            const waveSpeedSlider = document.getElementById('wave-speed');
            if (waveSpeedSlider) {
                waveSpeedSlider.addEventListener('input', (e) => {
                    this.waveSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.waveSpeedMultiplier.toFixed(1)}x`;
                });
            }

            const fishSpeedSlider = document.getElementById('fish-speed');
            if (fishSpeedSlider) {
                fishSpeedSlider.addEventListener('input', (e) => {
                    this.fishSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.fishSpeedMultiplier.toFixed(1)}x`;
                });
            }

            const dolphinSpeedSlider = document.getElementById('dolphin-speed');
            if (dolphinSpeedSlider) {
                dolphinSpeedSlider.addEventListener('input', (e) => {
                    this.dolphinSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.dolphinSpeedMultiplier.toFixed(1)}x`;
                });
            }

            const boatSpeedSlider = document.getElementById('boat-speed');
            if (boatSpeedSlider) {
                boatSpeedSlider.addEventListener('input', (e) => {
                    this.boatSpeedMultiplier = parseFloat(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.boatSpeedMultiplier.toFixed(1)}x`;
                });
            }

            const pixelSizeSlider = document.getElementById('pixel-size');
            if (pixelSizeSlider) {
                pixelSizeSlider.addEventListener('input', (e) => {
                    this.pixelSize = parseInt(e.target.value);
                    e.target.nextElementSibling.textContent = `${this.pixelSize}px`;
                    this.resize();
                    this.generateOcean();
                });
            }

            const regenerateBtn = document.getElementById('regenerate-ocean');
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => {
                    this.generateOcean();
                });
            }

            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => {
                    this.isPaused = !this.isPaused;
                    pauseBtn.classList.toggle('paused');
                    pauseBtn.textContent = this.isPaused ? 'resume' : 'stop the animation';
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initControls);
        } else {
            initControls();
        }
    }

    animate(timestamp) {
        // Delta time in seconds, capped at 100ms to avoid huge jumps on tab switch
        const rawDt = (timestamp - this.lastTimestamp) / 1000;
        const dt = Math.min(rawDt, 0.1);
        this.lastTimestamp = timestamp;

        if (!this.isPaused) {
            this.time += 0.48 * this.waveSpeedMultiplier * dt;

            // Clear the ImageData buffer (fill with zeros)
            this.pixels.fill(0);

            // Draw ocean pixels directly into ImageData
            this.drawOcean();

            // Update and draw features
            this.updateFeatures(dt);
            this.updateBoatPosition(dt);

            this.drawIslandAll();
            this.drawFishAll();
            this.drawDolphinAll();
            this.drawSailboat();

            // Single putImageData call per frame
            this.ctx.putImageData(this.imageData, 0, 0);
        }

        requestAnimationFrame((ts) => this.animate(ts));
    }
}

// Initialize ocean when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PixelOcean());
} else {
    new PixelOcean();
}
