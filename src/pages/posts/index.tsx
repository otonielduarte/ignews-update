import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { SEO } from '../../components/SEO';
import { getPrismicClient } from '../../services/prismic';
import { Post } from '../../types/post';
import { formatLongDateString } from '../../utils/formatDate';

import styles from './styles.module.scss';

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  const router = useRouter();

  function handlePostClicked(postSelected: Post) {
    router.push(`posts/${postSelected.slug}`)
  }

  return (
    <>
      <SEO title='Posts' description='ignews posts'></SEO>
      <main className={styles.postListContainer}>
        <div className={styles.postList}>
          {
            posts.map(post => (
              <Link href={`posts/${post.slug}`} key={post.slug}>
                <a >
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.content}</p>
                </a>
              </Link>
            ))
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query<any>(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['Post.title', 'Post.content'],
      pageSize: 20,
    });

  const posts = mapResultToPosts(response)

  return {
    props: {
      posts
    }
  }
}


function mapResultToPosts(response) {
  return response.results.map(result => (
    {
      slug: result.uid,
      title: RichText.asText(result.data.title),
      content: result.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: formatLongDateString(result.last_publication_date)
    }
  ));
}