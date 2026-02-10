// Automatically discover blog posts from directory or manifest
async function discoverBlogPosts() {
    try {
        // First, try to fetch the manifest file (works on GitHub Pages)
        try {
            const manifestResponse = await fetch('blog-posts/manifest.json');
            if (manifestResponse.ok) {
                const blogPosts = await manifestResponse.json();
                console.log('Loaded blog posts from manifest');
                return blogPosts;
            }
        } catch (err) {
            console.log('Manifest not available, trying directory listing');
        }

        // Fallback: try directory listing (works on local servers)
        const response = await fetch('blog-posts/');
        const html = await response.text();

        // Parse HTML to find all .md files
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');

        const blogPosts = [];
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.md') && !href.startsWith('..')) {
                blogPosts.push(href);
            }
        });

        return blogPosts.sort((a, b) => {
            const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0');
            const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0');
            return numA - numB;
        });
    } catch (err) {
        console.error('Error discovering blog posts:', err);
        return [];
    }
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
            if (preview.length > 200) {
                preview = preview.substring(0, 200) + '...';
            }
            break;
        }
    }

    return { title, date, preview };
}

// Load and display all blog posts
async function loadAllBlogPosts() {
    const container = document.getElementById('blog-list');
    const countElement = document.getElementById('post-count');

    if (!container) {
        console.error('Blog list container not found');
        return;
    }

    console.log('Loading all blog posts...');

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

        // Update post count
        if (countElement) {
            countElement.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''} total`;
        }

        // Display all posts
        container.className = 'blog-list';
        container.innerHTML = '';

        posts.forEach(post => {
            const item = document.createElement('a');
            item.className = 'blog-list-item';
            item.href = `post.html?post=${post.filename}`;

            const h3 = document.createElement('h3');
            h3.textContent = post.title;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            dateSpan.textContent = post.date || 'no date';

            const p = document.createElement('p');
            p.className = 'preview';
            p.textContent = post.preview || 'No preview available.';

            item.appendChild(h3);
            item.appendChild(dateSpan);
            item.appendChild(p);

            container.appendChild(item);
        });

        if (posts.length === 0) {
            container.className = 'error';
            container.innerHTML = '<p>No blog posts available yet. Make sure you\'re running a local server.</p>';
        }

    } catch (err) {
        console.error('Error loading blog posts:', err);
        container.className = 'error';
        container.innerHTML = '<p>Error loading blog posts. Check console for details.</p>';
    }
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadAllBlogPosts);
