const ME = {
  name: "Alex Badia",
  homepage: "https://4a2c4e9e.cloudflare-frontend-dw6.pages.dev",
  githubURL: "https://github.com/alexbadia1",
  interestingFact: "I'm a 'Go big or go home' type of person.",
  skills: ["Weightlifting", "Chess", "Piano"],
};

export const onRequestGet: PagesFunction = async (context) => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=utf-8");
  return new Response(
    JSON.stringify(ME), 
    {
      status: 200,
      headers: headers
    } as ResponseInit
  );
};
