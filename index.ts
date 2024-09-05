const greetings = [
  "Hi, ",
  "Howdy, ",
  "Hey, ",
  "hellooooooooooooooooooooooooooooooooooooooooooooooo.\n",
];

Bun.serve({
  port: 3000,
  async fetch(req, server) {
    if (new URL(req.url).pathname == "/favicon.ico")
      return new Response(null, { status: 404 });

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const reposreq = await fetch(
      "https://api.github.com/users/mrhappyma/repos?per_page=100"
    );
    let repos = (await reposreq.json()) as Repo[];
    repos = repos.filter(
      (repo) =>
        !repo.fork &&
        repo.description &&
        new Date(repo.created_at).getTime() > Date.now() - 31556952000
    );
    repos = repos.map((r) => ({
      ...r,
      homepage: r.homepage
        ? r.homepage.replace(/(https?:\/\/)|(\/$)/g, "")
        : r.homepage,
    }));
    repos = repos.sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );

    const projects = repos
      .map((r) => `${r.homepage ? r.homepage : r.name}: ${r.description}`)
      .join("\n");

    return new Response(
      `${greeting}I'm Dominic. I'm a highschool student from Pennsylvania.

I like working on cool code things and cool non-code things.
I didn't like my website and didn't want to remake it, so now it's just plain text.

My Github username is mrhappyma, and my email is my name at this domain.

${
  repos.length > 0 &&
  `Here's some stuff I've been working on recently:
${projects}`
}`
    );
  },
});
