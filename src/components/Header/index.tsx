import { SignButton } from '../SignInButton';
import Image from 'next/image';
import styles from './styles.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { ActiveLink } from '../ActiveLink';

export function Header() {
  const router = useRouter()

  const handleClickWithRouter = (e) => {
    e.preventDefault()
    router.push('/')
  }
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Image src="/assets/images/logo.svg" alt="logotipo ig.news" width={100} height={100} onClick={handleClickWithRouter} />
        <nav>
          <ActiveLink activeClassName={styles.active} href='/'>
            <a>Home</a>
          </ActiveLink>


          <ActiveLink activeClassName={styles.active} href="/posts">
            <a>Posts</a>
          </ActiveLink>

        </nav>
        <SignButton />
      </div>
    </header>
  );
}