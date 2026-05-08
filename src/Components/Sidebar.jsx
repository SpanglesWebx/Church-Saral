

import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { initFlowbite } from "flowbite";
import {
  MdDashboard, MdSpaceDashboard, MdCardMembership, MdLogout, MdAddCircleOutline,
  MdOutlineEmojiEvents, MdAddCard, MdPlaylistAdd, MdCreateNewFolder
} from "react-icons/md";
import { FaUser, FaPeopleRoof, FaRupeeSign, FaSackDollar } from "react-icons/fa6";
import { GiCash, GiMicrophone, GiPrayer, GiTakeMyMoney, GiTombstone, GiDove } from "react-icons/gi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiAuctionFill, RiSchoolFill, RiDashboardLine, } from "react-icons/ri";
import { IoIosMan } from "react-icons/io";
import { IoWomanSharp } from "react-icons/io5";

import { FaBook, FaUserFriends } from "react-icons/fa";
import { FaSchool, FaChildReaching } from "react-icons/fa6";
import { GrUserSettings } from "react-icons/gr";
import { RoleContext } from "./RoleContext";
import { BiSolidBuildingHouse } from "react-icons/bi";
import { TbGrave2, TbReportMoney, TbChecklist } from "react-icons/tb";
import { PiStudentBold } from "react-icons/pi";
import { IoDocumentAttachSharp } from "react-icons/io5";
import { LuAlarmClockCheck } from "react-icons/lu";
import { FaUserClock, FaMoneyBillWave, } from "react-icons/fa6";
import { SiTransmission } from "react-icons/si";
import { GiPiggyBank, GiPayMoney } from "react-icons/gi";
import { PiMedalFill } from "react-icons/pi";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { FaShop } from "react-icons/fa6";
import { GiMusicalNotes } from "react-icons/gi";
import { FaHouseChimneyMedical } from "react-icons/fa6";
import { FaHandHoldingHeart, FaFileInvoiceDollar } from "react-icons/fa";
import { BsCalendar2HeartFill } from "react-icons/bs";
import { MdHowToVote } from "react-icons/md";
import { FaBalanceScale, FaCrown, FaPeace } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt } from "react-icons/fa";
import churchLogo from "../assets/logo.png";
import { HiHomeModern } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi2";
import { FaBible } from "react-icons/fa";

import { GiThreeFriends } from "react-icons/gi";

import { MdDashboardCustomize } from "react-icons/md";
import { FaBell } from "react-icons/fa";

import { FaHandHoldingUsd } from "react-icons/fa";


import { FaUniversity } from "react-icons/fa";
import { GiWallet } from "react-icons/gi";



import { BiBuildingHouse } from "react-icons/bi";
import { FaHouseChimney } from "react-icons/fa6";
import { FaBoxes } from "react-icons/fa";

const menuConfig = [






  { label: "Dashboard", icon: MdDashboardCustomize, path: "/admin/dashmember", roles: ["member"] },
  { label: "Details", icon: FaUser, path: "/admin/detailsofmembers", roles: ["member"] },
  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/treasurerdash", roles: ["treasurer"] },
  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/accountantdash", roles: ["accountant"] },
  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/secretarydash", roles: ["secretary"] },
  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/churchofficeworkerdash", roles: ["churchofficeworker"] },



  { label: "Dashboard", icon: MdDashboard, path: "/admin/dashboard", roles: ["admin", "pastorprimary", "pastorsecondary"] },
  { label: "Dashboard", icon: MdDashboardCustomize, path: "/admin/churchadmindash", roles: ["churchadmin", "churchofficestaff"] },
  { label: "Families", icon: FaPeopleRoof, path: "/admin/familylist", roles: ["admin", "churchofficeworker", "churchadmin", "churchofficestaff"] }, //add only for church office worker

  { label: "Members", icon: FaUsers, path: "/admin/memberlist", roles: ["admin", "churchofficeworker", "churchadmin", "churchofficestaff"] },
  { label: "Pastors", icon: GiPrayer, path: "/admin/pastorlist", roles: ["admin", "secretary", "churchadmin", "churchofficestaff"] },
  // { label: "Pastor Dashboard", icon: MdSpaceDashboard, path: "/admin/pastordashboard", roles: ["admin", "pastorprimary"] },
  // { label: "Service Activities", icon: MdSpaceDashboard, path: "/admin/pastorserviceactivities", roles: ["admin", "pastorprimary"] },


  {
    label: "Church Minutes",
    icon: FaBook,
    roles: ['accountant', 'secretary', 'pastorprimary', 'treasurer', 'dcmember'],
    children: [
      { label: "Minutes", path: "/admin/minutes" },
      { label: "Agenda", path: "/admin/agenda" },
    ],
  },
  {
    label: "Offertory",
    icon: GiCash,
    roles: ["admin", "churchofficeworker", "treasurer", "accountant", "secretary", "churchadmin", "churchofficestaff"],
    children: [

      { label: "Offertory", icon: GiCash, path: "/admin/offertory/add-offerings" },
      { label: "Create Offertory", icon: MdCreateNewFolder, path: "/admin/offertory/create-offerings" },

    ],
  },



  {
    label: "General Accounts",
    icon: FaUniversity, // parent icon (bank style)
    roles: ["admin", "accountant", "treasurer", "churchadmin"],
    children: [
      {
        label: "Cash In Hands",
        path: "/admin/cashinhand",
        icon: GiWallet, // unique ledger icon
        roles: ["admin", "accountant", "treasurer", "churchadmin"],
      },
      {
        label: "Ledgers",
        path: "/admin/ledgers",
        icon: FaFileInvoiceDollar, // unique ledger icon
        roles: ["admin", "accountant", "treasurer", "churchadmin"],
      },
    ],
  },



  {
    label: "Marriage Halls",
    icon: BiBuildingHouse,


    roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
    children: [
      {
        label: "Halls",
        path: "/admin/marriage/hall",
        icon: BiBuildingHouse, // ✅ fixed icon
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Booking Hall",
        path: "/admin/marriage/booking-hall",
        icon: BsCalendar2HeartFill,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },

      {
        label: "Hall Assets",
        path: "/admin/marriage/hall-assets",
        icon: BiSolidBuildingHouse,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },

      {
        label: "Kitchen Assets",
        path: "/admin/marriage/hall-kitchen-assets",
        icon: FaBoxes,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },


      {
        label: "Issued Assets",
        path: "/admin/marriage/hall-kitchen-issued-assets",
        icon: FaHandHoldingUsd,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },
    ],
  },


  // {
  //   label: "Santha",
  //   icon: FaHandHoldingUsd,
  //   roles: ["admin", "secretary", "accountant", "treasurer", "churchadmin", "churchofficestaff"],
  //   children: [
  //     {
  //       label: "Members",
  //       icon: FaUsers,
  //       path: "/admin/santha/members",
  //       roles: ["admin", "secretary", "accountant", "treasurer", "churchadmin", "churchofficestaff"],
  //     },
  //     // {
  //     //   label: "Report",
  //     //   icon: HiOutlineDocumentReport,
  //     //   path: "/admin/santha/report",
  //     //   roles: ["admin", "accountant", "treasurer", "churchadmin", "churchofficestaff"],
  //     // }
  //   ]
  // },


  {
    label: "Choir",
    icon: GiMicrophone,
    roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"],
    children: [
      { label: "Members ", path: "/admin/choirlist", icon: FaUsers, roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', , 'churchadmin', "churchofficestaff"] },
      { label: "Masters", path: "/admin/choirmaster", icon: FaCrown, roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"] },
      { label: "Subscription", path: "/admin/choirsubscription", icon: MdCardMembership, roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"] },
      // { label: "Event", path: "/admin/choirevent", roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin'] },
      // { label: "Notifications", path: "/admin/choirnotification", roles: ['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin'] },
      { label: "Add Expense", path: "/admin/choiraddexpense", icon: MdAddCircleOutline, roles: ["choiraccountant"] },
      { label: "Paid Expense", path: "/admin/choirpaidexpense", icon: GiPayMoney, roles: ["choiraccountant"] },
      { label: "Choir Expense", path: "/admin/choirexpense", icon: TbChecklist, roles: ["choirsecretary"] },
      { label: "Approved Expense", path: "/admin/choirapprovedexpense", icon: TbReportMoney, roles: ["choirsecretary"] },
    ],
  },
  {
    label: "Endeavour",
    icon: RiSchoolFill,
    roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"],
    children: [
      { label: "Dashboard", path: "/admin/dashendschool", icon: RiDashboardLine, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Class", path: "/admin/classend", icon: FaChalkboardTeacher, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Teachers", path: "/admin/teacherend", icon: FaUsers, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Student", path: "/admin/studentend", icon: PiStudentBold, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Event", path: "/admin/eventend", icon: FaCalendarAlt, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Exam", path: "/admin/endeavourexam", icon: IoDocumentAttachSharp, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Auction", path: "/admin/studentauctionend", icon: RiAuctionFill, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Auction Report", path: "/admin/endeavouraucreport", icon: TbReportMoney, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      { label: "Offerings & Attendance", path: "/admin/endofferings", icon: FaSackDollar, roles: ["admin", "secretary", "endeavoursclscretary", "endeavourclaccountant", "accountant", "churchadmin", "churchofficestaff"] },
      {
        label: "Add Expense",
        path: "/admin/endeavouraddexpense",
        icon: MdAddCard,
        roles: ["endeavourclaccountant"],
      },
      {
        label: "Paid Expense",
        path: "/admin/endeavourpaidexpense",
        icon: GiPayMoney,
        roles: ["endeavourclaccountant"],
      },
      {
        label: "School Expense",
        icon: FaMoneyBillWave,
        path: "/admin/endeavourexpense",
        roles: ["endeavoursclscretary"],
      },
      {
        label: "Approved Expense",
        icon: TbReportMoney,

        path: "/admin/endeavourapprovedexpense",
        roles: ["endeavoursclscretary"],
      },
    ],
  },
  {
    label: "Sunday School",
    icon: FaSchool,
    roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
    children: [
      {
        label: "Dashboard",
        path: "/admin/dashsundayschool",
        icon: MdDashboardCustomize,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Class",
        path: "/admin/class",
        icon: FaChalkboardTeacher,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Teachers",
        path: "/admin/teacher",
        icon: FaUsers,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Student",
        path: "/admin/student",
        icon: PiStudentBold,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Event",
        path: "/admin/event",
        icon: FaCalendarAlt,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Exam",
        path: "/admin/exam",
        icon: IoDocumentAttachSharp,
        roles: ["admin", "secretary", "sundaysclscretary", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Auction",
        path: "/admin/studentauction",
        icon: RiAuctionFill,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Auction Report",
        path: "/admin/studentauctionreport",
        icon: TbReportMoney,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Offerings & Attendance",
        path: "/admin/sundayofferings",
        icon: FaSackDollar,
        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Add Expense",
        icon: MdAddCard,
        path: "/admin/sundayscladdexpense",
        roles: ["sundaysclaccountant"],
      },
      {
        label: "Paid Expense",
        icon: GiPayMoney,
        path: "/admin/sundaysclpaidexpense",
        roles: ["sundaysclaccountant"],
      },
      {
        label: "School Expense",
        icon: FaMoneyBillWave,
        path: "/admin/sundaysclexpense",
        roles: ["sundaysclscretary"],
      },
      {
        label: "Approved Expense",
        icon: TbReportMoney,
        path: "/admin/sundaysclapprovedexpense",
        roles: ["sundaysclscretary"],
      },

    ],
  },


  //   {
  //   label: "Santha",
  //  icon: GiDove, 
  //   roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin"],
  //   children: [
  //     {
  //       label: "Members",
  //       icon: FaUsers,
  //       path: "/admin/santha/members",
  //        roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin"],
  //     },
  //     // {
  //     //   label: "Reports",
  //     //   path: "/admin/santha/reports",
  //     //   roles: ["admin", "secretary", "sundaysclscretary", "sundaysclaccountant", "accountant", "churchadmin"],
  //     // }
  //   ]
  // },

  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/endeavourteacherdashboard", roles: ["endeavourteacher"] },
  { label: "Students", icon: PiStudentBold, path: "/admin/endeavourstudents", roles: ["endeavourteacher"] },
  { label: "Event", icon: MdOutlineEmojiEvents, path: "/admin/endeavourevent", roles: ["endeavourteacher"] },
  { label: "Exam", icon: IoDocumentAttachSharp, path: "/admin/endeavourteacherexam", roles: ["endeavourteacher"] },
  { label: "Auction Report", icon: TbReportMoney, path: "/admin/auctionreportendeavour", roles: ["endeavourteacher"] },
  { label: "Offerings and Attendance", icon: FaSackDollar, path: "/admin/endeavourofferingsandattendance", roles: ["endeavourteacher"] },



  { label: "Dashboard", icon: MdSpaceDashboard, path: "/admin/sundayschoolteacherdashboard", roles: ["sundaysclteacher"] },
  { label: "Students", icon: PiStudentBold, path: "/admin/sundayschoolstudents", roles: ["sundaysclteacher"] },
  { label: "Event", icon: MdOutlineEmojiEvents, path: "/admin/sundayschoolevent", roles: ["sundaysclteacher"] },
  { label: "Exam", icon: IoDocumentAttachSharp, path: "/admin/sundayschoolexam", roles: ["sundaysclteacher"] },
  { label: "Auction Report", icon: TbReportMoney, path: "/admin/sundayschoolreportforauction", roles: ["sundaysclteacher"] },
  { label: "Offerings and Attendance", icon: FaSackDollar, path: "/admin/sundayschoolofferingsandattendance", roles: ["sundaysclteacher"] },


  // {
  //   label: "Youth",
  //   icon: FaChildReaching,
  //   roles: ["admin", "secretary", "youthsecretary", "youthaccountant", "accountant"],
  //   children: [
  //     {
  //       label: "Youth Members",
  //       path: "/admin/youthlist",
  //       roles: ["admin", "secretary", "youthsecretary", "youthaccountant", "accountant"]
  //     },
  //     {
  //       label: "Youth Auction",
  //       path: "/admin/youthauction",
  //       roles: ["admin", "secretary", "youthsecretary", "youthaccountant", "accountant"]
  //     },
  //     {
  //       label: "Auction Report",
  //       path: "/admin/youthauctionreport",
  //       roles: ["admin", "secretary", "youthsecretary", "youthaccountant", "accountant"]
  //     },
  //     { label: "Add Expense", path: "/admin/youthaddexpense", roles: ["youthaccountant"] },
  //     { label: "Paid Expense", path: "/admin/youthpaidexpense", roles: ["youthaccountant"] },
  //     { label: "Youth Expense", path: "/admin/youthexpense", roles: ["youthsecretary"] },
  //     { label: "Approved Expense", path: "/admin/youthapprovedexpense", roles: ["youthsecretary"] },
  //   ],
  // },


  {
    label: "Women's Fellowship",
    icon: IoWomanSharp,
    roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles
    children: [
      {
        label: "Members",
        icon: FaUsers,
        path: "/admin/womenfellowmembers",
        roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles

      },
      {
        label: "Events",
        icon: FaCalendarAlt,
        roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles
        path: "/admin/womenfellowevent",
      },
      {
        label: "Activities",
        icon: FaHandHoldingHeart,
        path: "/admin/womenactivities",
        roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles

      },
      {
        label: "Auction",
        icon: RiAuctionFill,
        path: "/admin/womenauction",
        roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles

      },
      {
        label: "Auction Report",
        icon: TbReportMoney,
        path: "/admin/womenactionreport",
        roles: ["admin", "secretary", "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"], // parent roles

      },
      { label: "Add Expense", icon: MdAddCard, path: "/admin/womenaddexpense", roles: ["womenaccountant"] },
      { label: "Paid Expense", icon: GiPayMoney, path: "/admin/womenpaidexpense", roles: ["womenaccountant"] },
      { label: "Women Expense", icon: FaMoneyBillWave, path: "/admin/womenexpense", roles: ["womensecretary"] },
      { label: "Approved Expense", icon: TbChecklist, path: "/admin/womenapprovedexpense", roles: ["womensecretary"] },
    ],
  },

  {
    label: "Men's Fellowship",
    icon: IoIosMan,
    roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"],
    children: [
      { label: "Members", icon: FaUsers, path: "/admin/menfellowmembers", roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"] },
      { label: "Event", icon: FaCalendarAlt, path: "/admin/menfellowevent", roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"] },
      { label: "Activities", icon: GiThreeFriends, path: "/admin/menactivites", roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"] },
      { label: "Auction", icon: RiAuctionFill, path: "/admin/menauction", roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"] },
      { label: "Auction Report", icon: TbReportMoney, path: "/admin/menauctionreport", roles: ["admin", "secretary", "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"] },

      // { label: "Add Expense",  icon: MdAddCard, path: "/admin/menaddexpense", roles: ["menaccountant"] },
      // { label: "Paid Expense",  icon: GiPayMoney, path: "/admin/menpaidexpense", roles: ["menaccountant"] },
      // { label: "Men Expense",   icon: FaMoneyBillWave, path: "/admin/menexpense", roles: ["mensecretary"] },
      // { label: "Approved Expense", icon: TbChecklist, path: "/admin/menapprovedexpense", roles: ["mensecretary"] },
    ],
  },




  // {
  //   label: "Auction",
  //   icon: RiAuctionFill,
  //   roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
  //   children: [
  //     {
  //       label: "Sunday Auction",
  //       icon: BsCalendar2HeartFill,
  //       path: "/admin/sundayauction",
  //       roles: ["admin", "secretary", "churchadmin", "churchofficestaff"]
  //     }
  //   ]
  // },



  // {
  //   label: "Bills",
  //   icon: FaMoneyBillWave,
  //   path: "/admin/bills",
  //   roles: ["admin", "secretary", "churchadmin", "churchofficestaff"]
  // },



  // {
  //   label: "Reports",
  //   icon: HiOutlineDocumentReport,
  //   roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
  //   children: [
  //     {
  //       label: "Member Report",
  //       icon: FaUsers,
  //       path: "/admin/reports/member-report",
  //       roles: ["admin", "secretary", "churchadmin", "churchofficestaff"]
  //     },

  //        {
  //     label: "Income Report",
  //     icon: FaFileInvoiceDollar, 
  //     path: "/admin/reports/offertory-santha-report",
  //     roles: ["admin", "secretary", "churchadmin", "churchofficestaff"]
  //   }
  //   ]
  // },












  // {
  //   label: "Reports",
  //   icon: HiOutlineDocumentReport,
  //   roles: ["admin", "secretary", "accountant", "treasurer", "churchofficeworker"],
  //   children: [
  //     { label: "Accounting Reports", path: "/admin/AccountsReports" },
  //     { label: "Offering Reports", path: "/admin/OfferingReports" },
  //     { label: "Subscription", path: "/admin/SubscriptionReport" },
  //     { label: "Auction Reports", path: "/admin/AuctionReportsAll" },
  //     { label: "Harvest Auction Reports", path: "/admin/HarvestAuctionReportsAll" },
  //     { label: "Sunday School", path: "/admin/SundaySchoolReports" },
  //     { label: "Endeavour", path: "/admin/EndeavourReports" },
  //     { label: "Men", path: "/admin/MenReports" },
  //     { label: "Women", path: "/admin/WomenReports" },
  //     { label: "Youth", path: "/admin/YouthReports" },
  //     { label: "Couple", path: "/admin/CoupleReports" },
  //     { label: "Marriage Hall", path: "/admin/MarriageHallReports" },
  //     { label: "Cemetery", path: "/admin/CemeteryReports" },
  //     { label: "Member Reports", path: "/admin/reports" }
  //   ],
  // },
  // { label: "Bills", icon: FaRupeeSign, path: "/admin/bills", roles: ["admin", "churchofficeworker"] },

  // { label: "Voters", icon: MdHowToVote, path: "/admin/voterlist", roles: ["admin", "churchofficeworker"] },



  {
    label: "Bible Verse",
    icon: FaBible,
    path: "/admin/biblesentence",
    roles: ["admin", "churchadmin", 'treasurer', "churchofficestaff"],
  },


  {
    label: "Notifications",
    icon: FaBell,
    path: "/admin/notifications",
    roles: ["admin", "secretary", "accountant", "treasurer", "churchofficeworker", "churchadmin", "churchofficestaff"],
  },


  {
    label: "Cemetery",
    icon: GiTombstone,
    roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
    children: [
      {
        label: "Plots",
        path: "/admin/cemetery/plots",
        icon: TbGrave2,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Book Slots",
        path: "/admin/cemetery/book-slots",
        icon: FaCalendarAlt,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },
      {
        label: "Reserved Slots",
        path: "/admin/cemetery/reserved-slots",
        icon: FaUserClock,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },

      {
        label: "Report",
        path: "/admin/cemetery/report",
        icon: HiOutlineDocumentReport,
        roles: ["admin", "secretary", "churchadmin", "churchofficestaff"],
      },
    ],
  },


  { label: "User Control", icon: GrUserSettings, path: "/admin/usercontrol", roles: ["admin", "secretary", "churchadmin"] },
];

function Sidebar({ onClose }) {



  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole } = useContext(RoleContext);
  const [openMenus, setOpenMenus] = useState({});

  // ✅ Auto-close other dropdowns when navigating to a new route
  useEffect(() => {
    const newOpenMenus = {};

    menuConfig.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.path.startsWith("/admin/offertory")) {
            // special logic for offerings
            return matchOfferingsPath(child.path, location.pathname);
          }
          return (
            location.pathname === child.path ||
            location.pathname.startsWith(child.path + "/")
          );
        });

        if (hasActiveChild) {
          newOpenMenus[item.label] = true; // keep only active section open
        }
      }
    });

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);


  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const hasAccess = (item) => !item.roles || item.roles.includes(activeRole);

  const flatRoles = [
    "sundaysclscretary", "sundaysclaccountant", "sundaysclteacher",
    "endeavoursclscretary", "endeavourclaccountant", "endeavourteacher",
    "youthsecretary", "youthaccountant",
    "mensecretary", "menaccountant",
    "womensecretary", "womenaccountant",
    "couplesecretary", "coupleaccountant",
  ];

  // Extract main section token from a path, e.g. '/admin/offerings/type' -> 'offerings'
  const getSection = (path) => {
    if (!path || typeof path !== "string") return null;
    const parts = path.split("/").filter(Boolean); // ['admin','offerings','type']
    // prefer the second segment (index 1) if exists, otherwise fallback
    return parts[1] || parts[0] || null;
  };

  // Build a set of all sections dynamically from menuConfig (for reference / future use)
  const buildSectionSet = () => {
    const set = new Set();
    menuConfig.forEach((item) => {
      if (item.path) {
        const s = getSection(item.path);
        if (s) set.add(s);
      }
      if (item.children) {
        item.children.forEach((child) => {
          if (child.path) {
            const s = getSection(child.path);
            if (s) set.add(s);
          }
        });
      }
    });
    return set; // Set of tokens like 'offerings', 'family', 'men', etc.
  };

  const sectionSet = buildSectionSet();

  // Smart check: exact match, startsWith, or same "section" token
  const checkActive = (path, currentPath) => {
    if (!path) return false;
    if (currentPath === path) return true;
    if (currentPath.startsWith(path + "/")) return true;
    // If both have same main section, count as active
    const pathSection = getSection(path);
    const currentSection = getSection(currentPath);
    if (pathSection && currentSection && pathSection === currentSection) return true;
    return false;
  };

  // Auto-expand parent menus when any of their children are active
  useEffect(() => {
    const expanded = {};
    menuConfig.forEach((item) => {
      if (item.children?.some((child) => checkActive(child.path, location.pathname))) {
        expanded[item.label] = true;
      }
    });
    setOpenMenus((prev) => ({ ...expanded, ...prev }));
    // We only depend on pathname so panels update when route changes
  }, [location.pathname]);

  // ✅ Accurate and automatic matcher for Offerings section
  const matchOfferingsPath = (childPath, currentPath) => {
    if (!childPath.startsWith("/admin/offerings")) return false;



    if (childPath === "/admin/offerings/add-offerings") {
      return (
        currentPath.startsWith("/admin/offerings/add-offerings") ||
        currentPath.startsWith("/admin/offerings/name") ||
        currentPath.startsWith("/admin/offerings/cover/add")
      );
    }

    // e.g. '/admin/offerings/type' → 'type'
    const baseSegment = childPath.split("/")[3]?.toLowerCase() || "";
    // e.g. '/admin/offerings/Common/list/...' → 'common'
    const currentSegment = currentPath.split("/")[3]?.toLowerCase() || "";

    // Normalize names to remove suffixes like 'type', 'offer', 'offerings'
    const normalize = (s) => s?.replace(/type|offerings?|offer/gi, "").trim();
    const base = normalize(baseSegment);
    const current = normalize(currentSegment);

    // ✅ CASES
    // 1. Exact match (like /type → /type)
    if (currentPath === childPath) return true;

    // 2. Child's subroute (like /type/something)
    if (currentPath.startsWith(childPath + "/")) return true;

    // 3. Same base segment group (type <-> Common, bagtype <-> BagOffer, etc.)
    if (base && current && base === current) return true;

    // 4. Allow matching deeper only if the section prefix matches (prevent always-active)
    if (
      base &&
      currentPath.startsWith(`/admin/offerings/${currentSegment}/`) &&
      current.startsWith(base)
    ) {
      return true;
    }

    // ❌ otherwise, not active
    return false;
  };


  useEffect(() => {
    const expanded = {};
    menuConfig.forEach((item) => {
      if (item.children?.some((child) => checkActive(child.path, location.pathname))) {
        expanded[item.label] = true;
      }
    });
    setOpenMenus(expanded);
  }, [location.pathname]);


  useEffect(() => {
    onClose?.();
  }, [location.pathname]);



  return (
    <>





      <div className="h-full w-full flex flex-col"

      >



        {/* Mobile brand */}




        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b shrink-0">

          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src={churchLogo}
              alt="CSI Church Logo"
              className="w-10 h-10 object-contain"
            />

            <h1 className="text-xl font-bold text-lavender--600 leading-tight">
              CSI Church - KK
            </h1>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            <IoClose className="w-7 h-7" />
          </button>

        </div>




        <div className="flex-1 min-h-0 overflow-y-auto py-4">


          <ul className="font-medium">
            {menuConfig.filter(hasAccess).map((item) => {
              // Helper: match by section (like /admin/offerings or /admin/family)
              const getBase = (path) => path.split("/").slice(0, 3).join("/"); // e.g., /admin/offerings
              const currentBase = getBase(location.pathname);

              const isParentActive = item.children?.some((child) => {
                const current = location.pathname;

                return (
                  current === child.path ||
                  current.startsWith(child.path + "/") ||
                  (child.path === "/admin/offertory/add-offerings" &&
                    current.startsWith("/admin/offertory/name")) ||
                  (child.path === "/admin/offertory/add-offerings" &&
                    current.startsWith("/admin/offertory/cover")) ||

                  (child.path === "/admin/santha/members" &&
                    current.startsWith("/admin/santha/add"))
                );

              });

              // Case 1: flat roles
              if (flatRoles.includes(activeRole) && item.children) {
                return item.children
                  .filter((child) => !child.roles || child.roles.includes(activeRole))
                  .map((child) => {
                    const isActive =
                      location.pathname === child.path ||
                      location.pathname.startsWith(child.path + "/") ||
                      getBase(child.path) === currentBase;
                    return (
                      <li key={child.label}>
                        <Link
                          to={child.path}
                          className={`flex items-center px-10 py-3 rounded-e-lg group ${isActive
                            ? "bg-lavender--600 text-white"
                            : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                            }`}
                        >
                          {/* <span className="text-lg ms-3">{child.label}</span> */}
                          <div className="flex items-center gap-3">
                            {child.icon && (
                              <child.icon className="w-5 h-5" />
                            )}
                            <span className="text-lg">{child.label}</span>
                          </div>

                        </Link>
                      </li>
                    );
                  });
              }

              // Case 2: dropdown/normal item
              return (
                <li key={item.label}>
                  {item.children ? (
                    <>
                      {/* PARENT BUTTON */}
                      <div
                        className={`flex items-center px-10 py-3 cursor-pointer rounded-e-lg group ${isParentActive
                          ? "bg-lavender--600 text-white"
                          : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                          }`}
                        onClick={() => toggleMenu(item.label)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-lg ms-3">{item.label}</span>
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform ${openMenus[item.label] ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {/* CHILDREN LINKS */}
                      {/* {(!openMenus[item.label] && isParentActive) && toggleMenu(item.label)} */}
                      {openMenus[item.label] && (
                        <div className="mt-2 space-y-2 ml-14">
                          {item.children
                            .filter((child) => !child.roles || child.roles.includes(activeRole))
                            .map((child) => {

                              // const isActive = location.pathname === child.path;
                              const isActive =
                                location.pathname === child.path ||
                                location.pathname.startsWith(child.path + "/") ||
                                (child.path === "/admin/offertory/add-offerings" &&
                                  location.pathname.startsWith("/admin/offertory/name")) ||
                                (child.path === "/admin/offertory/add-offerings" &&
                                  location.pathname.startsWith("/admin/offertory/cover")) ||
                                (child.path === "/admin/santha/members" &&
                                  location.pathname.startsWith("/admin/santha/add"));

                              return (
                                <Link
                                  key={child.label}
                                  to={child.path}
                                  className={`flex items-center gap-3 px-6 py-2 rounded-lg transition ${isActive
                                    ? "text-lavender--600 font-semibold"
                                    : "text-gray-700 hover:text-lavender--600"
                                    }`}
                                >
                                  {child.icon && (
                                    <child.icon
                                      className={`w-4 h-4 ${isActive ? "text-lavender--600" : "text-gray-400"
                                        }`}
                                    />
                                  )}
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-10 py-3 rounded-e-lg group ${location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/") ||
                        getBase(item.path) === currentBase
                        ? "bg-lavender--600 text-white"
                        : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-lg ms-3">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>



    </>
  );
}

export default Sidebar;
























