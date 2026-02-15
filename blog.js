// Discover blog posts via GitHub API (always up-to-date) with manifest fallback
async function discoverBlogPosts() {
    // Try GitHub API first — always reflects the latest pushed files
    try {
        const apiResponse = await fetch(
            'https://api.github.com/repos/gabe-mousa/gabemousa-website/contents/blog-posts?ref=main'
        );
        if (apiResponse.ok) {
            const files = await apiResponse.json();
            const mdFiles = files
                .filter(f => f.name.endsWith('.md'))
                .map(f => f.name)
                .sort((a, b) => {
                    const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0');
                    const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0');
                    return numA - numB;
                });
            console.log(`Loaded ${mdFiles.length} blog posts from GitHub API`);
            return mdFiles;
        }
    } catch (err) {
        console.log('GitHub API unavailable, falling back to manifest');
    }

    // Fallback: use manifest (for when API is rate-limited)
    try {
        const manifestResponse = await fetch('blog-posts/manifest.json');
        if (manifestResponse.ok) {
            const blogPosts = await manifestResponse.json();
            console.log('Loaded blog posts from manifest');
            return blogPosts;
        }
    } catch (err) {
        console.log('Manifest not available');
    }

    return [];
}

// Parse markdown to extract title and preview
function parseMarkdown(markdown) {
    const lines = markdown.split('\n').filter(line => line.trim());
    let title = 'Untitled';
    let date = '';
    let preview = '';

    // Extract title (very first line)
    if (lines.length > 0) {
        title = lines[0].replace(/^#\s*/, '').trim();
    }

    // Extract date (look for *Published:* or *Date:* or just the last line with asterisks)
    const dateMatch = markdown.match(/\*Published:\s*([^*]+)\*/i) ||
                     markdown.match(/\*([A-Za-z].*\d{4})\*/);
    if (dateMatch) {
        date = dateMatch[1].trim();
    }

    // Extract preview (first paragraph after title and any headers)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-') && !line.startsWith('**') && line.length > 10) {
            preview = line.trim();
            if (preview.length > 150) {
                preview = preview.substring(0, 150) + '...';
            }
            break;
        }
    }

    return { title, date, preview };
}

// Load and display blog posts
async function loadBlogPosts() {
    const container = document.getElementById('blog-posts-container');

    if (!container) {
        console.error('Blog posts container not found');
        return;
    }

    console.log('Loading blog posts...');

    try {
        // Discover blog posts automatically
        const blogPosts = await discoverBlogPosts();
        console.log(`Discovered ${blogPosts.length} blog posts`);

        const posts = [];

        // Fetch all blog posts
        for (let filename of blogPosts) {
            try {
                console.log(`Fetching: blog-posts/${filename}`);
                const response = await fetch(`blog-posts/${filename}`);
                if (!response.ok) {
                    console.warn(`Failed to fetch ${filename}: ${response.status}`);
                    continue;
                }

                const content = await response.text();
                const { title, date, preview } = parseMarkdown(content);

                posts.push({
                    filename,
                    title,
                    date,
                    preview
                });
                console.log(`Loaded: ${title}`);
            } catch (err) {
                console.error(`Error loading ${filename}:`, err);
            }
        }

        console.log(`Total posts loaded: ${posts.length}`);

        // Sort posts in reverse order by filename (highest number first)
        posts.sort((a, b) => {
            const numA = parseInt(a.filename.match(/^(\d+)/)?.[1] || '0');
            const numB = parseInt(b.filename.match(/^(\d+)/)?.[1] || '0');
            return numB - numA;
        });

        // Display only the 5 most recent posts on homepage
        const recentPosts = posts.slice(0, 5);

        recentPosts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post';
            article.style.cursor = 'pointer';
            article.onclick = () => {
                window.location.href = `post.html?post=${post.filename}`;
            };

            const h3 = document.createElement('h3');
            h3.textContent = post.title;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            dateSpan.textContent = post.date || 'no date';

            const p = document.createElement('p');
            p.textContent = post.preview || 'No preview available.';

            article.appendChild(h3);
            article.appendChild(dateSpan);
            article.appendChild(p);

            container.appendChild(article);
        });

        if (posts.length === 0) {
            container.innerHTML = '<p>No blog posts available yet. Make sure you\'re running a local server.</p>';
        }

    } catch (err) {
        console.error('Error loading blog posts:', err);
        container.innerHTML = '<p>Error loading blog posts. Check console for details.</p>';
    }
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);
