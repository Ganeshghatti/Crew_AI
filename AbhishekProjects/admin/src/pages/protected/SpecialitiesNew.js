import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import SpecialitiesNew from "../../features/specialitiesnew";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Add New Speciality" }));
  }, []);

  return <SpecialitiesNew />;
}

export default InternalPage;
