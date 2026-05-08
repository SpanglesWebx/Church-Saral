
import React, { useEffect, useState} from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import MemberTypesCard from "../../Components/DashBoard/MemberTypesCard.jsx";
import FamilyHeadsCard from "../../Components/DashBoard/FamilyHeadsCard";
import MembersSummaryCard from "../../Components/DashBoard/MembersSummaryCard";
import StatsCard from "../../Components/DashBoard/StatusCard";
import { FaPeopleRoof } from "react-icons/fa6";




export const Dashboard = () => {

  const [families, setFamilies] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [subscribedMemberCount, setSubscribedMemberCount] = useState(0);
  const navigate = useNavigate();

  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });


  const [memberStats, setMemberStats] = useState({
    total: 0,
    types: [],
    headYes: 0,
    headNo: 0
  });













  const [isLoading, setIsLoading] = useState(false);

  const fetchFamilyCount = async () => {
    const res = await axios.get(`${URL}/dashboard/admin/family-count`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.totalFamilies;
  };


  const fetchMemberCount = async () => {
    const res = await axios.get(`${URL}/dashboard/admin/member-count`, {
      headers: { Authorization: token },
    });

    const data = res.data;

    return {
      total: data.totalMembers?.[0]?.count || 0,
      types: data.memberTypes,
      headYes: data.headYes?.[0]?.count || 0,
      headNo: data.headNo?.[0]?.count || 0
    };
  };



  useEffect(() => {


   

    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [
          familyCountData,
          memberCountData,

        ] = await Promise.all([
          fetchFamilyCount(),
          fetchMemberCount(),

        ]);

        if (!mounted) return;

        setFamilies(familyCountData);
        setMemberStats(memberCountData);


      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4">






      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">



        <MembersSummaryCard

          total={memberStats.total}
          loading={isLoading}
        />


        <StatsCard
          title="Families"
          value={families}
          label="Total Families"
          icon={<FaPeopleRoof size={42} className="text-lavender--600" />}
          loading={isLoading}
        />

      </div>



      {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-4">



        <FamilyHeadsCard
          headYes={memberStats.headYes}
          headNo={memberStats.headNo}
          loading={isLoading}
        />

      </div> */}



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <MemberTypesCard
          types={memberStats.types}
          loading={isLoading}
        />

        <FamilyHeadsCard
          headYes={memberStats.headYes}
          headNo={memberStats.headNo}
          loading={isLoading}
        />

      </div>







      {/* Toast */}
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      ) : null}

    </div>
  );
}

