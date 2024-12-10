import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import { useParams } from "react-router-dom";
import Transactions from "../../features/transactions";

function TransactionsPage() {
  const { link } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: link }));
  }, []);

  return <Transactions />;
}

export default TransactionsPage;
