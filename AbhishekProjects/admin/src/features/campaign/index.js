import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { Link } from "react-router-dom";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import axios from "axios";
import CampaignCard from "../../components/Cards/CampaignCard";
import CreateNewCard from "../../components/Cards/CreateNewCard";
import Title from "../../components/Typography/Title";

function Campaigns() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [campaigns, setcampaigns] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          setLoading(true);
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/admin/get-all-campaigns`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setcampaigns(response.data.campaigns);
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

    fetchData();
  }, [token]);

  return (
    <>
      <NotificationContainer />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CreateNewCard />
      </div>
      <br /> <br />
      <br />
      {campaigns && campaigns.length > 0 && (
        <Title children="Existing Campaigns" />
      )}
      <br />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          // Add loading skeletons here
          [...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-gray-200 h-24 rounded-b-lg mt-1"></div>
            </div>
          ))
        ) : (
          campaigns &&
          campaigns.length > 0 &&
          campaigns.map((campaign, k) => {
            return (
              <CampaignCard
                key={k}
                title={campaign.title}
                url={campaign.thumbnail}
                link={campaign.link}
                amount={campaign.amount}
                amountDonated={campaign.amountDonated}
              />
            );
          })
        )}
      </div>

      {/* No campaigns message */}
      {!loading && (!campaigns || campaigns.length === 0) && (
        <div className="text-center text-gray-500 mt-8">
          No campaigns found. Create a new campaign to get started.
        </div>
      )}
    </>
  );
}

export default Campaigns;
