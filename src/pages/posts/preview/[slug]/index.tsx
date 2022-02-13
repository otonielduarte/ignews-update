import { GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { SEO } from "../../../../components/SEO";
import { getPrismicClient } from "../../../../services/prismic";
import { Post } from "../../../../types/post";
import { formatLongDateString } from "../../../../utils/formatDate";

import styles from '../../post.module.scss'

interface PreviewProps {
  post: Post
}

export default function PreviewPage({ post }: PreviewProps) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.data?.isSubscriptionActive) {
      router.push(`/post/${post.slug}`)
    }
  }, [session, router, post])

  return (
    <>
      <SEO title={post.title} description={post.title}></SEO>
      <main className={styles.postContainer}>
        <article className={styles.post}>
          <h1>{post.title} </h1>
          <time>{post.updatedAt}</time>
          <div className={`${styles.postContent} ${styles.previewContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />

          <Link href='/' passHref>
            <div className={styles.buttonContinue}>
              Wanna continue reading?
              <a>Subscribe now</a>
            </div>
          </Link>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: 'next.js---novidades-na-versao-10-e-atualizacao-do-blog' } }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismicClient = getPrismicClient();

  const response = await prismicClient.getByUID<any>('post', String(slug), {});
  const post: Post = {
    slug: String(slug),
    title: RichText.asText(response.data.title),
    updatedAt: formatLongDateString(response.last_publication_date),
    content: RichText.asHtml(response.data.content.splice(0, 3))
  }

  return {
    props: { post },
    revalidate: 60 * 30,
  }
}