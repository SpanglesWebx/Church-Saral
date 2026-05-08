import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import BackButton from "../../Components/Button/BackButton";

export const MrgHallAssetsView = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();
  const [hall, setHall] = useState(null);


  const fetchHall = async () => {
    const res = await axios.get(`${URL}/marriage/hall-assets/${id}`, {
      headers: { Authorization: token }
    });
    setHall(res.data.data);
  };

  useEffect(() => {
    fetchHall();

  }, []);




  return (
    <>

      <BackButton />
      <div className="p-3 mx-1 mt-3 ">



        <h1 className="text-xl font-bold capitalize text-lavender--600 mb-4">
          {hall?.hallName || "Loading..."} – Assets
        </h1>

        {!hall ? (
          <p className="text-center mt-5 text-lavender--600">Loading...</p>
        ) : (
          hall.categories.map((cat, ci) => (
            <div key={ci} className="mt-4 p-3 mx-1 bg-white shadow-sm rounded-[10px]">
              <h5 className="font-semibold text-lavender--600">
                {cat.categoryName}
              </h5>

              {cat.items.length === 0 ? (
                <p className="text-gray-400 mt-2">No items</p>
              ) : (
                <table className="w-full mt-2 text-sm table-fixed">
                  <thead className="text-base text-gray-700 border-b">
                    <tr>
                      <th className="p-2 text-center">S No</th>
                      <th className="p-2 text-center">Item</th>
                      <th className="p-2 text-center">Quantity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cat.items.map((it, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 text-center">{i + 1}</td>
                        <td className="p-2 text-center">{it.itemName}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}



      </div>
    </>
  );
};
