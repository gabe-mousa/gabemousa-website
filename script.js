function toggleOlderPosts() {
    const olderPosts = document.querySelector('.older-posts');
    const button = document.querySelector('.show-more');

    if (olderPosts.classList.contains('hidden')) {
        olderPosts.classList.remove('hidden');
        button.textContent = 'show less ↑';
    } else {
        olderPosts.classList.add('hidden');
        button.textContent = 'show older posts ↓';
    }
}
