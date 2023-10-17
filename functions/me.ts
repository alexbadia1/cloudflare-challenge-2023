const ME = {
  name: "Alex Badia",
  homepage: "",
  githubURL: "https://github.com/alexbadia1/cloudflare-front-end",
  interestingFact: "",
  skills: ["Backend Development", "Cybersecurity", "Distributed Systems", "Java", "Python", "TypeScript"],
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
