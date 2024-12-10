import Subtitle from "../Typography/Subtitle";
import { Link, useNavigate } from "react-router-dom";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";

function CreateNewCard() {
  const navigate = useNavigate();
  const campaignClick = (link) => {
    navigate(`/app/campaigns/${link}`);
  };
  return (
    <div className={"card w-full p-4 shadow-xl"}>
      <Link to="/app/campaign/new">
        <div className="flex gap-2 items-center">
          <PlusIcon className="w-10" />
          <Subtitle>Create new campaign</Subtitle>
        </div>
      </Link>
    </div>
  );
}

export default CreateNewCard;
