const { fs } = require("fs-extra");

const publication = process.env.hashnode_url;
const maxPosts = Number(process.env.max_post_count) || 5;
const readmePath = process.env.readmePath || "README.md";
const updateReadMe = process.env.updateReadMe || false;

async function run() {
  const query = `
  query {
    publication(host: "${publication}") {
      posts(first: ${maxPosts}) {
        edges {
          node {
            title
            url
          }
        }
      }
    }
  }`;

  const res = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const json = await res.json();

  const posts = json.data.publication.posts.edges;

  const markdown = posts
    .map(p => `- [${p.node.title}](${p.node.url})`)
    .join("\n");

    if(updateReadMe) {
        let readme = await fs.readFile(readmePath, "utf8");

        readme = readme.replace(
            /<!-- BLOG-POST-LIST:START -->([\s\S]*?)<!-- BLOG-POST-LIST:END -->/,
            `<!-- BLOG-POST-LIST:START -->\n${markdown}\n<!-- BLOG-POST-LIST:END -->`
        );

        await fs.writeFile(readmePath, readme);
        console.log("README updated ✅");
    } else {
        return markdown;
    }
}

run().catch(err => {
  console.error("Action failed:", err);
  process.exit(1);
});
