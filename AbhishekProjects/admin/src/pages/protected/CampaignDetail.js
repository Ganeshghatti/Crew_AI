import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import { useParams } from "react-router-dom";
import CampaignDetail from "../../features/campaigndetail";

function CampaignDetailPage() {
  const { link } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: link }));
  }, []);

  return <CampaignDetail />;
}

export default CampaignDetailPage;
