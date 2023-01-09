import { useEffect, useState } from "react";

//@ts-ignore
export const MusicKit = window.MusicKit;

const configureAM = async () => {
  try {
    await MusicKit.configure({
      developerToken:
        "eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk1OFFRRFM4NlYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJaR1A2TEgzN1ZBIiwiZXhwIjoxNjczMzE3MzIyLCJpYXQiOjE2NzMyNzQxMjJ9.Y7sr6E0PkOqI436q-Db8d1KhIs6Lv8xyWoQHNVNx-3U5A0o99FeNCvcaZ0aglirQkUyOh-oDho-8ozgvvyD9Zw",
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
  useEffect(() => {
    const run = async () => {
      const music = MusicKit.getInstance();
      if (authorised) {
        const result = await music.api.music("v1/me/library/playlists");
        console.log(result.data.data)
        setPlaylists(result.data.data);
      }
    };
    run();
  }, [authorised]);

  const loginClick = async () => {
    const music = MusicKit.getInstance();

    await music.authorize();
    setAuthorised(true);
  };

  return (
    <>
      <button onClick={loginClick}>Sign into AM</button>
      {authorised && (
        <div>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>{playlist.attributes.name}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default AppleMusic;
