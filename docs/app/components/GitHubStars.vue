<template>
  <a
    href="https://github.com/victorgarciaesgi/regle"
    target="_blank"
    rel="noopener noreferrer"
    class="github-stars-button"
  >
    <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
    <span class="star-icon">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </span>
    <span class="button-text">Star</span>
    <template v-if="isLoading || starCount != null">
      <span class="divider"></span>
      <span class="star-count" :class="{ loading: isLoading }">
        <template v-if="isLoading">
          <span class="skeleton"></span>
        </template>
        <template v-else-if="starCount !== null">
          {{ starCount }}
        </template>
        <template v-else>—</template>
      </span>
    </template>
  </a>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const starCount = ref<number | null>(null);
  const isLoading = ref(true);

  async function fetchStarCount() {
    try {
      const response = await fetch('https://api.github.com/repos/victorgarciaesgi/regle');
      const data = await response.json();
      starCount.value = data.stargazers_count;
    } catch (error) {
      console.error('Failed to fetch star count:', error);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    fetchStarCount();
  });
</script>

<style lang="scss" scoped>
  .github-stars-button {
    --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --star-hover-color: #fbbf24;
    --star-hover-color-rgb: 251, 191, 36;

    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #24292f 0%, #1b1f23 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-smooth);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
        0 0 20px rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.15);
      border-color: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.3);

      &::before {
        opacity: 1;
      }

      .github-icon {
        transform: scale(1.1);
      }

      .star-icon {
        transform: scale(1.2) rotate(15deg);
        color: var(--star-hover-color);
        filter: drop-shadow(0 0 6px rgba(var(--star-hover-color-rgb), 0.5));
      }

      .star-count {
        background: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.25);
        color: #2dd4a8;
      }
    }
  }

  .github-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .star-icon {
    display: flex;
    align-items: center;
    transition: all var(--transition-smooth);
    color: rgba(255, 255, 255, 0.7);

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .button-text {
    letter-spacing: 0.02em;
  }

  .divider {
    width: 1px;
    height: 20px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.2) 80%,
      transparent
    );
    margin: 0 4px;
  }

  .star-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    padding: 4px 10px;
    background: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.15);
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    color: var(--vp-c-brand-1);
    letter-spacing: 0.02em;
    transition: all 0.3s ease;

    &.loading {
      padding: 4px 8px;
    }
  }

  .skeleton {
    display: block;
    width: 40px;
    height: 28px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  // Light mode
  :root:not(.dark) {
    .github-stars-button {
      --star-hover-color: #f59e0b;
      --star-hover-color-rgb: 245, 158, 11;

      background: linear-gradient(135deg, #fff 0%, #f6f8fa 100%);
      border-color: rgba(0, 0, 0, 0.12);
      color: #24292f;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(0, 0, 0, 0.04) inset;

      &::before {
        background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
      }

      &:hover {
        box-shadow:
          0 8px 24px rgba(0, 0, 0, 0.12),
          0 0 0 1px rgba(0, 0, 0, 0.08) inset,
          0 0 20px rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.1);
        border-color: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.4);

        .star-icon {
          color: var(--star-hover-color);
          filter: drop-shadow(0 0 4px rgba(var(--star-hover-color-rgb), 0.4));
        }

        .star-count {
          background: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.2);
          color: var(--vp-c-brand-2);
        }
      }
    }

    .star-icon {
      color: rgba(0, 0, 0, 0.5);
    }

    .divider {
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(0, 0, 0, 0.15) 20%,
        rgba(0, 0, 0, 0.15) 80%,
        transparent
      );
    }

    .star-count {
      background: rgba(var(--vp-c-brand-1-rgb, 0, 187, 127), 0.12);
      color: var(--vp-c-brand-3);
    }

    .skeleton {
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.06) 25%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.06) 75%);
      background-size: 200% 100%;
    }
  }
</style>
