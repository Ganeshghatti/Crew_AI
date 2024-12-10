/** Icons are imported separatly to reduce build time */
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import UserIcon from "@heroicons/react/24/outline/UserIcon";
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon";
import CurrencyDollarIcon from "@heroicons/react/24/outline/CurrencyDollarIcon";
import InboxArrowDownIcon from "@heroicons/react/24/outline/InboxArrowDownIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";
import { FaExchangeAlt } from "react-icons/fa";

const iconClasses = `h-6 w-6`;
const iconLargeClasses = `h-10 w-10`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    iconlarge: <Squares2X2Icon className={iconLargeClasses} />,
    name: "Dashboard",
    desc: "Home",
  },
  {
    path: "/app/transactions", // url
    icon: <FaExchangeAlt className={iconClasses} />, // icon component
    iconlarge: <FaExchangeAlt className={iconLargeClasses} />, // icon component
    name: "Transactions", // name that appear in Sidebar
    desc: "View all transactions",
  },
  {
    path: "/app/campaigns", // url
    icon: <CurrencyDollarIcon className={iconClasses} />, // icon component
    iconlarge: <CurrencyDollarIcon className={iconLargeClasses} />, // icon component
    name: "Campaigns", // name that appear in Sidebar
    desc: "Create new or Modify exisiting Campaign",
  },
  {
    path: "/app/Specialities", // url
    icon: <InboxArrowDownIcon className={iconClasses} />, // icon component
    iconlarge: <InboxArrowDownIcon className={iconLargeClasses} />, // icon component
    name: "Specialities", // name that appear in Sidebar
    desc: "Create new or Modify exisiting Speciality",
  },
  {
    path: "/app/services", // url
    icon: <BoltIcon className={iconClasses} />, // icon component
    iconlarge: <BoltIcon className={iconLargeClasses} />, // icon component
    name: "Services", // name that appear in Sidebar
    desc: "Create new or Modify exisiting Services",
  },
  {
    path: "/app/settings", //no url needed as this has submenu
    icon: <Cog6ToothIcon className={`${iconClasses} inline`} />, // icon component
    iconlarge: <Cog6ToothIcon className={`${iconLargeClasses} inline`} />, // icon component
    name: "Settings", // name that appear in Sidebar
    desc: "Modify settings",
  },
];

export default routes;
