import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useViewer } from "../../context/ViewerContext";
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
        avatar: null,
        didRequest: false,
      });
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
            <img
              src="/src/assets/tinyhouse-logo.png"
              alt="TinyHouse Logo"
              className="h-8 md:h-10"
            />
          </Link>
        </div>
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
                    to="/profile"
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
