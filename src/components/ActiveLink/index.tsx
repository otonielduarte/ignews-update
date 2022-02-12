import { LinkProps } from "@prismicio/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cloneElement, ReactElement } from "react"

interface ActiveLinkProps extends LinkProps {
  children: ReactElement,
  activeClassName: string,
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
  const router = useRouter()
  const { asPath } = router;

  console.log(router)
  console.log(rest)

  const className = asPath === rest.href ? activeClassName : ''

  return (
    <Link {...rest}>
      {
        cloneElement(children, {
          className
        })
      }
    </Link>)
}