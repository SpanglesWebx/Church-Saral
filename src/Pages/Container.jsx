

// import React, { useState, useContext } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "../Components/Sidebar";
// import Navbar from "../Components/Navbar.jsx";
// import {  RoleContext  } from "../Components/RoleContext";


// function Container() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//     const { activeRole } = useContext(RoleContext); 

//   return (

//       <div className="h-screen flex flex-col">
//         {/* NAVBAR */}


//           {/* NAVBAR */}
// <div className={`${sidebarOpen ? "hidden md:block" : "block"}`}>
//   <Navbar onMenuClick={() => setSidebarOpen(true)} />
// </div>


//         {/* BODY */}
//         <div className="flex flex-1 min-h-0 relative">

//           {/* MOBILE OVERLAY */}
//           {activeRole !== "member" && sidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black/40 z-30 md:hidden"
//               onClick={() => setSidebarOpen(false)}
//             />
//           )}

//           {/* SIDEBAR */}
//           {activeRole !== "member" && (
//           <aside
//             className={`
//               fixed md:static z-40 bg-white border-r
//               transform transition-transform duration-300
//               ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//               md:translate-x-0
//               h-full
//             `}
//             style={{ width: "300px" }}
//           >
//             <Sidebar onClose={() => setSidebarOpen(false)} />
//           </aside>
//           )}

//           {/* MAIN CONTENT (PAGE SCROLL) */}
//           <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-5">
//             <Outlet />
//           </main>

//         </div>
//       </div>

//   );
// }


// export default Container;










import React, { useState, useContext, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar.jsx";
import { RoleProvider, RoleContext } from "../Components/RoleContext";
import { NavigationProvider, NavigationContext } from "../Context/NavigationContext";

function LayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeRole } = useContext(RoleContext);

    const { allowNavigation } = useContext(NavigationContext); // ✅ important



  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const blockBack = () => {
      // ✅ allow custom back button
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }

      // ❌ block browser back
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", blockBack);

    return () => {
      window.removeEventListener("popstate", blockBack);
    };
  }, [allowNavigation]);



  return (
    <div className="h-screen flex flex-col">

      {/* NAVBAR */}
      <div className={`${sidebarOpen ? "hidden md:block" : "block"}`}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* BODY */}
      <div className="flex flex-1 min-h-0 relative">

        {/* MOBILE OVERLAY */}
        {activeRole !== "member" && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        {activeRole !== "member" && (
          <aside
            className={`
              fixed md:static z-40 bg-white border-r
              transform transition-transform duration-300
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              h-full
            `}
            style={{ width: "300px" }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-5">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

function Container() {
  return (
    <RoleProvider>
      <NavigationProvider>
        <LayoutContent />
      </NavigationProvider>
    </RoleProvider>
  );
}

export default Container;