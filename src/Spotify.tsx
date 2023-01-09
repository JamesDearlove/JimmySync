import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";

const CLIENT_ID = "cb680aa9619149778ad60d575fdcb8c5";
const REDIRECT_URI = "http://localhost:5173";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["playlist-read-private"];

const spotifyApi = new SpotifyWebApi();

const Spotify = () => {
  // const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // Login and Callback handling
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      //@ts-ignore
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    // setToken(token ?? "");
    spotifyApi.setAccessToken(token);
    setLoggedIn(token !== null);
  }, []);

  const loginClick = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join(
      "%20"
    )}`;
  };

  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const result = await spotifyApi.getUserPlaylists();
      setPlaylists(result.items);
    };

    if (loggedIn) {
      run();
    }
  }, [loggedIn]);

  return (
    <>
      <button onClick={loginClick}>Sign into Spotify</button>
      {loggedIn && (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id}>{playlist.name}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Spotify;
