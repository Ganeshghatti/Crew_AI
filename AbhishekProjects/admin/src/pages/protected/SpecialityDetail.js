import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import { useParams } from "react-router-dom";
import SpecialityDetail from "../../features/specialitydetail";

function SpecialityDetailPage() {
  const { link } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: link }));
  }, []);

  return <SpecialityDetail />;
}

export default SpecialityDetailPage;
