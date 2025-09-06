import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard for MVP demo
  redirect('/dashboard');
}
