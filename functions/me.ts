interface MeResponse {
  name: string;
  homepage: string;
  githubURL: string;
  interestingFact: string;
  skills: string[];
}

const ME_RESPONSE: MeResponse = {
  name: "Alex Badia",
  homepage: "",
  githubURL: "https://github.com/alexbadia1/cloudflare-front-end",
  interestingFact: "",
  skills: [
    "Backend Development",
    "Cybersecurity",
    "Distributed Systems",
    "Java",
    "Python",
    "TypeScript",
  ],
};

/**
 * This endpoint serves a way to display information about you. Please
 * include your name, an interesting fact and some of your skills and
 * any of the following that applies to you.
 *
 * Response format: {@link MeResponse}.
 *
 * @param {EventContext} context
 * @returns {MeResponse}
 */
export const onRequestGet: PagesFunction = async (context) => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(JSON.stringify(ME_RESPONSE), {
    status: 200,
    headers: headers,
  } as ResponseInit);
};
