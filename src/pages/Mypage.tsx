import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

type SupabaseUserMetadata = {
  full_name?: string;
};

type SupabaseUser = {
  id: string;
  email: string | null;
  user_metadata?: SupabaseUserMetadata;
};

type RecentTrack = {
  id: number;
  track_name: string;
  artist_name: string;
  url: string;
  emotion: string;
};

const MyPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndTracks = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError.message);
          setError('사용자 정보를 불러올 수 없습니다.');
          navigate('/login');
          return;
        }

        if (!userData?.user) {
          setError('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        setUser({
          id: userData.user.id,
          email: userData.user.email ?? null,
          user_metadata: userData.user.user_metadata,
        });

        const { data: tracks, error: tracksError } = await supabase
          .from('recent_tracks')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('id', { ascending: false })
          .limit(30);

        if (tracksError) {
          console.error('Error fetching tracks:', tracksError.message);
          setError('최근 재생 목록을 불러오는 중 문제가 발생했습니다.');
        } else {
          setRecentTracks(tracks || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTracks();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-10 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">
          최근 재생한 곡들
        </h1>

        {user && (
          <p className="text-center mb-4 text-lg">
            <span className="font-bold">
              {user.user_metadata?.full_name || user.email}
            </span>
          </p>
        )}

        {loading ? (
          <p className="text-center">Loading..🎵</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : recentTracks.length === 0 ? (
          <p className="text-center">최근에 재생한 곡이 없어요..</p>
        ) : (
          <div>
            {recentTracks.map((track) => (
              <a
                key={track.id}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition mb-4"
              >
                <h3 className="font-bold text-pink-300">{track.track_name}</h3>
                <p className="text-gray-300">{track.artist_name}</p>
                <p className="text-sm text-gray-400">
                  Emotion: {track.emotion}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
