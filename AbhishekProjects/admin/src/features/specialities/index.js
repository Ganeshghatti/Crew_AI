import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { showNotification } from "../common/headerSlice";
import { Link } from "react-router-dom";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import axios from "axios";

const TopSideButtons = () => {
  return (
    <div className="inline-block float-right">
      <Link to="/app/specialities/new">
        <button className="btn px-6 btn-sm normal-case btn-primary">
          Add New
        </button>
      </Link>
    </div>
  );
};

function Specialities() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [specialities, setspecialities] = useState();
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      if (token) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/admin/get-all-specialties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setspecialities(response.data.specialities);
      }
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 401) {
        return navigate(`/`);
      }
      NotificationManager.error(
        "Failed to fetch campaigns",
        "Error",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [token]);
  
  const deleteCurrentLead = (item) => {
    dispatch(
      openModal({
        title: "Confirmation",
        bodyType: "CONFIRMATION",
        extraObject: {
          message: `Are you sure you want to delete `,
          type: "LEAD_DELETE",
          item,
        },
      })
    );
    fetchData();
  };

  return (
    <>
      <TitleCard
        title="Specialities"
        topMargin="mt-2"
        TopSideButtons={<TopSideButtons />}
      >
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Last Update</th>
                <th>Created At</th>
                <th></th> <th></th>
              </tr>
            </thead>
            <tbody>
              {specialities &&
                specialities.length > 0 &&
                specialities.map((item, k) => {
                  return (
                    <tr key={k}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={item.icon} alt="Avatar" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{item.title}</div>
                            {/* <div className="text-sm opacity-50">
                            {item.last_name}
                          </div> */}
                          </div>
                        </div>
                      </td>
                      <td>{item.desc}</td>
                      <td>{item.lastUpdate}</td>
                      <td>{item.createdAt}</td>
                      <td>
                        <Link to={`/app/specialities/${item.link}`}>
                          <button className="btn btn-square btn-ghost p-4">
                            <p className="flex items-center gap-1">
                              Edit <PencilIcon className="w-5" />
                            </p>
                          </button>
                        </Link>
                      </td>
                      <td>
                        <button
                          className="btn btn-square btn-ghost"
                          onClick={() => deleteCurrentLead(item)}
                        >
                          <TrashIcon className="w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </>
  );
}

export default Specialities;
