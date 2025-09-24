import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

type Track = {
  name: string;
  artist: string;
  url: string;
};

type LastFmTopTracksResponse = {
  tracks: {
    track: {
      name: string;
      artist: { name: string };
      url: string;
    }[];
  };
};

type LastFmTrackSearchResponse = {
  results: {
    trackmatches: {
      track: {
        name: string;
        artist: string;
        url: string;
      }[];
    };
  };
};

const emotions = ['Sad', 'Happy', 'Angry', 'Chill'];

const emotionDisplay: Record<string, string> = {
  Sad: 'Sad😭',
  Happy: 'Happy😊',
  Angry: 'Angry😡',
  Chill: 'Chill🫠',
};

const Main = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmotionTracks = async (emotion: string) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
      const response = await axios.get<LastFmTopTracksResponse>(
        `https://ws.audioscrobbler.com/2.0/`,
        {
          params: {
            method: 'tag.gettoptracks',
            tag: emotion.toLowerCase(),
            api_key: apiKey,
            format: 'json',
            limit: 10,
          },
        }
      );

      const data =
        response.data.tracks?.track?.map((t) => ({
          name: t.name,
          artist: t.artist.name,
          url: t.url,
        })) || [];

      setTracks(data);

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        for (const track of data) {
          await supabase.from('recent_tracks').insert({
            user_id: userData.user.id,
            track_name: track.name,
            artist_name: track.artist,
            url: track.url,
            emotion,
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert('곡을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
      const response = await axios.get<LastFmTrackSearchResponse>(
        `https://ws.audioscrobbler.com/2.0/`,
        {
          params: {
            method: 'track.search',
            track: searchQuery,
            api_key: apiKey,
            format: 'json',
            limit: 10,
          },
        }
      );

      const data =
        response.data.results?.trackmatches?.track?.map((t) => ({
          name: t.name,
          artist: t.artist,
          url: t.url,
        })) || [];

      setTracks(data);
    } catch (err) {
      console.error(err);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <div className="relative z-10 bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col gap-6 ring-2 ring-pink-400/50 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-center text-pink-400">
          🎵 Moodify
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchTracks();
          }}
          className="flex justify-center gap-2"
        >
          <input
            type="text"
            placeholder="노래나 아티스트 검색하세요!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-pink-400 bg-gray-800 text-white w-64 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            className="bg-pink-400 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
          >
            검색
          </button>
        </form>

        <div className="flex gap-4 justify-center flex-wrap">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => fetchEmotionTracks(emotion)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
            >
              {emotionDisplay[emotion]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-300">Loading..🎵</p>
        ) : tracks.length === 0 ? (
          <p className="text-center text-gray-300">No results 😖</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track, idx) => (
              <a
                key={idx}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition border border-pink-400/20"
              >
                <h3 className="font-bold text-pink-300">{track.name}</h3>
                <p className="text-gray-300">{track.artist}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
