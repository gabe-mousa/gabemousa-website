// Blog posts configuration
const blogPosts = [
    '1-starting-a-blog.md',
    '2-how-to-fly-a-plane.md',
    '3-search-for-meaning.md'
];

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

    // Extract date (look for *Published:* or similar)
    const dateMatch = markdown.match(/\*Published:\s*([^*]+)\*/i);
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

        // Display posts in order (already sorted by filename prefix)
        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post';

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
