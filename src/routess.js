import React from "react";

import { Icon } from "@chakra-ui/react";
import { MdDashboard } from "react-icons/md";
import { AiOutlineStock } from "react-icons/ai";
import { SlGraph } from "react-icons/sl";
import { TbBrandGraphql } from "react-icons/tb";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/dataTables";
// import RTL from "views/admin/rtl";

// Auth Imports
// import SignInCentered from "views/auth/signIn";

const routess = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdDashboard} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "Today's Stocks",
    layout: "/admin",
    path: "/todays-stock",
    icon: (
      <Icon
        as={AiOutlineStock}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: NFTMarketplace,
    secondary: true,
  },
  {
    name: "Available Stocks",
    layout: "/admin",
    icon: <Icon as={SlGraph} width='20px' height='20px' color='inherit' />,
    path: "/available-stocks",
    component: DataTables
  },
  {
    name: "Sold Stocks",
    layout: "/admin",
    path: "/sold-stocks",
    icon: <Icon as={TbBrandGraphql} width='20px' height='20px' color='inherit' />,
    component: Profile,
  },
  // {
  //   name: "Sign In",
  //   layout: "/auth",
  //   path: "/sign-in",
  //   icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
  //   component: SignInCentered,
  // },
];

export default routess;

