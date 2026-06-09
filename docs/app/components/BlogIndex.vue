<script setup lang="ts">
  const { data: posts } = await useAsyncData('blog-posts', () =>
    queryCollection('content')
      .where('path', 'LIKE', '/blog/%')
      .where('path', 'NOT LIKE', '/blog/index')
      .order('date', 'DESC')
      .all()
  );

  function formatDate(raw: string | Date | undefined) {
    if (!raw) return { time: 0, string: '' };
    const date = new Date(raw);
    date.setUTCHours(12);
    return {
      time: +date,
      string: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }
</script>

<template>
  <ul class="blog-list">
    <li v-for="post in posts ?? []" :key="post.path" class="blog-entry">
      <article>
        <time :datetime="new Date(post.date as string).toISOString()">
          {{ formatDate(post.date as string).string }}
        </time>
        <h2 class="title">
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
        </h2>
        <p v-if="post.description" class="description">{{ post.description }}</p>
      </article>
    </li>
  </ul>
</template>

<style scoped>
  .blog-list {
    list-style-type: none;
    padding: 0;
  }

  .blog-entry {
    margin-top: 3em;
    padding-bottom: 1.5em;
    border-bottom: 1px solid var(--ui-border);
  }

  .blog-entry time {
    font-size: 14px;
    color: var(--ui-text-muted);
  }

  .title {
    border: none;
    margin-top: 0.5rem;
    padding-top: 0;
    font-size: 22px;
  }

  .title a {
    font-weight: 600;
    text-decoration: none;
    color: var(--ui-text-highlighted);
  }

  .description {
    margin-top: 0.5rem;
    color: var(--ui-text-muted);
  }
</style>
