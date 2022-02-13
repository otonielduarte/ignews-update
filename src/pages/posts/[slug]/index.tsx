import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import { RichText } from "prismic-dom";
import { SEO } from "../../../components/SEO";
import { getPrismicClient } from "../../../services/prismic";
import { Post } from "../../../types/post";
import { formatLongDateString } from "../../../utils/formatDate";

import style from '../post.module.scss'


interface PostPageProps {
  post: Post
}

export default function PostPage({ post }: PostPageProps) {
  return (
    <>
      <SEO title={post.title} description={post.title}></SEO>
      <main className={style.postContainer}>
        <article className={style.post}>
          <h1>{post.title} </h1>
          <time>{post.updatedAt}</time>
          <div className={style.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const { slug } = params;
  const session = await getSession({ req })
  const prismicClient = getPrismicClient(req);

  console.log(session);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/posts',
        permanent: false
      }
    }
  }

  const response = await prismicClient.getByUID<any>('post', String(slug), {});
  const post: Post = {
    slug: String(slug),
    title: RichText.asText(response.data.title),
    updatedAt: formatLongDateString(response.last_publication_date),
    content: RichText.asHtml(response.data.content)
  }

  return {
    props: { post }
  }
}