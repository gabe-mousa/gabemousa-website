// Analytics tracking system
class Analytics {
    constructor() {
        this.storageKey = 'gabriel_mousa_analytics';
        this.data = this.loadData();
        this.initializeSession();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            return {
                totalViews: 0,
                pageViews: {},
                clickEvents: {},
                sessions: [],
                lastReset: Date.now()
            };
        }
        return JSON.parse(stored);
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    initializeSession() {
        const sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pages: [],
            clicks: 0
        };
        this.currentSession = sessionData;
        this.data.sessions.push(sessionData);
        this.trackPageView();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackPageView(pageName = this.getCurrentPage()) {
        this.data.totalViews++;
        this.data.pageViews[pageName] = (this.data.pageViews[pageName] || 0) + 1;

        if (this.currentSession) {
            this.currentSession.pages.push({
                page: pageName,
                timestamp: Date.now()
            });
        }

        this.saveData();
    }

    trackClick(elementName) {
        this.data.clickEvents[elementName] = (this.data.clickEvents[elementName] || 0) + 1;
        if (this.currentSession) {
            this.currentSession.clicks++;
        }
        this.saveData();
    }

    getCurrentPage() {
        if (window.location.pathname.includes('analytics')) {
            return 'analytics';
        } else if (window.location.pathname.includes('blog-list')) {
            return 'blog-list';
        } else if (window.location.pathname.includes('post')) {
            return 'blog-post';
        }
        return 'home';
    }

    getMetrics() {
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

        const viewsLastWeek = this.data.sessions
            .filter(s => s.startTime > weekAgo)
            .length;

        const avgSessionLength = this.data.sessions.length > 0
            ? this.data.sessions.reduce((sum, s) => {
                const duration = (s.pages[s.pages.length - 1]?.timestamp || s.startTime) - s.startTime;
                return sum + duration;
            }, 0) / this.data.sessions.length
            : 0;

        const mostViewedPage = Object.entries(this.data.pageViews).sort((a, b) => b[1] - a[1])[0];
        const mostClickedElement = Object.entries(this.data.clickEvents).sort((a, b) => b[1] - a[1])[0];

        const bounceRate = this.calculateBounceRate();
        const avgClicksPerSession = this.data.sessions.length > 0
            ? this.data.sessions.reduce((sum, s) => sum + s.clicks, 0) / this.data.sessions.length
            : 0;

        return {
            totalViews: this.data.totalViews,
            viewsLastWeek,
            totalSessions: this.data.sessions.length,
            avgSessionLength: Math.round(avgSessionLength / 1000), // in seconds
            mostViewedPage: mostViewedPage ? mostViewedPage[0] : 'N/A',
            mostViewedPageCount: mostViewedPage ? mostViewedPage[1] : 0,
            mostClickedElement: mostClickedElement ? mostClickedElement[0] : 'N/A',
            mostClickedCount: mostClickedElement ? mostClickedElement[1] : 0,
            bounceRate: bounceRate.toFixed(1),
            avgClicksPerSession: avgClicksPerSession.toFixed(2),
            pageViews: this.data.pageViews,
            clickEvents: this.data.clickEvents
        };
    }

    calculateBounceRate() {
        const singlePageSessions = this.data.sessions.filter(s => s.pages.length <= 1).length;
        if (this.data.sessions.length === 0) return 0;
        return (singlePageSessions / this.data.sessions.length) * 100;
    }

    resetData() {
        this.data = {
            totalViews: 0,
            pageViews: {},
            clickEvents: {},
            sessions: [],
            lastReset: Date.now()
        };
        this.saveData();
    }
}

// Initialize analytics
const analytics = new Analytics();

// Track navigation clicks
document.addEventListener('DOMContentLoaded', () => {
    // Track nav links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.getAttribute('href').split('#')[1] || 'home';
            analytics.trackClick(`nav-${page}`);
        });
    });

    // Track blog post clicks
    const blogPosts = document.querySelectorAll('.post, .blog-list-item');
    blogPosts.forEach((post, index) => {
        post.addEventListener('click', () => {
            analytics.trackClick(`blog-post-click-${index}`);
        });
    });

    // Track button clicks
    const buttons = document.querySelectorAll('button, a.see-all-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim().substring(0, 30);
            analytics.trackClick(`button-${text}`);
        });
    });

    // Track idea card clicks
    const ideaCards = document.querySelectorAll('.idea-card');
    ideaCards.forEach(card => {
        card.addEventListener('click', () => {
            const text = card.textContent.trim().substring(0, 30);
            analytics.trackClick(`idea-${text}`);
        });
    });
});

// Track page transitions
window.addEventListener('beforeunload', () => {
    analytics.saveData();
});
