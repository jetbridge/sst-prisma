import Image from 'next/image';
import { LoginButton } from './ui/LoginButton';
import { TestGql } from './ui/TestGql';
import Home from '@/lib/component/home/Home';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Home />
    </main>
  );
}
