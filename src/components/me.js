import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Me = () => {
  const [me, setMe] = useState({});

  useEffect(() => {
    const getMe = async () => {
      const resp = await fetch(`/me`);
      const me = await resp.json();
      setMe(me);
    };
    getMe();
  }, []);

  if (!Object.keys(post).length) return <div />;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.text}</p>
      <p>
        <em>{JSON.stringify(me)}</em>
      </p>
      <p>
        <Link to="/">Go back</Link>
      </p>
    </div>
  );
};

export default Me;
