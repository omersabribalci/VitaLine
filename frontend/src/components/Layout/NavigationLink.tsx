import { NavLink } from "react-router";
import type { NavigationLinkProps } from "../../types";
import type { FC } from "react";

const NavigationLink: FC<NavigationLinkProps> = ({ title, link, item }) => {
  return (
    <NavLink to={link} end>
      {({ isActive }) => (
        <div className="flex flex-row items-center gap-2">
          <item.icon />
          <span className={isActive ? "active" : ""}>{title}</span>
        </div>
      )}
    </NavLink>
  );
};

export default NavigationLink;
