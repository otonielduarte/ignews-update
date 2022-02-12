import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { useSession, signIn, signOut } from "next-auth/react"

import styles from './styles.module.scss';

export function SignButton() {
  const { data: session, status } = useSession()

  function handleAuthenticate() {
    signIn('github')
  }

  function handleSignOut() {
    signOut({
      callbackUrl: '/'
    })
  }
  return status === 'authenticated' ? (
    <>
      <button className={styles.buttonContent} type='button' onClick={handleSignOut}>
        <FaGithub size={20} color="#04d361" />
        {session.user.name}
        <FiX size={20} color="#737380" className={styles.closeButton} />
      </button>
    </>
  ) : (
    <>
      <button className={styles.buttonContent} type='button' onClick={handleAuthenticate}>
        <FaGithub size={20} color="#eba417" />
        Sign in with Github
      </button>
    </>
  )
}