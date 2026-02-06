import { Home, Building2, ArrowLeftRight, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
          activeClassName="text-primary"
          end
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </NavLink>
        <NavLink
          to="/properties"
          className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
          activeClassName="text-primary"
        >
          <Building2 className="h-5 w-5" />
          <span className="text-xs">Properties</span>
        </NavLink>
        <NavLink
          to="/transactions"
          className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
          activeClassName="text-primary"
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-xs">Transactions</span>
        </NavLink>
        <NavLink
          to="/settings"
          className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
          activeClassName="text-primary"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
