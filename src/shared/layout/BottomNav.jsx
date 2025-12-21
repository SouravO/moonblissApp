import { useState, useRef, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import {
  homeOutline,
  home,
  headset,
  headsetOutline,
  basket,
  basketOutline,
  calendar,
  calendarOutline,
  personOutline,
  person,
} from "ionicons/icons";
import { useLocation, useHistory } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const history = useHistory();
  const [activeIndex, setActiveIndex] = useState(0);

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
      setActiveIndex(index);
      history.push(path);
    }
  };

  return (
    <>
      {/* Premium Floating Nav Animations */}
      <style>{`
        @keyframes floatingPulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 12px 32px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        }
        
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        .nav-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
        }
        
        .floating-nav {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15), 
                      0 0 1px rgba(255, 255, 255, 0.1) inset;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .floating-nav:hover {
          background: rgba(0, 0, 0, 0.75);
          box-shadow: 0 12px 32px rgba(168, 85, 247, 0.25), 
                      0 0 1px rgba(255, 255, 255, 0.15) inset;
        }
        
        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: rgba(255, 255, 255, 0.6);
        }
        
        .nav-item:hover {
          background: rgba(168, 85, 247, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.2) 100%);
          color: #a855f7;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.4), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.3;
          animation: floatingPulse 2s ease-in-out infinite;
        }
        
        .nav-icon {
          font-size: 24px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1;
        }
        
        .nav-item.active .nav-icon {
          animation: iconFloat 1.5s ease-in-out infinite;
        }
        
        .nav-item:active {
          transform: scale(0.92);
        }
        
        .nav-item:active .nav-icon {
          animation: none;
        }
      `}</style>

      <div className="nav-container">
        <nav className="floating-nav">
          {tabs.map((tab, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(index, tab.path)}
                className={`nav-item ${isSelected ? "active" : ""}`}
                title={tab.label}
              >
                <IonIcon
                  icon={isSelected ? tab.iconActive : tab.icon}
                  className="nav-icon"
                />
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default BottomNav;
