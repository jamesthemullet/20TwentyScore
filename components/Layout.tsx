import React, { ReactNode } from 'react';
import Header from './header/header';
import Footer from './footer/footer';
import Meta from './meta';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => {
  const seo = null;

  return (
    <>
      <Meta />
      <Header />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
