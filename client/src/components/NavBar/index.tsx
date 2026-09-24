import React, { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import logo from "@/assets/tinyhouse-logo.png";
import { useViewer } from "../../contexts/ViewerContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { LOG_OUT } from "../../mutations";
import { useMutation } from "@apollo/client";

export const NavBar: React.FC = () => {
  const { viewer: user, setViewer } = useViewer();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [logOut] = useMutation(LOG_OUT, {
    onCompleted: () => {
      setViewer({
        id: null,
        token: null,
        avatar: null,
        hasWallet: null,
        didRequest: true,
      });
      setIsDropdownOpen(false);
      sessionStorage.removeItem("token");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  // Keep the search box in sync with the /listings/:location route.
  useEffect(() => {
    const match = location.pathname.match(/^\/listings\/(.+)$/);
    setSearch(match ? decodeURIComponent(match[1]) : "");
  }, [location.pathname]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? `/listings/${encodeURIComponent(value)}` : "/listings");
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const dropdownRef = useClickOutside<HTMLDivElement>(closeDropdown);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-white shadow-md">
      <header className="p-4 flex justify-between items-center container mx-auto">
        <div>
          <Link to="/">
            <img src={logo} alt="TinyHouse Logo" className="h-8 md:h-10" />
          </Link>
        </div>
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-md mx-6 items-center border border-gray-300 rounded-full px-4 py-2 focus-within:border-blue-500"
          role="search"
        >
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 'San Francisco'"
            aria-label="Search listings by location"
            className="flex-1 outline-none bg-transparent text-sm text-gray-800"
          />
        </form>
        <div className="flex items-center gap-4">
          <Link to="/host">
            <button className="text-gray-700 hover:text-blue-500 transition duration-300">
              Host
            </button>
          </Link>
          {user?.id ? (
            <div className="relative" ref={dropdownRef}>
              <img
                src={user?.avatar as string}
                alt="User Avatar"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full cursor-pointer"
                onClick={handleAvatarClick}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                  <Link
                    to={`/user/${user.id}`}
                    onClick={closeDropdown}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};
