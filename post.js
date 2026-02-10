// Get the post filename from URL parameters
function getPostFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('post');
}

// Load and display the blog post
async function loadBlogPost() {
    const container = document.getElementById('blog-content');
    const postFilename = getPostFromURL();

    if (!postFilename) {
        container.className = 'error';
        container.innerHTML = '<p>No blog post specified.</p><a href="index.html#blog" class="back-link">← back to blog</a>';
        return;
    }

    try {
        console.log(`Loading post: ${postFilename}`);
        const response = await fetch(`blog-posts/${postFilename}`);

        if (!response.ok) {
            throw new Error(`Failed to load post: ${response.status}`);
        }

        const markdown = await response.text();

        // Convert markdown to HTML using marked.js
        const html = marked.parse(markdown);

        container.className = 'blog-content';
        container.innerHTML = html;

        // Update page title
        const firstH1 = container.querySelector('h1');
        if (firstH1) {
            document.title = `${firstH1.textContent} - gabriel mousa`;
        }

    } catch (err) {
        console.error('Error loading blog post:', err);
        container.className = 'error';
        container.innerHTML = `
            <p>Error loading blog post.</p>
            <p>${err.message}</p>
            <a href="index.html#blog" class="back-link">← back to blog</a>
        `;
    }
}

// Load post when page loads
document.addEventListener('DOMContentLoaded', loadBlogPost);
