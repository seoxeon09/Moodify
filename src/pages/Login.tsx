import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('정확한 이메일을 입력해주세요!'),
  password: z.string().min(6, '비밀번호는 최소 6자리 이상 입력해주세요!'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [notes, setNotes] = useState<
    { id: number; x: number; y: number; size: number; speed: number }[]
  >([]);

  useEffect(() => {
    const initialNotes = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      speed: 0.05 + Math.random() * 0.1,
    }));
    setNotes(initialNotes);

    const interval = setInterval(() => {
      setNotes((prev) =>
        prev
          .map((note) => ({
            ...note,
            y: note.y + note.speed,
          }))
          .map((note) =>
            note.y > 100 ? { ...note, y: 0, x: Math.random() * 100 } : note
          )
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const {
    register: formRegister,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { email, password } = data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('password', {
          message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        });
      } else if (error.message.includes('Email not confirmed')) {
        setError('email', {
          message: '이메일 인증을 완료해주세요!',
        });
      } else {
        setError('password', { message: `로그인 실패: ${error.message}` });
      }
    } else {
      navigate('/main');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-purple-700 via-pink-600 to-pink-400">
      {notes.map((note) => (
        <span
          key={note.id}
          className="absolute text-white opacity-20 animate-bounce"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}rem`,
            transition: 'top 0.05s linear',
          }}
        >
          🎵
        </span>
      ))}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 bg-gray-900 p-10 rounded-2xl shadow-2xl w-96 flex flex-col gap-6 ring-2 ring-pink-400/50 animate-fade-in"
      >
        <h2 className="text-3xl font-black text-center text-pink-400 ">
          🎵Moodify
        </h2>

        <input
          type="email"
          placeholder="이메일"
          {...formRegister('email')}
          className="border border-pink-400 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
        />

        {errors.email &&
          errors.email.message !== '이메일 인증을 완료해주세요!' && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            {...formRegister('password')}
            className="border border-pink-300 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-xl rounded-full px-2 py-1 text-gray-400 hover:text-pink-300 transition"
          >
            {showPassword ? '🙉' : '🙈'}
          </button>
        </div>

        {(errors.password ||
          (errors.email &&
            errors.email.message === '이메일 인증을 완료해주세요!')) && (
          <p className="text-red-500 text-sm">
            {errors.password ? errors.password.message : errors.email?.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg font-semibold shadow-md transition duration-200 disabled:opacity-50"
        >
          로그인
        </button>

        <p className="text-center text-sm text-gray-300">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-pink-400 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
