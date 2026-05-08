//src/Pages/Offerings/AddOfferings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import Spinners from "../../Components/Spinners";
import { FaSackDollar } from "react-icons/fa6";
import { FailedMessage } from "../../Components/ToastMessage";

export const AddOfferings = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get(`${URL}/offerings/types`, {
          headers: { Authorization: token },
        });
        setTypes(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);



  const handleClick = (type) => {
    navigate(`/admin/offertory/name/${type}`);
  };


  if (loading) {
    return (
      <div className="h-3/4 flex justify-center items-center">
        <Spinners />
      </div>
    );
  }

  return (
    <div className="p-4">


      <h1 className=" text-3xl font-bold capitalize text-lavender--600 block">
        Offertory
      </h1>

      <div className="flex flex-wrap gap-10">
        {types.map((item, index) => (
          <div
            key={index}
            onClick={() => handleClick(item.offeringType)}
            className="
              bg-white cursor-pointer
              flex flex-col items-center justify-center
              space-y-3
              w-full sm:w-[48%] md:w-[30%] lg:w-[22%]
              h-[110px]
              shadow-md rounded-lg
              transition hover:scale-[1.03]
            "
          >
            <FaSackDollar className="w-[26px] h-[26px] text-lavender--600" />
            <span className="text-xl font-bold capitalize text-lavender--600">
              {item.offeringType}
            </span>
          </div>
        ))}
      </div>

      {response?.status === "Failed" && (
        <FailedMessage Message={response.message} />
      )}
    </div>
  );
};


