import { GetStaticProps } from "next"
import { RichText } from "prismic-dom";
import { SEO } from "../../../../components/SEO";
import { getPrismicClient } from "../../../../services/prismic";
import { Post } from "../../../../types/post";
import { formatLongDateString } from "../../../../utils/formatDate";

import style from '../[slug]/styles.module.scss'


interface PreviewProps {
  post: Post
}

export default function PreviewPage({ post }: PreviewProps) {
  return (
    <>
      <SEO title={post.title} description={post.title}></SEO>
      <main className={style.postContainer}>
        <article className={style.post}>
          <h1>{post.title} </h1>
          <time>{post.updatedAt}</time>
          <div className={`${style.postContent} ${style.previewContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
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
    props: { post }
  }
}