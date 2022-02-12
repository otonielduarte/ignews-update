import { PrismicProvider } from "@prismicio/react";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { Header } from "../components/Header";

import '../styles/global.scss';

function IgnewsApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default IgnewsApp
