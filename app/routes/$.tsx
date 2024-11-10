import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { URLMD_BASE_URL, BASE_URL } from "~/env.server";
import markdoc from "@markdoc/markdoc";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
// eslint-disable-next-line import/no-named-as-default-member
const { parse, transform, renderers } = markdoc;

const appendPaths = (base: string, paths: string[]) => {
  return paths.reduce(
    (acc, path) => `${acc}/${encodeURIComponent(path)}`,
    base.replace(/\/$/, "")
  );
};

const rewriteLinks = (html: string, baseUrl: string) => {
  return html.replace(/href="([^"]+)"/g, (_, href) => {
    if (href.startsWith("#")) {
      return `href="${href}"`;
    }
    return `href="${new URL(encodeURIComponent(href), baseUrl).toString()}"`;
  });
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const urlParam = params["*"];
  const url = searchParams.get("url") || urlParam;
  invariant(url, "url is required");

  const pageContent = fetch(appendPaths(URLMD_BASE_URL, ["convert", url]))
    .then((res) => {
      if (!res.ok) {
        return Promise.reject(`Failed to convert ${urlParam} to markdown`);
      }

      return res.text();
    })
    .then((markdown) => {
      // convert markdown to html using markdoc
      const doc = parse(markdown);
      const ast = transform(doc);
      const html = renderers.html(ast);
      // rewrite links to be relative to the base url
      const rewrittenHtml = rewriteLinks(html, BASE_URL);
      return rewrittenHtml;
    })
    .catch((error) => {
      console.error(error);
      return String(error);
    });
  return { pageContent };
};

export default function Page() {
  const { pageContent } = useLoaderData<typeof loader>();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={pageContent} errorElement={<div>Error loading page</div>}>
        {(pageContent) => (
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
      </Await>
    </Suspense>
  );
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return <div>Error loading page: {error.message}</div>;
};
