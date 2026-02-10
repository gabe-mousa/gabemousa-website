// Load and display metrics
function loadDashboard() {
    const metrics = analytics.getMetrics();

    // Create metrics grid
    const metricsGrid = document.getElementById('metrics-grid');
    metricsGrid.innerHTML = '';

    const metricCards = [
        {
            title: 'Total Views',
            value: metrics.totalViews,
            subtext: `${metrics.totalSessions} sessions`
        },
        {
            title: 'Views Last Week',
            value: metrics.viewsLastWeek,
            subtext: 'last 7 days'
        },
        {
            title: 'Avg Session Length',
            value: `${metrics.avgSessionLength}s`,
            subtext: 'per session'
        },
        {
            title: 'Bounce Rate',
            value: `${metrics.bounceRate}%`,
            subtext: 'single-page sessions'
        },
        {
            title: 'Most Viewed Page',
            value: metrics.mostViewedPage,
            subtext: `${metrics.mostViewedPageCount} views`
        },
        {
            title: 'Avg Clicks Per Session',
            value: metrics.avgClicksPerSession,
            subtext: 'user interactions'
        }
    ];

    metricCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'metric-card';
        cardEl.innerHTML = `
            <h3>${card.title}</h3>
            <p class="metric-value">${card.value}</p>
            <p class="metric-subtext">${card.subtext}</p>
        `;
        metricsGrid.appendChild(cardEl);
    });

    // Create page views chart
    if (Object.keys(metrics.pageViews).length > 0) {
        const pageViewsContainer = document.getElementById('page-views-container');
        pageViewsContainer.style.display = 'block';

        const pageViewsChart = document.getElementById('page-views-chart');
        pageViewsChart.innerHTML = '';

        const sortedPages = Object.entries(metrics.pageViews)
            .sort((a, b) => b[1] - a[1]);

        const maxViews = Math.max(...sortedPages.map(p => p[1]));

        sortedPages.forEach(([page, count]) => {
            const percentage = (count / maxViews) * 100;
            const itemEl = document.createElement('div');
            itemEl.className = 'bar-item';
            itemEl.innerHTML = `
                <div class="bar-label">${page}</div>
                <div class="bar" style="width: ${percentage}%;">
                    <span class="bar-value">${count}</span>
                </div>
            `;
            pageViewsChart.appendChild(itemEl);
        });
    }

    // Create click events chart
    if (Object.keys(metrics.clickEvents).length > 0) {
        const clickEventsContainer = document.getElementById('click-events-container');
        clickEventsContainer.style.display = 'block';

        const clickEventsChart = document.getElementById('click-events-chart');
        clickEventsChart.innerHTML = '';

        const sortedClicks = Object.entries(metrics.clickEvents)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10

        const maxClicks = Math.max(...sortedClicks.map(c => c[1]));

        sortedClicks.forEach(([event, count]) => {
            const percentage = (count / maxClicks) * 100;
            const itemEl = document.createElement('div');
            itemEl.className = 'bar-item';

            // Truncate long event names
            const displayName = event.length > 30 ? event.substring(0, 27) + '...' : event;

            itemEl.innerHTML = `
                <div class="bar-label" title="${event}">${displayName}</div>
                <div class="bar" style="width: ${percentage}%;">
                    <span class="bar-value">${count}</span>
                </div>
            `;
            clickEventsChart.appendChild(itemEl);
        });
    }

    // Fun facts
    const funFactsContainer = document.getElementById('fun-facts-container');
    const funFactsList = document.getElementById('fun-facts-list');
    funFactsContainer.style.display = 'block';
    funFactsList.innerHTML = '';

    const facts = generateFunFacts(metrics);
    facts.forEach(fact => {
        const factEl = document.createElement('div');
        factEl.className = 'fact';
        factEl.innerHTML = fact;
        funFactsList.appendChild(factEl);
    });
}

function generateFunFacts(metrics) {
    const facts = [];

    // Fact 1: Most engaged metric
    if (metrics.mostClickedElement !== 'N/A') {
        facts.push(`<span class="fact-emoji">🖱️</span> Your most clicked element is "<strong>${metrics.mostClickedElement}</strong>" with ${metrics.mostClickedCount} clicks`);
    }

    // Fact 2: Session behavior
    if (metrics.totalSessions > 1) {
        const returnVisitors = Math.round(Math.random() * metrics.totalSessions * 0.3);
        facts.push(`<span class="fact-emoji">👥</span> You've had <strong>${metrics.totalSessions}</strong> total sessions`);
    }

    // Fact 3: Bounce rate
    if (metrics.bounceRate < 30) {
        facts.push(`<span class="fact-emoji">🎯</span> Your bounce rate of ${metrics.bounceRate}% is excellent! Users love exploring your site`);
    } else if (metrics.bounceRate > 70) {
        facts.push(`<span class="fact-emoji">📉</span> Your bounce rate is ${metrics.bounceRate}%. Consider adding more engaging content to keep visitors!`);
    } else {
        facts.push(`<span class="fact-emoji">📊</span> Your bounce rate is ${metrics.bounceRate}%, which is pretty normal`);
    }

    // Fact 4: Peak activity
    const pageViewsArray = Object.entries(metrics.pageViews).sort((a, b) => b[1] - a[1]);
    if (pageViewsArray.length > 0) {
        const peakPage = pageViewsArray[0];
        const percentage = ((peakPage[1] / metrics.totalViews) * 100).toFixed(1);
        facts.push(`<span class="fact-emoji">⭐</span> Your <strong>${peakPage[0]}</strong> page accounts for <strong>${percentage}%</strong> of all views`);
    }

    // Fact 5: Engagement level
    const avgClicks = parseFloat(metrics.avgClicksPerSession);
    if (avgClicks > 3) {
        facts.push(`<span class="fact-emoji">⚡</span> Your average of ${metrics.avgClicksPerSession} clicks per session shows high engagement!`);
    } else if (avgClicks > 0) {
        facts.push(`<span class="fact-emoji">👆</span> Visitors average ${metrics.avgClicksPerSession} clicks per session`);
    }

    // Fact 6: Session time
    if (metrics.avgSessionLength > 60) {
        facts.push(`<span class="fact-emoji">⏱️</span> Your average session lasts ${metrics.avgSessionLength} seconds - visitors are spending real time here!`);
    } else if (metrics.avgSessionLength > 0) {
        facts.push(`<span class="fact-emoji">⏱️</span> Average session length is ${metrics.avgSessionLength} seconds`);
    }

    // Fact 7: Total views milestone
    if (metrics.totalViews >= 100) {
        facts.push(`<span class="fact-emoji">🎉</span> You've reached <strong>${metrics.totalViews}</strong> total views! Keep it up!`);
    } else if (metrics.totalViews >= 50) {
        facts.push(`<span class="fact-emoji">🚀</span> You're at <strong>${metrics.totalViews}</strong> views and growing!`);
    }

    // Fact 8: Week activity
    if (metrics.viewsLastWeek > 0) {
        const weekPercentage = ((metrics.viewsLastWeek / metrics.totalViews) * 100).toFixed(1);
        facts.push(`<span class="fact-emoji">📅</span> <strong>${metrics.viewsLastWeek}</strong> views this week (${weekPercentage}% of total)`);
    }

    if (facts.length === 0) {
        facts.push(`<span class="fact-emoji">🌱</span> Start tracking by visiting your site and interacting with it!`);
    }

    return facts;
}

function resetAnalytics() {
    if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
        analytics.resetData();
        location.reload();
    }
}

// Load dashboard when page loads
document.addEventListener('DOMContentLoaded', loadDashboard);
