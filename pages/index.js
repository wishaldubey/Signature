import Head from 'next/head';
import Canvas from '../components/Canvas';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <Head>
        <title>Drawing App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 transition-transform duration-300 ease-in-out transform hover:scale-110">
          Draw Here
        </h1>
        <Canvas />
      </main>
    </div>
  );
}
