/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "./Pages/Auth/Login.jsx";
import ContainerMain from "./Pages/Container";
import ScrollToTop from "./ScrollToTop";
import SessionTimeout from "./SessionTimeout";
import "./utils/axiosInterceptor";
import SmallSizedModal from "./Components/Expense/SmallSizedModal";
import { RoleProvider } from "./Components/RoleContext";
import FamilyContainer from "./Pages/Family List/Container";
import FamilyList from "./Pages/Family List/List";
import FamilyAddNew from "./Pages/Family List/AddNew";
import AddFamilyPreview from "./Pages/Family List/AddFamilyPreview";
import BibleSentence from "./Pages/Bible Sentence/BibleSentenceList";
import { Dashboard } from "./Pages/Dashboard/Dashboard";
import { ChurchAdminDash } from "./Pages/Dashboard/ChurchAdminDash.jsx";

import { DashSundayschool } from "./Pages/Sunday School/DashSundayschool";
import { ClassSunday } from "./Pages/Sunday School/ClassSunday";
import { SundaySclOfferings } from "./Pages/Sunday School/SundaySclOfferings"
import { SundaySclAttendancePage } from "./Pages/Sunday School/SundaySclAttendancePage.jsx"
import { Teacher } from "./Pages/Sunday School/Teacher"
import { Student } from "./Pages/Sunday School/Student";
import SundaySchoolAddStudent from "./Pages/Sunday School/AddSundaySchoolStudent.jsx"
import { Event } from "./Pages/Sunday School/Event";
import { Studentauction } from "./Pages/Sunday School/Studentauction";

import { Dashendschool } from "./Pages/Endevour/Dashendschool";
import { Classend } from "./Pages/Endevour/Classend"
import { Teacherend } from "./Pages/Endevour/Teacherend"
import { Studentend } from "./Pages/Endevour/Studentend"
import AddStudentend from "./Pages/Endevour/AddStudentEnd.jsx"
import { Eventend } from "./Pages/Endevour/Eventend"
import { Studentauctionend } from "./Pages/Endevour/Studentauctionend"
import { EndSclOfferings } from "./Pages/Endevour/EndSclOfferings";
import { EndSclAttendancePage } from "./Pages/Endevour/EndSclAttendance.jsx"
import { AuctionReport } from "./Components/Reports/AuctionReport";
import { StudentAucReport } from "./Pages/Sunday School/StudentAucReport";
import { EndeavourAucReport } from "./Pages/Endevour/EndeavourAucReport";
import { MenMembers } from "./Pages/Men Fellowship/MenMembers";
import { MenFellowEvent } from "./Pages/Men Fellowship/MenFellowEvent";
import { AddMenEvent } from "./Pages/Men Fellowship/AddMenEvent.jsx";
import { EditMenEvent } from "./Pages/Men Fellowship/EditMenEvent.jsx";
import { WomenMember } from "./Pages/Women Fellowship/WomenMember";
import { WomenFellowEvent } from "./Pages/Women Fellowship/WomenFellowEvent";
import { Usercontrol } from "./Pages/User Controll/Usercontrol";
import { MemberDash } from "./Pages/Member Login/MemberDash";
import { MemberDashOverlay } from "./Pages/Member Login/MemberDashOverlay";
import { MemberPayments } from "./Pages/Member Login/MemberPayments";
import { MemberDetails } from "./Pages/Member Login/MemberDetails";
import { MenActivities } from "./Pages/Men Fellowship/MenActivities";
import { WomenActivities } from "./Pages/Women Fellowship/WomenActivities";
import { TreasurerDash } from "./Components/RoleBasedDashes/TreasurerDash";
import { AccountantDash } from "./Components/RoleBasedDashes/AccountantDash";
import { SecretaryDash } from "./Components/RoleBasedDashes/SecretaryDash";
import { SundaySclAccDash } from "./Components/RoleBasedDashes/SundaySclAccDash";
import { ChurchOfficeWorkerDash } from "./Components/RoleBasedDashes/ChurchOfficeWorkerDash";
import { EndeavourTeachDash } from "./Pages/Endeavour Teacher Login/EndeavourTeachDash";
import { EndeavourStudents } from "./Pages/Endeavour Teacher Login/EndeavourStudents";
import { EndeavourEvent } from "./Pages/Endeavour Teacher Login/EndeavourEvent";
import { EndeavourAuction } from "./Pages/Endeavour Teacher Login/EndeavourAuction";
import { EndevaourAucReportforTeach } from "./Pages/Endeavour Teacher Login/EndevaourAucReportforTeach";
import { EndeavourOfferAttendance } from "./Pages/Endeavour Teacher Login/EndeavourOfferAttendance";
import { SundaySclTeachDash } from "./Pages/Sunday School Teacher Login/SundaySclTeachDash";
import { SundaySclStudents } from "./Pages/Sunday School Teacher Login/SundaySclStudents";
import { SundayEventSclTeach } from "./Pages/Sunday School Teacher Login/SundayEventSclTeach";
import { SundaySchoolAuctionTeach } from "./Pages/Sunday School Teacher Login/SundaySchoolAuctionTeach";
import { SundaySclAuctionReportforTeach } from "./Pages/Sunday School Teacher Login/SundaySclAuctionReportforTeach";
import { SundaySclTeachOfferAttendance } from "./Pages/Sunday School Teacher Login/SundaySclTeachOfferAttendance";
import { MenAuction } from "./Pages/Men Fellowship/MenAuction";
import { MenAuctionReport } from "./Pages/Men Fellowship/MenAuctionReport";
import { WomenAuction } from "./Pages/Women Fellowship/WomenAuction";
import { WomenAuctionReport } from "./Pages/Women Fellowship/WomenAuctionReport";

import { ChoirList } from "./Pages/Choir/ChoirList";
import { ChoirMaster } from "./Pages/Choir/ChoirMaster";
import { ChoirEvent } from "./Pages/Choir/ChoirEvent";
import { ChoirNotification } from "./Pages/Choir/ChoirNotification";
import { ChoirExpense } from "./Pages/Choir/ChoirExpense";
import { ChoirSubscription } from "./Pages/Choir/ChoirSubscription.jsx"

import { AddSundaySclExpense } from "./Pages/Sunday School/AddSundaySclExpense";
import { SundaySclApprovedExpense } from "./Pages/Sunday School/SundaySclApprovedExpense";
import { SundaySclPaidExpense } from "./Pages/Sunday School/SundaySclPaidExpense";
import { SundaySclExpense } from "./Pages/Sunday School/SundaySclExpense";
import { AddEndeavourExpense } from "./Pages/Endevour/AddEndeavourExpense";
import { EndeavourPaidExpense } from "./Pages/Endevour/EndeavourPaidExpense";
import { EndeavourApprovedExpense } from "./Pages/Endevour/EndeavourApprovedExpense";
import { EndeavourExpense } from "./Pages/Endevour/EndeavourExpense";
import { AddMenFellowExpense } from "./Pages/Men Fellowship/AddMenFellowExpense";
import { MenPaidExpense } from "./Pages/Men Fellowship/MenPaidExpense";
import { MenApprovedExpense } from "./Pages/Men Fellowship/MenApprovedExpense";
import { MenExpense } from "./Pages/Men Fellowship/MenExpense";
import { AddWomenFellowExpense } from "./Pages/Women Fellowship/AddWomenFellowExpense";
import { WomenPaidExpense } from "./Pages/Women Fellowship/WomenPaidExpense";
import { WomenApprovedExpense } from "./Pages/Women Fellowship/WomenApprovedExpense";
import { WomenExpense } from "./Pages/Women Fellowship/WomenExpense";

import { AddChoirExpense } from "./Pages/Choir/AddChoirExpense";
import { ChoirPaidExpense } from "./Pages/Choir/ChoirPaidExpense";
import { ChoirApprovedExpense } from "./Pages/Choir/ChoirApprovedExpense";

import { AddEndeavourEvent } from "./Pages/Endevour/AddEndeavourEvent";
import { EditEndeavourEvent } from "./Pages/Endevour/EditEndeavourEvent";
import { AddSundaySchoolEvent } from "./Pages/Sunday School/AddSundaySchoolEvent";
import { EditSundaySchoolEvent } from "./Pages/Sunday School/EditSundaySchoolEvent";
import { AddWomenEvent } from "./Pages/Women Fellowship/AddWomenEvent";
import { EditWomenEvent } from "./Pages/Women Fellowship/EditWomenEvent";
import { SundaySclExam } from "./Pages/Sunday School/SundaySclExam";
import { AddSundaySclExam } from "./Pages/Sunday School/AddSundaySclExam";
import { EditSundaySclExam } from "./Pages/Sunday School/EditSundaySclExam";
import { SundaySclExamTeach } from "./Pages/Sunday School Teacher Login/SundaySclExamTeach";
import { EndeavourSclExam } from "./Pages/Endevour/EndeavourSclExam";
import { AddEndeavourExam } from "./Pages/Endevour/AddEndeavourExam";
import { EditEndeavourExam } from "./Pages/Endevour/EditEndeavourExam";
import { EndeavourSclExamTeach } from "./Pages/Endeavour Teacher Login/EndeavourSclExamTeach";

import { AddNewMember } from "./Pages/Member List/AddNewMember";
import { MemberList } from "./Pages/Member List/MemberList";
import { MemberEdit } from "./Pages/Member List/MemberEdit";
import { MemberView } from "./Pages/Member List/MemberView";
import { NewFamilyList } from "./Pages/Family List/NewFamilyList";

import { NewFamilyPreview } from "./Pages/Family List/NewFamilyPreview";
import { FamilyMemberView } from "./Pages/Family List/FamilyMemberView";

import { PastorList } from "./Pages/New Pastor/PastorList";
import { AddPastor } from "./Pages/New Pastor/AddPastor";
import { ViewPastor } from "./Pages/New Pastor/ViewPastor";
import { PastorFamPreview } from "./Pages/New Pastor/PastorFamPreview";
import { EditPastor } from "./Pages/New Pastor/EditPastor";
import { EditPastorFamMem } from "./Pages/New Pastor/EditPastorFamMem";
import { ViewPastorFamMem } from "./Pages/New Pastor/ViewPastorFamMem";
import { AddPastorFamily } from "./Pages/New Pastor/AddPastorFamily";


import { Notification } from "./Pages/Notification/Notification";



import { AddOfferings } from "./Pages/Offertory/AddOfferings.jsx";
import { CreateOfferings } from "./Pages/Offertory/CreateOfferings.jsx";
import OfferingTypeRouter from "./Pages/Offertory/OfferingTypeRouter";
import CoverAddOffering from "./Pages/Offertory/AddCover.jsx";


import { SundayAuction } from "./Pages/Auction/SundayAuction.jsx";
import {Bills} from "./Pages/Bills/Bills.jsx";
import { MemberReport } from "./Pages/Reports/Members/MemberReport.jsx";
import {OffertorySanthaReport } from "./Pages/Reports/OffertorySantha/OffertorySanthaReport.jsx"
import {SanthaMembers } from "./Pages/Santha/Members.jsx";
import AddSanthaMembers from "./Pages/Santha/AddSanthaMembers.jsx";
import {SanthaReport} from "./Pages/Santha/SanthaReport.jsx"




// General Accounts
import { AddTypesofLedgers } from "./Pages/GeneralAccounts/AddTypesOfLedgers.jsx";
import { Ledger } from "./Pages/GeneralAccounts/Ledgers.jsx";
import {CashInHand } from "./Pages/GeneralAccounts/CashInHand.jsx";

//Marriage Hall
import { BookingHall } from "./Pages/Marriage/BookingHall.jsx";
import { Hall } from "./Pages/Marriage/Hall.jsx";
import { AddBookingHall } from "./Pages/Marriage/AddBookingHall.jsx";
import {EditBookingHall} from "./Pages/Marriage/EditBookingHall.jsx";
import {PaymentBookingHall} from "./Pages/Marriage/PaymentBookingHall.jsx";
import {MarriageHallKitchenAssets} from "./Pages/Marriage/MarriageHallKitchenAssets.jsx";
import {MarriageHallIssuedAssets} from "./Pages/Marriage/MarriageHallIssuedAssets.jsx";
import {MarriageHallAssets} from "./Pages/Marriage/MarriageHallAssets.jsx";
import {MrgHallAddAssets} from "./Pages/Marriage/MrgHallAddAssets.jsx";
import {MrgHallAssetsView} from "./Pages/Marriage/MrgHallAssetsView.jsx";


//Cemetery
import { Plots } from "./Pages/Cemetery/Plots.jsx";
import { BookSlots } from "./Pages/Cemetery/BookSlots.jsx";
import { ReservedSlots } from "./Pages/Cemetery/ReservedSlots.jsx";
import { CemeteryReport } from "./Pages/Cemetery/CemeteryReport.jsx";



export const URL = import.meta.env.VITE_BACKEND_API_URL;

function App() {

  const [sessionExpired, setSessionExpired] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);

  const handleSessionTimeout = () => {
    setSessionExpired(true);

    setTimeout(() => {
      sessionStorage.clear();
      window.location.href = "/";
    }, 3000);
  };



  React.useEffect(() => {

    const handleTokenExpired = () => {
      setSessionExpired(true);

      setTimeout(() => {

        sessionStorage.removeItem("token");

        window.location.href = "/";

      }, 3000);
    };

    window.addEventListener("tokenExpired", handleTokenExpired);

    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };

  }, []);
  return (
    <React.Fragment>

      <BrowserRouter>

        <SessionTimeout onTimeout={handleSessionTimeout} />

        <SmallSizedModal
          isOpen={sessionExpired}
          onClose={() => { }}
          title="Session Expired"
        >
          <div className="text-center py-4 flex flex-col items-center">

            {/* Icon */}
            <div className="bg-red-100 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <p className="text-gray-700 text-sm font-medium">
              Your session has expired
            </p>

            {/* Description */}
            <p className="text-gray-500 text-xs mt-1">
              Please login again to continue using the system
            </p>

            {/* Logout Text */}
            <p className="text-red-500 mt-4 font-semibold animate-pulse">
              Logging out...
            </p>

          </div>
        </SmallSizedModal>
        <ScrollToTop />
        <Routes>

          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/" element={<Login />} />

          <Route path="admin" element={<ContainerMain />}>

            <Route
              path="dashmember"
              element={<PrivateRoute allowedRoles={['member']}><MemberDash /></PrivateRoute>}
            />


            <Route
              path="dashmember/:memberId"
              element={
                <PrivateRoute allowedRoles={["member"]}>
                  <MemberDashOverlay />
                </PrivateRoute>
              }
            />



            <Route
              path="churchadmindash"
              element={<PrivateRoute allowedRoles={['churchadmin', 'churchofficestaff']}><ChurchAdminDash /></PrivateRoute>}
            />


            <Route
              path="treasurerdash"
              element={<PrivateRoute allowedRoles={['treasurer']}><TreasurerDash /></PrivateRoute>}
            />
            <Route
              path="accountantdash"
              element={<PrivateRoute allowedRoles={['accountant']}><AccountantDash /></PrivateRoute>}
            />
            <Route
              path="secretarydash"
              element={<PrivateRoute allowedRoles={['secretary']}><SecretaryDash /></PrivateRoute>}
            />
            <Route
              path="sundaysclaccdash"
              element={<PrivateRoute allowedRoles={['sundaysclaccountant']}><SundaySclAccDash /></PrivateRoute>}
            />
            <Route
              path="churchofficeworkerdash"
              element={<PrivateRoute allowedRoles={['churchofficeworker']}><ChurchOfficeWorkerDash /></PrivateRoute>}
            />



            <Route
              path="detailsofmembers"
              element={<PrivateRoute allowedRoles={['member']}><MemberDetails /></PrivateRoute>}
            />
            <Route
              path="paymentmember"
              element={<PrivateRoute allowedRoles={['member']}><MemberPayments /></PrivateRoute>}
            />
            <Route
              path="dashboard"
              element={<PrivateRoute allowedRoles={['admin', 'pastorprimary']}><Dashboard /></PrivateRoute>}
            />
            {/* <Route
              path="reminders"
              element={<PrivateRoute allowedRoles={['admin']}><RemindersReports /></PrivateRoute>}
            /> */}



            <Route path="familylist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><NewFamilyList /></PrivateRoute>} />
            <Route path="familylist/familymemberslist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><NewFamilyPreview /></PrivateRoute>} />
            <Route path="familylist/familymemberslist/familymemberview/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><FamilyMemberView /></PrivateRoute>} />

            <Route path="memberlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><MemberList /></PrivateRoute>} />
            <Route path="memberlist/addnewmember" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><AddNewMember /></PrivateRoute>} />
            <Route path="memberlist/editmember/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><MemberEdit /></PrivateRoute>} />
            <Route path="memberlist/viewmember/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><MemberView /></PrivateRoute>} />



            <Route path="pastorlist" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><PastorList /></PrivateRoute>} />
            <Route path="pastorlist/addpastor" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><AddPastor /></PrivateRoute>} />
            <Route path="pastorlist/viewpastor/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><ViewPastor /></PrivateRoute>} />
            <Route path="pastorlist/pastorfampreview/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><PastorFamPreview /></PrivateRoute>} />
            <Route path="pastorlist/editpastor/:id" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><EditPastor /></PrivateRoute>} />
            <Route path="pastorlist/editpastorfammem/:pastorId/:memberId" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><EditPastorFamMem /></PrivateRoute>} />
            <Route path="pastorlist/viewpastorfammem/:pastorId/:memberId" element={<PrivateRoute allowedRoles={['admin', "churchofficeworker", "churchadmin", "churchofficestaff"]}><ViewPastorFamMem /></PrivateRoute>} />
            <Route
              path="pastorlist/addpastorfamily/:id"
              element={<PrivateRoute allowedRoles={['admin', 'churchofficeworker', "churchadmin", "churchofficestaff"]}><AddPastorFamily /></PrivateRoute>}
            />


            <Route path="offertory" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', 'churchofficeworker', 'churchadmin', "churchofficestaff"]}><FamilyContainer /></PrivateRoute>}>

              <Route path="add-offerings" element={<AddOfferings />} />
              <Route path="create-offerings" element={<CreateOfferings />} />
              <Route path="name/:type" element={<OfferingTypeRouter />} />
              <Route path="cover/add" element={<CoverAddOffering />} />

            </Route>



            

            {/* General Accounts */}

             <Route path="cashinhand" element={<PrivateRoute allowedRoles={['admin', "churchadmin", 'treasurer']}><CashInHand /></PrivateRoute>} />
             <Route path="ledgers" element={<PrivateRoute allowedRoles={['admin', "churchadmin", 'treasurer']}><Ledger /></PrivateRoute>} />
             <Route path="ledgers/AddTypesofLedger" element={<PrivateRoute allowedRoles={['admin', "churchadmin", 'treasurer']}><AddTypesofLedgers /></PrivateRoute>} />





            
            <Route path="santha" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', 'churchofficeworker', 'churchadmin', "churchofficestaff"]}><FamilyContainer /></PrivateRoute>}>

              <Route path="members" element={<SanthaMembers />} />
              <Route path="add" element={<AddSanthaMembers />} />
               <Route path="report" element={<SanthaReport />} />

            </Route>



             <Route path="marriage" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', 'churchofficeworker', 'churchadmin', "churchofficestaff"]}><FamilyContainer /></PrivateRoute>}>
              <Route path="hall" element={<Hall/>} />
              <Route path="booking-hall" element={<BookingHall />} />
              <Route path="booking-hall/new-booking" element={<AddBookingHall />} />
              <Route path="booking-hall/edit/:id" element={<EditBookingHall />} />
              <Route path="booking-hall/payment/:id" element={<PaymentBookingHall />} />
              <Route path="hall-assets" element={<MarriageHallAssets />} />
              <Route path="hall-assets/add" element={<MrgHallAddAssets />} />
              <Route path="hall-assets/view/:id" element={<MrgHallAssetsView />} />


              <Route path="hall-kitchen-assets" element={<MarriageHallKitchenAssets />} />
              <Route path="hall-kitchen-issued-assets" element={<MarriageHallIssuedAssets />} />

            </Route>        






            {/* Sunday school, End school, reports */}
            <Route path="dashsundayschool" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><DashSundayschool /></PrivateRoute>} />
            <Route path="class" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><ClassSunday /></PrivateRoute>} />
            <Route path="teacher" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><Teacher /></PrivateRoute>} />
            <Route path="student" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><Student /></PrivateRoute>} />

            <Route path="student/add-students" element={<PrivateRoute allowedRoles={["admin", "sundaysclscretary", "accountant", "secretary", "sundaysclaccountant", "churchadmin", "churchofficestaff"]} > <SundaySchoolAddStudent /> </PrivateRoute>} />

            <Route path="event" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', , 'churchadmin', "churchofficestaff"]}><Event /></PrivateRoute>} />
            <Route path="event/addsundayschoolevent" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><AddSundaySchoolEvent /></PrivateRoute>} />
            <Route path="event/editevent/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EditSundaySchoolEvent /></PrivateRoute>} />
            <Route path="exam" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'churchadmin', "churchofficestaff"]}><SundaySclExam /></PrivateRoute>} />
            <Route path="exam/addsundayschoolexam" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'churchadmin', "churchofficestaff"]}><AddSundaySclExam /></PrivateRoute>} />
            <Route path="exam/editsundaysclexam/:id" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'churchadmin', "churchofficestaff"]}><EditSundaySclExam /></PrivateRoute>} />
            <Route path="studentauction" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><Studentauction /></PrivateRoute>} />
            <Route path="studentauctionreport" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><StudentAucReport /></PrivateRoute>} />
            <Route path="sundayofferings" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}><SundaySclOfferings /></PrivateRoute>} />
            <Route
              path="sundayofferings/:classId/:date"
              element={
                <PrivateRoute allowedRoles={['admin', "sundaysclscretary", 'accountant', 'secretary', 'sundaysclaccountant', 'churchadmin', "churchofficestaff"]}>
                  <SundaySclAttendancePage />
                </PrivateRoute>
              }
            />


            <Route path="sundayscladdexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclaccountant']}><AddSundaySclExpense /></PrivateRoute>} />
            <Route path="sundaysclpaidexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclaccountant']}><SundaySclPaidExpense /></PrivateRoute>} />
            <Route path="sundaysclapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "sundaysclscretary"]}><SundaySclApprovedExpense /></PrivateRoute>} />
            <Route path="sundaysclexpense" element={<PrivateRoute allowedRoles={['admin', 'sundaysclscretary']}><SundaySclExpense /></PrivateRoute>} />

            {/* Sunday School Teacher Login  */}
            <Route path="sundayschoolteacherdashboard" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclTeachDash /></PrivateRoute>} />
            <Route path="sundayschoolstudents" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclStudents /></PrivateRoute>} />
            <Route path="sundayschoolevent" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundayEventSclTeach /></PrivateRoute>} />
            <Route path="sundayschoolexam" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclExamTeach /></PrivateRoute>} />
            <Route path="sundayschoolauction" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySchoolAuctionTeach /></PrivateRoute>} />
            <Route path="sundayschoolreportforauction" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclAuctionReportforTeach /></PrivateRoute>} />
            <Route path="sundayschoolofferingsandattendance" element={<PrivateRoute allowedRoles={['sundaysclteacher']}><SundaySclTeachOfferAttendance /></PrivateRoute>} />

            {/* End school */}
            <Route path="dashendschool" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Dashendschool /></PrivateRoute>} />
            <Route path="classend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Classend /></PrivateRoute>} />
            <Route path="teacherend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Teacherend /></PrivateRoute>} />
            <Route path="studentend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Studentend /></PrivateRoute>} />
            <Route path="studentend/add-students" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><AddStudentend /></PrivateRoute>} />



            <Route path="eventend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Eventend /></PrivateRoute>} />
            <Route path="eventend/addendeavourevent" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><AddEndeavourEvent /></PrivateRoute>} />

            <Route path="eventend/edit/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EditEndeavourEvent /></PrivateRoute>} />
            <Route path="endeavourexam" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EndeavourSclExam /></PrivateRoute>} />
            <Route path="endeavourexam/addendeavourexam" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><AddEndeavourExam /></PrivateRoute>} />
            <Route path="endeavourexam/editendeavourexam/:id" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EditEndeavourExam /></PrivateRoute>} />
            <Route path="studentauctionend" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><Studentauctionend /></PrivateRoute>} />
            <Route path="endeavouraucreport" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EndeavourAucReport /></PrivateRoute>} />
            <Route path="endofferings" element={<PrivateRoute allowedRoles={['admin', 'accountant', 'secretary', 'endeavoursclscretary', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EndSclOfferings /></PrivateRoute>} />
            <Route
              path="endofferings/:classId/:date"
              element={
                <PrivateRoute allowedRoles={[
                  'admin',
                  'accountant',
                  'secretary',
                  'endeavoursclscretary',
                  'endeavourclaccountant',
                  'churchadmin',
                  "churchofficestaff"
                ]}>
                  <EndSclAttendancePage />
                </PrivateRoute>
              }
            />
            <Route path="endeavouraddexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><AddEndeavourExpense /></PrivateRoute>} />
            <Route path="endeavourpaidexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavourclaccountant', 'churchadmin', "churchofficestaff"]}><EndeavourPaidExpense /></PrivateRoute>} />
            <Route path="endeavourapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "endeavoursclscretary", 'churchadmin', "churchofficestaff"]}><EndeavourApprovedExpense /></PrivateRoute>} />
            <Route path="endeavourexpense" element={<PrivateRoute allowedRoles={['admin', 'endeavoursclscretary', 'churchadmin', "churchofficestaff"]}><EndeavourExpense /></PrivateRoute>} />



            {/* Endeavour Teacher */}
            <Route path="endeavourteacherdashboard" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourTeachDash /></PrivateRoute>} />
            <Route path="endeavourstudents" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourStudents /></PrivateRoute>} />
            <Route path="endeavourevent" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourEvent /></PrivateRoute>} />
            <Route path="endeavourteacherexam" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourSclExamTeach /></PrivateRoute>} />
            <Route path="endeavourauction" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourAuction /></PrivateRoute>} />
            <Route path="auctionreportendeavour" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndevaourAucReportforTeach /></PrivateRoute>} />
            <Route path="endeavourofferingsandattendance" element={<PrivateRoute allowedRoles={['endeavourteacher']}><EndeavourOfferAttendance /></PrivateRoute>} />


            {/* Bible Sentence */}
            <Route path="biblesentence" element={<PrivateRoute allowedRoles={['admin', "churchadmin", 'treasurer', "churchofficestaff"]}> <BibleSentence /></PrivateRoute>} />



            {/* Notifications */}
            <Route path="notifications" element={<PrivateRoute allowedRoles={["admin", "secretary", "accountant", "treasurer", "churchofficeworker", "churchadmin", "churchofficestaff"]}><Notification /></PrivateRoute>} />






            {/* Fellowship, Harvest, Subscribers, Bills */}
            <Route path="menfellowmembers" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"]}><MenMembers /></PrivateRoute>} />
            <Route path="menfellowevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"]}><MenFellowEvent /></PrivateRoute>} />

            <Route path="menfellowevent/addevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><AddMenEvent /></PrivateRoute>} />
            <Route path="menfellowevent/editevent/:id" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><EditMenEvent /></PrivateRoute>} />


            <Route path="menactivites" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'secretary', "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"]}><MenActivities /></PrivateRoute>} />
            <Route path="menauction" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"]}><MenAuction /></PrivateRoute>} />
            <Route path="menauctionreport" element={<PrivateRoute allowedRoles={['admin', 'secretary', "mensecretary", "menaccountant", "churchadmin", "churchofficestaff"]}><MenAuctionReport /></PrivateRoute>} />

            <Route path="menaddexpense" element={<PrivateRoute allowedRoles={['admin', "menaccountant"]}><AddMenFellowExpense /></PrivateRoute>} />
            <Route path="menpaidexpense" element={<PrivateRoute allowedRoles={['admin', "menaccountant"]}><MenPaidExpense /></PrivateRoute>} />
            <Route path="menapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "mensecretary"]}><MenApprovedExpense /></PrivateRoute>} />
            <Route path="menexpense" element={<PrivateRoute allowedRoles={['admin', "mensecretary"]}><MenExpense /></PrivateRoute>} />



            <Route path="womenfellowmembers" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><WomenMember /></PrivateRoute>} />
            <Route path="womenfellowevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><WomenFellowEvent /></PrivateRoute>} />
            <Route path="womenfellowevent/addwomenevent" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><AddWomenEvent /></PrivateRoute>} />
            <Route path="womenfellowevent/editwomenevent/:id" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><EditWomenEvent /></PrivateRoute>} />

            <Route path="womenactivities" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><WomenActivities /></PrivateRoute>} />
            <Route path="womenauction" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><WomenAuction /></PrivateRoute>} />
            <Route path="womenactionreport" element={<PrivateRoute allowedRoles={['admin', 'secretary', "womensecretary", "womenaccountant", "churchadmin", "churchofficestaff"]}><WomenAuctionReport /></PrivateRoute>} />

            <Route path="womenaddexpense" element={<PrivateRoute allowedRoles={['admin', "womenaccountant"]}><AddWomenFellowExpense /></PrivateRoute>} />
            <Route path="womenpaidexpense" element={<PrivateRoute allowedRoles={['admin', "womenaccountant"]}><WomenPaidExpense /></PrivateRoute>} />
            <Route path="womenapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "womensecretary"]}><WomenApprovedExpense /></PrivateRoute>} />
            <Route path="womenexpense" element={<PrivateRoute allowedRoles={['admin', "womensecretary"]}><WomenExpense /></PrivateRoute>} />




            {/*  Auction */}
            <Route path="sundayauction" element={<PrivateRoute allowedRoles={['admin', 'secretary', "churchadmin", "churchofficestaff"]}><SundayAuction /></PrivateRoute>} />

            <Route
              path="bills"
              element={
                <PrivateRoute allowedRoles={['admin', 'secretary', "churchadmin", "churchofficestaff"]}>
                  <Bills />
                </PrivateRoute>
              }
            />




            {/* Choir */}
            <Route path="choirlist" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"]}><ChoirList /></PrivateRoute>} />
            <Route path="choirmaster" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"]}><ChoirMaster /></PrivateRoute>} />
            <Route path="choirsubscription" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"]}><ChoirSubscription /></PrivateRoute>} />
            <Route path="choirevent" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"]}><ChoirEvent /></PrivateRoute>} />

            <Route path="choirnotification" element={<PrivateRoute allowedRoles={['choiraccountant', 'choirsecretary', 'pastorprimary', 'admin', 'churchadmin', "churchofficestaff"]}><ChoirNotification /></PrivateRoute>} />

            <Route path="choiraddexpense" element={<PrivateRoute allowedRoles={['admin', "choiraccountant"]}><AddChoirExpense /></PrivateRoute>} />
            <Route path="choirpaidexpense" element={<PrivateRoute allowedRoles={['admin', "choiraccountant"]}><ChoirPaidExpense /></PrivateRoute>} />
            <Route path="choirapprovedexpense" element={<PrivateRoute allowedRoles={['admin', "choirsecretary"]}><ChoirApprovedExpense /></PrivateRoute>} />
            <Route path="choirexpense" element={<PrivateRoute allowedRoles={['admin', "choirsecretary"]}><ChoirExpense /></PrivateRoute>} />




            {/* Cemetery */}

            
             <Route path="cemetery" element={<PrivateRoute allowedRoles={['admin', 'treasurer', 'accountant', 'secretary', 'churchofficeworker', 'churchadmin', "churchofficestaff"]}><FamilyContainer /></PrivateRoute>}>
              <Route path="plots" element={<Plots />} />
              <Route path="book-slots" element={<BookSlots />} />
              <Route path="reserved-slots" element={<ReservedSlots />} />
              <Route path="report" element={<CemeteryReport />} />
     

            </Route>        

      
          
           {/* Reports */}
            <Route path="reports/member-report" element={<PrivateRoute allowedRoles={['admin', 'secretary', "churchadmin", "churchofficestaff"]}><MemberReport /></PrivateRoute>} />

            <Route path="reports/offertory-santha-report"   element={  <PrivateRoute allowedRoles={['admin','secretary','churchadmin','churchofficestaff']}>  <OffertorySanthaReport /></PrivateRoute>  }/>

  
    


            <Route path="usercontrol" element={<PrivateRoute allowedRoles={['admin', 'secretary', 'churchadmin']}><Usercontrol /></PrivateRoute>} />

          </Route>
        </Routes>
      </BrowserRouter>

    </React.Fragment>
  );
}

export default App;


