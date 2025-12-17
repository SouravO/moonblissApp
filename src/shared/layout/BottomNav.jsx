import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { heart, cart, person } from "ionicons/icons";
import { useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const tabs = [
    { path: "/health", icon: heart, label: "Health" },
    { path: "/store", icon: cart, label: "Store" },
    { path: "/profile", icon: person, label: "Profile" },
  ];

  return (
    <IonTabBar
      slot="bottom"
      className="border-t border-gray-200 shadow-lg"
      style={{
        "--background": "linear-gradient(to top, #ffffff, #fafafa)",
        "--color": "#6b7280",
        "--color-selected": "#ec4899",
      }}
    >
      {tabs.map((tab) => {
        const isSelected = location.pathname === tab.path;
        return (
          <IonTabButton
            key={tab.path}
            tab={tab.label.toLowerCase()}
            href={tab.path}
            selected={isSelected}
            className={`
              relative transition-all duration-300 ease-in-out
              ${
                isSelected
                  ? "transform scale-110"
                  : "opacity-70 hover:opacity-100"
              }
            `}
          >
            <IonIcon
              icon={tab.icon}
              className={`
                transition-all duration-300
                ${isSelected ? "text-2xl mb-1 animate-bounce" : "text-xl"}
              `}
              style={{
                color: isSelected ? "#ec4899" : "#6b7280",
              }}
            />
            <IonLabel
              className={`
                text-xs font-medium transition-all duration-300
                ${isSelected ? "font-bold" : "font-normal"}
              `}
              style={{
                color: isSelected ? "#ec4899" : "#6b7280",
              }}
            >
              {tab.label}
            </IonLabel>
            {isSelected && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse" />
            )}
          </IonTabButton>
        );
      })}
    </IonTabBar>
  );
};

export default BottomNav;
