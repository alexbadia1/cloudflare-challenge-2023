export function onRequest(context) {
  return new Response(
    JSON.stringify({
      name: "Alex Badia",
      homepage: "https://cloudflare-api.abadia2.workers.dev",
      githubURL: "https://github.com/alexbadia1",
      interestingFact:
        "I don't look tough, but I played roller hockey a lot as a kid",
      skills: ["Weightlifting", "Chess", "Piano"],
    })
  );
}
