import pLimit from "p-limit";
import { useEffect, useState } from "react";

//@ts-ignore
export const MusicKit = window.MusicKit;

export const importToAM = async (
  name: string,
  description: string,
  tracks: SpotifyApi.PlaylistTrackObject[]
) => {
  const music = MusicKit.getInstance();

  await music.authorize();

  const queryParameters = { l: "en-au" };

  const amTracks: string[] = [];

  const apiLimit = pLimit(10);

  // tracks.forEach(async (track) => {
  //   const foundTrack = await music.api.music(
  //     "/v1/catalog/{{storefrontId}}/search",
  //     {
  //       ...queryParameters,
  //       //@ts-ignore
  //       term: `${track.track.name} ${track.track.album.name}`,
  //       types: ["songs"],
  //     }
  //   );

  //   amTracks.push(foundTrack.data.results)
  // });

  const getTrack = async (track: SpotifyApi.PlaylistTrackObject) => {
    const foundTrack = await music.api.music(
      "/v1/catalog/{{storefrontId}}/search",
      {
        ...queryParameters,
        //@ts-ignore
        term: `${track.track.name} ${track.track.artists[0].name}`,
        types: ["songs"],
      }
    );

    amTracks.push(foundTrack.data.results);
    console.log(amTracks.length)
  };

  const startTimes: any[] = [];

  async function rateLimiter(track: SpotifyApi.PlaylistTrackObject) {
    const lastSecond = new Date().getTime() - 1000;
    if (startTimes.filter((v) => v > lastSecond).length >= 5) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    // TODO: cleanup startTimes to avoid memory leak
    startTimes.push(new Date().getTime());
    return getTrack(track);
  }

  await Promise.all(tracks.map((v) => apiLimit(() => rateLimiter(v))));

  console.log(amTracks);

  //@ts-ignore
  const notFound = amTracks.filter((search) => !search.songs)
  console.log("Not found tracks", notFound)

  const body = {
    attributes: { name: name, description: description },
    relationships: {
      //@ts-ignore
      tracks: { data: amTracks.filter((search) => search.songs).map((search) => ({id: search.songs.data[0].id, type: "songs"})) },
    },
  };
  const result = await music.api.music(
    "v1/me/library/playlists",
    queryParameters,
    {
      fetchOptions: { method: "POST", body: JSON.stringify(body) },
    }
  );

  const playlistId = result.data?.data[0].id;

  console.log(result);
};

const configureAM = async () => {
  try {
    await MusicKit.configure({
      developerToken: import.meta.env.VITE_AM_TOKEN,
      app: {
        name: "JimmySync Web",
        build: "0001.0.1",
      },
    });
  } catch (err) {
    // Handle configuration error
  }
};

const AppleMusic = () => {
  const [authorised, setAuthorised] = useState(false);

  // Setup MusicKit instance
  useEffect(() => {
    const run = async () => {
      configureAM();
    };
    run();
  }, []);

  const [playlists, setPlaylists] = useState<any[]>([]);

  // Get Playlists
  // useEffect(() => {
  //   const run = async () => {
  //     const music = MusicKit.getInstance();
  //     if (authorised) {
  //       const result = await music.api.music("v1/me/library/playlists");
  //       console.log(result.data.data)
  //       setPlaylists(result.data.data);
  //     }
  //   };
  //   run();
  // }, [authorised]);

  const loginClick = async () => {
    const music = MusicKit.getInstance();

    await music.authorize();
    setAuthorised(true);
  };

  return (
    <>
      <button onClick={loginClick}>{authorised && "✅"} Sign into AM</button>
      {/* {authorised && (
        <div>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>{playlist.attributes.name}</li>
            ))}
          </ul>
        </div>
      )} */}
    </>
  );
};

export default AppleMusic;
