import Header from "./components/Header";
import Translator from "./components/Translator";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 min-h-screen w-screen">
      <Header />
      <main className="grow flex flex-col items-center justify-start px-4">
        <Translator />
      </main>
      <Footer />
    </div>
  );
}
