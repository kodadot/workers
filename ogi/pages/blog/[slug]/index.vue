<template>
  <h1>{{ title }}</h1>
  <p>{{ subtitle }}</p>
  <img :src="parsedImage" :alt="title" />
  <hr />
  <div>{{ parsed.data.matter }}</div>
</template>

<script setup lang="ts">
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { matter } from 'vfile-matter';

const route = useRoute();
const slug = route.params.slug.toString();

const data = await getMarkdown(slug);

const excerpts = () => {
  return function (_tree: unknown, file: any) {
    matter(file);
  };
};
const parsed = await unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(excerpts)
  .process(data);

interface MatterData {
  title: string;
  image: string;
  subtitle: string;
}

const { image, title, subtitle } = parsed.data.matter as MatterData;
const parsedImage = await parseImage(image);

useSeoMeta({
  title: seoTitle(title),
  description: subtitle,
  ogTitle: seoTitle(title),
  ogDescription: subtitle,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle(title),
  twitterImageAlt: title,
});

defineOgImage({
  component: 'blog',
  title: title,
  image: parsedImage,
});
</script>
