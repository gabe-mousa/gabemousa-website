// Pixel Art Ocean Background with Dynamic Waves and Cursor-Following Sailboat
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

        this.pixelSize = 8; // Size of each "pixel" in the pixel art
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;

        this.resize();
        this.generateOcean();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.ceil(this.canvas.width / this.pixelSize);
        this.rows = Math.ceil(this.canvas.height / this.pixelSize);
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
        // Generate random ocean features (fish, reefs, islands, etc.)
        this.features = [];

        // Generate fish
        const fishCount = Math.floor(20 + Math.random() * 30);
        for (let i = 0; i < fishCount; i++) {
            this.features.push({
                type: 'fish',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows,
                direction: Math.random() > 0.5 ? 1 : -1,
                speed: 0.3 + Math.random() * 0.5,
                depth: 0.3 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
                color: this.getRandomFishColor()
            });
        }

        // Generate coral reefs
        const reefCount = Math.floor(5 + Math.random() * 10);
        for (let i = 0; i < reefCount; i++) {
            this.features.push({
                type: 'reef',
                x: Math.random() * this.cols,
                y: this.rows * (0.5 + Math.random() * 0.4),
                width: 3 + Math.floor(Math.random() * 5),
                height: 2 + Math.floor(Math.random() * 4),
                color: this.getRandomReefColor()
            });
        }

        // Generate islands (small ones in the distance)
        const islandCount = Math.floor(2 + Math.random() * 4);
        for (let i = 0; i < islandCount; i++) {
            this.features.push({
                type: 'island',
                x: Math.random() * this.cols,
                y: this.rows * (0.1 + Math.random() * 0.2),
                width: 4 + Math.floor(Math.random() * 8),
                height: 2 + Math.floor(Math.random() * 3)
            });
        }

        // Generate seaweed
        const seaweedCount = Math.floor(15 + Math.random() * 25);
        for (let i = 0; i < seaweedCount; i++) {
            this.features.push({
                type: 'seaweed',
                x: Math.random() * this.cols,
                y: this.rows * (0.6 + Math.random() * 0.35),
                height: 3 + Math.floor(Math.random() * 5),
                phase: Math.random() * Math.PI * 2
            });
        }

        // Generate jellyfish
        const jellyfishCount = Math.floor(5 + Math.random() * 10);
        for (let i = 0; i < jellyfishCount; i++) {
            this.features.push({
                type: 'jellyfish',
                x: Math.random() * this.cols,
                y: Math.random() * this.rows * 0.7,
                speed: 0.1 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
                bobPhase: Math.random() * Math.PI * 2
            });
        }
    }

    getRandomFishColor() {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8AAE', '#C77DFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomReefColor() {
        const colors = ['#FF6B9D', '#C77DFF', '#FFA07A', '#FF8AAE', '#E76F51'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getWaveHeight(x, y, time) {
        // Create wave patterns with varying frequencies
        const wave1 = Math.sin(x * 0.1 + time * 0.5) * 3;
        const wave2 = Math.sin(x * 0.05 - time * 0.3) * 2;
        const wave3 = Math.cos(x * 0.15 + time * 0.7) * 1.5;
        return wave1 + wave2 + wave3;
    }

    getDepthColor(depth, y) {
        // Create varying depths with different blue hues
        const normalizedDepth = Math.min(1, depth + (y / this.rows) * 0.7);

        // Define color palette for ocean depths
        if (normalizedDepth < 0.15) {
            // Surface - lighter blue with foam
            return `rgb(${100 + Math.random() * 30}, ${180 + Math.random() * 30}, ${220 + Math.random() * 35})`;
        } else if (normalizedDepth < 0.35) {
            // Shallow water
            return `rgb(${70 + Math.random() * 20}, ${150 + Math.random() * 20}, ${200 + Math.random() * 20})`;
        } else if (normalizedDepth < 0.6) {
            // Medium depth
            return `rgb(${40 + Math.random() * 15}, ${110 + Math.random() * 15}, ${170 + Math.random() * 15})`;
        } else if (normalizedDepth < 0.8) {
            // Deep water
            return `rgb(${20 + Math.random() * 10}, ${70 + Math.random() * 15}, ${130 + Math.random() * 15})`;
        } else {
            // Very deep - darkest blue
            return `rgb(${10 + Math.random() * 5}, ${40 + Math.random() * 10}, ${90 + Math.random() * 10})`;
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
        const x = Math.floor(fish.x + Math.sin(this.time * 2 + fish.phase) * 0.5);
        const y = Math.floor(fish.y + Math.cos(this.time * 3 + fish.phase) * 0.3);

        // Draw fish body (2x1 pixels)
        this.drawPixel(x, y, fish.color);
        this.drawPixel(x + fish.direction, y, fish.color);

        // Draw fish tail
        const tailColor = this.adjustBrightness(fish.color, -20);
        this.drawPixel(x - fish.direction, y, tailColor);

        // Draw eye (small detail)
        this.drawPixel(x + fish.direction, y, '#000000');
    }

    drawReef(reef) {
        const x = Math.floor(reef.x);
        const y = Math.floor(reef.y);

        for (let i = 0; i < reef.width; i++) {
            for (let j = 0; j < reef.height; j++) {
                if (Math.random() > 0.3) { // Irregular shape
                    const brightness = Math.random() * 40 - 20;
                    this.drawPixel(x + i, y + j, this.adjustBrightness(reef.color, brightness));
                }
            }
        }
    }

    drawIsland(island) {
        const x = Math.floor(island.x);
        const y = Math.floor(island.y);

        // Draw island base (sand/rock)
        for (let i = 0; i < island.width; i++) {
            for (let j = 0; j < island.height; j++) {
                const isEdge = i === 0 || i === island.width - 1 || j === island.height - 1;
                const color = isEdge ? '#C2B280' : '#D4C5A9';
                this.drawPixel(x + i, y + j, color);
            }
        }

        // Draw palm tree if island is big enough
        if (island.width > 5) {
            const treeX = x + Math.floor(island.width / 2);
            const treeY = y - 3;
            // Tree trunk
            this.drawPixel(treeX, treeY + 1, '#8B4513');
            this.drawPixel(treeX, treeY + 2, '#8B4513');
            // Leaves
            this.drawPixel(treeX - 1, treeY, '#228B22');
            this.drawPixel(treeX, treeY, '#228B22');
            this.drawPixel(treeX + 1, treeY, '#228B22');
            this.drawPixel(treeX, treeY - 1, '#228B22');
        }
    }

    drawSeaweed(seaweed) {
        const x = Math.floor(seaweed.x);
        const baseY = Math.floor(seaweed.y);
        const sway = Math.sin(this.time * 2 + seaweed.phase) * 1.5;

        for (let i = 0; i < seaweed.height; i++) {
            const offset = Math.floor(Math.sin(this.time * 2 + seaweed.phase + i * 0.5) * sway);
            const green = 100 + Math.floor(Math.random() * 50);
            this.drawPixel(x + offset, baseY - i, `rgb(20, ${green}, 50)`);
        }
    }

    drawJellyfish(jellyfish) {
        const x = Math.floor(jellyfish.x);
        const bobOffset = Math.sin(this.time * 1.5 + jellyfish.bobPhase) * 2;
        const y = Math.floor(jellyfish.y + bobOffset);

        // Jellyfish bell (dome shape)
        this.drawPixel(x - 1, y, 'rgba(255, 182, 193, 0.6)');
        this.drawPixel(x, y, 'rgba(255, 182, 193, 0.8)');
        this.drawPixel(x + 1, y, 'rgba(255, 182, 193, 0.6)');
        this.drawPixel(x, y - 1, 'rgba(255, 182, 193, 0.7)');

        // Tentacles (animated)
        const tentacleWave = Math.sin(this.time * 3 + jellyfish.phase);
        for (let i = 0; i < 3; i++) {
            const offset = Math.floor(tentacleWave * (i % 2 === 0 ? 1 : -1));
            this.drawPixel(x - 1 + i, y + 1 + offset, 'rgba(255, 192, 203, 0.5)');
            this.drawPixel(x - 1 + i, y + 2 + offset, 'rgba(255, 192, 203, 0.3)');
        }
    }

    drawSailboat() {
        const x = Math.floor(this.mouseX / this.pixelSize);
        const y = Math.floor(this.mouseY / this.pixelSize);

        // Boat hull (brown)
        this.drawPixel(x - 2, y + 1, '#8B4513');
        this.drawPixel(x - 1, y + 1, '#A0522D');
        this.drawPixel(x, y + 1, '#A0522D');
        this.drawPixel(x + 1, y + 1, '#A0522D');
        this.drawPixel(x + 2, y + 1, '#8B4513');

        // Boat bottom
        this.drawPixel(x - 1, y + 2, '#654321');
        this.drawPixel(x, y + 2, '#654321');
        this.drawPixel(x + 1, y + 2, '#654321');

        // Mast (dark brown)
        this.drawPixel(x, y, '#654321');
        this.drawPixel(x, y - 1, '#654321');
        this.drawPixel(x, y - 2, '#654321');
        this.drawPixel(x, y - 3, '#654321');

        // Sail (white with slight movement)
        const sailSway = Math.sin(this.time * 2) * 0.5;
        this.drawPixel(x + 1 + sailSway, y - 3, '#FFFFFF');
        this.drawPixel(x + 1 + sailSway, y - 2, '#F5F5F5');
        this.drawPixel(x + 2 + sailSway, y - 2, '#FFFFFF');
        this.drawPixel(x + 1 + sailSway, y - 1, '#F0F0F0');
        this.drawPixel(x + 2 + sailSway, y - 1, '#F5F5F5');

        // Flag on top of mast (red)
        this.drawPixel(x + 1, y - 4, '#FF0000');
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
                feature.x += feature.direction * feature.speed;

                // Wrap around screen
                if (feature.x < -5) feature.x = this.cols + 5;
                if (feature.x > this.cols + 5) feature.x = -5;
            } else if (feature.type === 'jellyfish') {
                feature.x += feature.speed * Math.sin(this.time + feature.phase);
                feature.y += feature.speed * 0.5;

                // Wrap around screen
                if (feature.x < -5) feature.x = this.cols + 5;
                if (feature.x > this.cols + 5) feature.x = -5;
                if (feature.y > this.rows + 5) feature.y = -5;
            }
        });
    }

    animate() {
        this.time += 0.016; // Approximately 60fps

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ocean with depth and waves
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const waveHeight = this.getWaveHeight(x, y, this.time);
                const depth = (y + waveHeight) / this.rows;
                const color = this.getDepthColor(depth, y);
                this.drawPixel(x, y, color);
            }
        }

        // Update and draw features (sorted by depth for proper layering)
        this.updateFeatures();

        // Draw features in order (back to front)
        this.features.filter(f => f.type === 'island').forEach(f => this.drawIsland(f));
        this.features.filter(f => f.type === 'jellyfish').forEach(f => this.drawJellyfish(f));
        this.features.filter(f => f.type === 'fish').forEach(f => this.drawFish(f));
        this.features.filter(f => f.type === 'seaweed').forEach(f => this.drawSeaweed(f));
        this.features.filter(f => f.type === 'reef').forEach(f => this.drawReef(f));

        // Draw sailboat on top of everything
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
