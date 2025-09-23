import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  username: z.string().min(2, '이름은 최소 2글자 이상 입력해주세요.'),
  email: z.string().email('정확한 이메일을 입력해주세요!'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자리 이상 입력해주세요!')
    .regex(/[?!@*]/, '비밀번호에는 특수문자(?,!,@,*)를 포함해주세요.'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState<'red' | 'blue'>('red');
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
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const { username, email, password } = data;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if ((signUpData?.user?.identities?.length ?? 0) === 0 && signUpData?.user) {
      setMessage('이미 가입된 계정입니다.');
      setMessageColor('red');
      return;
    }

    if (error) {
      setMessage(`회원가입 실패: ${error.message}`);
      setMessageColor('red');
    } else {
      setMessage('회원가입이 완료됐습니다! 이메일을 확인해주세요.');
      setMessageColor('blue');
      setTimeout(() => navigate('/login'), 1500);
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
        <h2 className="text-3xl font-black text-center text-pink-400">
          🎵Moodify
        </h2>

        <input
          type="text"
          placeholder="사용자 이름"
          {...formRegister('username')}
          className="border border-pink-400 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}

        <input
          type="email"
          placeholder="이메일"
          {...formRegister('email')}
          className="border border-pink-400 bg-gray-900 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        {errors.email && (
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
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        {message && (
          <p
            className={`text-sm font-medium ${
              messageColor === 'red' ? 'text-red-500' : 'text-blue-400'
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg font-semibold shadow-md transition duration-200 disabled:opacity-50"
        >
          회원가입
        </button>

        <p className="text-center text-sm text-gray-300">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="text-pink-400 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
