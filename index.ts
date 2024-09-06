import Airtable from "airtable";
import env from "./env";

const greetings = [
  "Hi, ",
  "Howdy, ",
  "Hey, ",
  "hellooooooooooooooooooooooooooooooooooooooooooooooo.\n",
];

const airtable = new Airtable({
  apiKey: env.AIRTABLE_TOKEN,
});

const sleepbase = airtable.base("appIqOXkRlH2Oelt0");
const shortlinkbase = airtable.base("appjZSOkcwDJJSr73");

//TODO: cache stuff
Bun.serve({
  port: env.PORT,
  async fetch(req, server) {
    const reqURL = new URL(req.url);

    if (reqURL.pathname == "/favicon.ico")
      return new Response(null, { status: 404 });
    if (reqURL.pathname != "/") {
      const url = (
        await shortlinkbase(reqURL.hostname)
          .select({
            filterByFormula: `{path} = "${reqURL.pathname}"`,
          })
          .firstPage()
      )[0];
      if (url) {
        return Response.redirect(
          url.get("destination") as string,
          url.get("code") as number
        );
      }
    }

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const reposreq = await fetch(
      "https://api.github.com/users/mrhappyma/repos?per_page=100",
      {
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
        },
      }
    );
    let repos = (await reposreq.json()) as Repo[];
    repos = repos.filter(
      (repo) =>
        !repo.fork &&
        repo.description &&
        new Date(repo.created_at).getTime() > Date.now() - 31556952000
    );
    repos = repos
      .map((r) => ({
        ...r,
        homepage: r.homepage
          ? r.homepage.replace(/(https?:\/\/)|(\/$)/g, "")
          : r.homepage,
      }))
      .sort(
        (a, b) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      )
      .splice(0, 7);

    const projects = repos
      .map(
        (r) => `${r.homepage ? r.homepage : r.name}: ${r.description?.trim()}`
      )
      .join("\n");

    const start = (
      await sleepbase("sleep")
        .select({
          filterByFormula: `AND({event} = "sleep_tracking_started", {time} > ${
            Date.now() - 1000 * 60 * 60 * 24
          })`,
          sort: [{ field: "time", direction: "desc" }],
          maxRecords: 1,
        })
        .firstPage()
    )[0].get("time") as number;
    const end = (
      await sleepbase("sleep")
        .select({
          filterByFormula: `AND({event} = "sleep_tracking_stopped", {time} > ${
            Date.now() - 1000 * 60 * 60 * 24
          })`,
          sort: [{ field: "time", direction: "desc" }],
          maxRecords: 1,
        })
        .firstPage()
    )[0].get("time") as number;
    const duration = (end - start) / 1000 / 60 / 60;

    return new Response(
      `${greeting}I'm Dominic. I'm a highschool student from Pennsylvania.

I like working on cool code things and cool non-code things.
I didn't like my website and didn't want to remake it, so now it's just plain text.
${duration > 0 && `Last night I got about ${duration} hours of sleep.`}

${
  repos.length > 0 &&
  `Here's some stuff I've been working on recently:
${projects}`
}

My Github username is mrhappyma, and my email is my name at this domain.`
    );
  },
});
