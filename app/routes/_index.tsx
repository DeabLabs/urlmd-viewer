import type { MetaFunction } from "@remix-run/node";
import { Form, useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "urlmd viewer" },
    { name: "description", content: "View contents of url as rendered markdown" },
  ];
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <main>
      <h1>urlmd viewer</h1>
      <p>View contents of url as rendered markdown</p>
      <Form method="get" onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const url = formData.get("url") as string;
        navigate(`/${encodeURIComponent(url)}`);
      }}>
        <input type="url" name="url" placeholder="url" />
        <button type="submit">view</button>
      </Form>
    </main>
  );
}

