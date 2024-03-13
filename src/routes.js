import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdOutlineShoppingCart,
} from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaHandshake } from "react-icons/fa";
import { TfiDropboxAlt } from "react-icons/tfi";
import { MdOutlineRotate90DegreesCw } from "react-icons/md";
import { FaWpforms } from "react-icons/fa6";
import { BsBank2 } from "react-icons/bs";
import { TbReportSearch } from "react-icons/tb";
import { RiFileHistoryFill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { MdAutoDelete } from "react-icons/md";


// Admin Imports
import Customer from "views/RecordVault/Customer/Customer";
import Dealer from "views/RecordVault/Dealer/Dealer"
import Products from "views/RecordVault/Products/Products"
import UpdateRate from "views/RecordVault/UpdateRate/UpdateRate";
import NewForm from "views/RecordVault/NewForm/NewForm";
import Due from "views/RecordVault/Due/Due";
import Report from "views/RecordVault/Report/Report";
import Curd from "views/RecordVault/Curd/Curd";
import PurchaseForm from "views/RecordVault/PurchaseForm/PurchaseForm";
import SaleForm from "views/RecordVault/Sale/Sale";
import SoldStocks from "views/RecordVault/Sold/Sold";
import DeleteFiles from "views/RecordVault/DeleteFiles/DeleteFiles";

const routes = [
  {
    name: "Customer",
    layout: "/creates",
    path: "/customer",
    icon: <Icon as={FaPeopleGroup} width='20px' height='20px' color='inherit' />,
    component: Customer,
  },
  {
    name: "Dealer",
    layout: "/creates",
    path: "/dealer",
    icon: (
      <Icon
        as={FaHandshake}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: Dealer,
    secondary: true,
  },
  {
    name: "Products",
    layout: "/creates",
    icon: <Icon as={TfiDropboxAlt} width='20px' height='20px' color='inherit' />,
    path: "/products",
    component: Products
  },
  {
    name: "Purchase",
    layout: "/creates",
    icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' />,
    path: "/purchase",
    component: PurchaseForm
  },
  {
    name: "Sales",
    layout: "/creates",
    icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
    path: "/sales",
    component: SaleForm
  },
  {
    name: "Update Rate",
    layout: "/creates",
    path: "/update-rate",
    icon: <Icon as={MdOutlineRotate90DegreesCw} width='20px' height='20px' color='inherit' />,
    component: UpdateRate,
  },
  {
    name: "New Form",
    layout: "/creates",
    path: "/new-form",
    icon: <Icon as={FaWpforms} width='20px' height='20px' color='inherit' />,
    component: NewForm,
  },
  {
    name: "Due",
    layout: "/creates",
    path: "/due",
    icon: <Icon as={BsBank2} width='20px' height='20px' color='inherit' />,
      component: Due,
  },
  {
    name: "Report",
    layout: "/creates",
    path: "/report",
    icon: <Icon as={TbReportSearch} width='20px' height='20px' color='inherit' />,
      component: Report,
  },
  {
    name: "Curd",
    layout: "/creates",
    path: "/curd",
    icon: <Icon as={RiFileHistoryFill} width='20px' height='20px' color='inherit' />,
      component: Curd,
  },
  {
    name: "Sold",
    layout: "/creates",
    path: "/sold",
    icon: <Icon as={LuHistory} width='20px' height='20px' color='inherit' />,
      component: SoldStocks,
  },
  {
    name: "Delete Files",
    layout: "/creates",
    path: "/delete-files",
    icon: <Icon as={MdAutoDelete} width='20px' height='20px' color='inherit' />,
      component: DeleteFiles,
  },
];

export default routes;

