export async function getPosts() {
    const res = await fetch(
      'https://radiodev.aurigital.com/wp-json/wp/v2/posts?_embed'
    );
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    return res.json();
  }

