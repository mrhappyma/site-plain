const greetings = [
  "Hi, ",
  "Howdy, ",
  "Hey, ",
  "hellooooooooooooooooooooooooooooooooooooooooooooooo.\n",
];

Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (new URL(req.url).pathname == "/favicon.ico")
      return new Response(null, { status: 404 });

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    return new Response(
      `${greeting}I'm Dominic. I'm a highschool student from Pennsylvania.

I like working on cool code things and cool non-code things.
I didn't like my website and didn't want to remake it, so now it's just plain text.

My Github username is mrhappyma, and my email is my name at this domain.`
    );
  },
});
