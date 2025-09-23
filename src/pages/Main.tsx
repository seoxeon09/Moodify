import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

type Track = {
  name: string;
  artist: string;
  url: string;
};

const emotions = ['슬픔', '행복', '분노', '편안함'];

const emotionMap: Record<string, string> = {
  슬픔: 'sad',
  행복: 'happy',
  분노: 'angry',
  편안함: 'chill',
};

const Main = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmotionTracks = async (emotion: string) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
      const response = await axios.get(`https://ws.audioscrobbler.com/2.0/`, {
        params: {
          method: 'tag.gettoptracks',
          tag: emotionMap[emotion] || emotion,
          api_key: apiKey,
          format: 'json',
          limit: 10,
        },
      });

      const data =
        response.data.tracks?.track?.map((t: any) => ({
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
      const response = await axios.get(`https://ws.audioscrobbler.com/2.0/`, {
        params: {
          method: 'track.search',
          track: searchQuery,
          api_key: apiKey,
          format: 'json',
          limit: 10,
        },
      });

      const data =
        response.data.results?.trackmatches?.track?.map((t: any) => ({
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
    <div className="min-h-screen bg-yellow-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Moodify</h1>

      <div className="flex justify-center mb-6 gap-2">
        <input
          type="text"
          placeholder="노래나 아티스트 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 w-64"
        />
        <button
          onClick={searchTracks}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          검색
        </button>
      </div>

      <div className="flex gap-4 justify-center mb-6">
        {emotions.map((emotion) => (
          <button
            key={emotion}
            onClick={() => fetchEmotionTracks(emotion)}
            className="bg-pink-300 text-white px-4 py-2 rounded hover:bg-pink-400"
          >
            {emotion}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center">Loading..🎵</p>
      ) : tracks.length === 0 ? (
        <p className="text-center">결과가 없습니다😖</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, idx) => (
            <a
              key={idx}
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <h3 className="font-bold">{track.name}</h3>
              <p>{track.artist}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Main;
