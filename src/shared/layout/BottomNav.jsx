import { useState, useRef, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import {
  homeOutline,
  home,
  searchOutline,
  search,
  heartOutline,
  heart,
  notificationsOutline,
  notifications,
  personOutline,
  person,
  headset,
  basket,
  calendar,
  calendarOutline,
  headsetOutline,
  basketOutline,
} from "ionicons/icons";
import { useLocation, useHistory } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const history = useHistory();
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const indicatorRef = useRef(null);

  const tabs = [
    { path: "/health", icon: homeOutline, iconActive: home, label: "Home" },
    {
      path: "/activities",
      icon: headsetOutline,
      iconActive: headset,
      label: "Activities",
    },
    { path: "/shop", icon: basketOutline, iconActive: basket, label: "Shop" },
    {
      path: "/calendar",
      icon: calendarOutline,
      iconActive: calendar,
      label: "Calendar",
    },
    {
      path: "/profile",
      icon: personOutline,
      iconActive: person,
      label: "Profile",
    },
  ];

  // Sync active index with current route
  useEffect(() => {
    const currentIndex = tabs.findIndex(
      (tab) => tab.path === location.pathname
    );
    if (currentIndex !== -1 && currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  const handleTabClick = (index, path) => {
    if (index !== activeIndex) {
      // Calculate animation magnitude based on distance
      const magnitude = Math.min(Math.abs(index - activeIndex), 4);
      const direction = index > activeIndex ? "right" : "left";

      // Apply stretch animation
      setAnimationClass(`stretch-${magnitude} stretch-${direction}`);

      // Remove animation class after animation completes
      setTimeout(() => {
        setAnimationClass("");
      }, 250);

      setActiveIndex(index);
      history.push(path);
    }
  };

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes stretchRight1 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(1.8, 0.7); border-radius: 1rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchRight2 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(2.4, 0.65); border-radius: 0.875rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchRight3 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(3, 0.6); border-radius: 0.75rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchRight4 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(3.5, 0.55); border-radius: 0.625rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchLeft1 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(1.8, 0.7); border-radius: 1rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchLeft2 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(2.4, 0.65); border-radius: 0.875rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchLeft3 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(3, 0.6); border-radius: 0.75rem; }
          100% { transform: scale(1, 1); }
        }
        @keyframes stretchLeft4 {
          0% { transform: scale(1, 1); }
          50% { transform: scale(3.5, 0.55); border-radius: 0.625rem; }
          100% { transform: scale(1, 1); }
        }
        .stretch-1.stretch-right { animation: stretchRight1 0.2s ease-out; transform-origin: left center; }
        .stretch-2.stretch-right { animation: stretchRight2 0.22s ease-out; transform-origin: left center; }
        .stretch-3.stretch-right { animation: stretchRight3 0.24s ease-out; transform-origin: left center; }
        .stretch-4.stretch-right { animation: stretchRight4 0.26s ease-out; transform-origin: left center; }
        .stretch-1.stretch-left { animation: stretchLeft1 0.2s ease-out; transform-origin: right center; }
        .stretch-2.stretch-left { animation: stretchLeft2 0.22s ease-out; transform-origin: right center; }
        .stretch-3.stretch-left { animation: stretchLeft3 0.24s ease-out; transform-origin: right center; }
        .stretch-4.stretch-left { animation: stretchLeft4 0.26s ease-out; transform-origin: right center; }
      `}</style>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex justify-center z-50"
        style={{
          height: "calc(56px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <ul className="flex relative w-full max-w-md">
          {/* Active Indicator - Sliding pill */}
          <div
            ref={indicatorRef}
            className="absolute top-0 h-full flex justify-center items-start pt-1 pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)]"
            style={{
              width: "20%",
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          >
            <div
              className={`w-10 h-10 bg-emerald-100 rounded-full border-4 border-white ${animationClass}`}
            />
          </div>

          {/* Tab Items */}
          {tabs.map((tab, index) => {
            const isSelected = index === activeIndex;
            return (
              <li
                key={tab.path}
                onClick={() => handleTabClick(index, tab.path)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer z-10
                  transition-all duration-200
                  ${
                    isSelected
                      ? "text-gray-900 font-medium"
                      : "text-gray-400 font-light"
                  }
                `}
              >
                <IonIcon
                  icon={isSelected ? tab.iconActive : tab.icon}
                  className={`
                    text-2xl transition-all duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)]
                    ${
                      isSelected
                        ? "-translate-y-1 text-emerald-600"
                        : "text-gray-400"
                    }
                  `}
                />
                <span className="text-[0.65rem] tracking-wide">
                  {tab.label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default BottomNav;
