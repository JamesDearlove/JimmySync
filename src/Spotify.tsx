import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { importToAM } from "./AppleMusic";

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

  // Get playlists from logged in user
  // const [playlists, setPlaylists] = useState<any[]>([]);

  // useEffect(() => {
  //   const run = async () => {
  //     const result = await spotifyApi.getUserPlaylists();
  //     setPlaylists(result.items);
  //   };

  //   if (loggedIn) {
  //     run();
  //   }
  // }, [loggedIn]);

  const [playlistId, setPlaylistId] = useState("5GDX1Uq6Qt3LrIzwtHpXe4");

  const [playlist, setPlaylist] = useState<SpotifyApi.SinglePlaylistResponse>();
  const [allTracks, setAllTracks] = useState<SpotifyApi.PlaylistTrackObject[]>();

  const getPlaylist = async () => {
    // 5GDX1Uq6Qt3LrIzwtHpXe4
    const result = await spotifyApi.getPlaylist(playlistId);
    console.log(result);
    setPlaylist(result);

    const total = result?.tracks.total ?? 0;

    const tracks = result?.tracks.items;
    if (!tracks?.length) {
      return;
    }

    while (tracks.length < total) {
      const moreTracks = await spotifyApi.getPlaylistTracks(playlistId, {
        limit: 100,
        offset: tracks.length,
      });
      tracks.push(...moreTracks.items);
    }

    console.log(tracks);
    setAllTracks(tracks);
  };

  const clickCopyAM = () => {
    if (playlist) {
      importToAM(playlist.name, playlist.description ?? "", allTracks ?? [])
    }
  }


  return (
    <>
      <button onClick={loginClick}>{loggedIn && "✅"} Sign into Spotify</button>
      {loggedIn && (
        <>
          <div>
            <input
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
            />
            <button onClick={getPlaylist}>Find</button>
          </div>
          {playlist && (
            <div>
              <h3>{playlist.name}</h3>
              <p>{playlist.description}</p>
              <p>Song Count: {allTracks?.length}</p>
              <button onClick={clickCopyAM}>Copy to AM</button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Spotify;
