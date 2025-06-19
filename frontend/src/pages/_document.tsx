import { Html, Head, Main, NextScript } from "next/document";

export default function Document(props: any) {
  return (
    <Html lang={props.locale}>
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
