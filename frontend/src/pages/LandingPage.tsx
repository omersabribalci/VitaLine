import { Link } from "react-router";
import bgImage from "../assets/landing-bg.jpg";
import icon from "../assets/icon.png";
const LandingPage = () => {
  return (
    <div
      className="relative h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-blue-950/50 backdrop-brightness-75"></div>

      <div className="relative z-10 flex flex-col h-full px-6 md:px-16">
        <header className="flex justify-between items-center py-6">
          <div className="flex flex-row items-center gap-4 text-3xl font-extrabold text-white tracking-wider cursor-pointer">
            <img className="h-8 w-8" src={icon} />
            <span>Vita Line</span>
          </div>

          <Link
            to="/login"
            className="px-6 py-2 bg-white/10 hover:bg-white/25 border border-white/30 text-white rounded-full backdrop-blur-md transition-all font-medium text-sm"
          >
            Log In
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 md:p-10 rounded-4xl max-w-2xl text-center shadow-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wider mb-5">
              24/7 Smart Healthcare
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Reclaiming Your Health <br /> Just Got Easier
            </h1>

            <p className="text-base md:text-lg text-gray-200 mb-8 mx-auto font-light">
              Skip the waiting room. Book appointments with top specialists in
              seconds, view real-time schedules, and take control of your time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-6 py-3 rounded-full text-white font-bold bg-primary hover:bg-primary-hover shadow-lg shadow-primary/40 transition-all transform hover:-translate-y-1 text-sm"
              >
                Book Appointment
              </Link>

              <Link
                to="/register"
                className="px-6 py-3 rounded-full text-white font-bold bg-white/5 hover:bg-white/15 border border-white/20 backdrop-blur-sm transition-all text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-white/50 text-xs">
          {`© ${new Date().getFullYear()} Vita Line. All rights reserved.`}
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
