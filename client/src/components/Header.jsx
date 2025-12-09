import { Link } from "react-router-dom";
import { Squares2X2Icon } from "@heroicons/react/24/solid";

const Header = ({ boardTitle = null }) => {
  return (
    <header className="bg-header-bg/80 backdrop-blur-sm h-12 flex items-center px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Logo / Home Link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
        >
          <Squares2X2Icon className="w-5 h-5" />
          <span className="font-bold text-lg">TaskBoard</span>
        </Link>

        {/* Board Title */}
        {boardTitle && (
          <>
            <span className="text-white/50">|</span>
            <h1 className="text-white font-semibold">{boardTitle}</h1>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Active Users Indicator - Placeholder */}
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium border-2 border-header-bg">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
