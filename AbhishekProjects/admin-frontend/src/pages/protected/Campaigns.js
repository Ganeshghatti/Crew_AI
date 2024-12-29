import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Campaigns from '../../features/campaign'

function CampaignsPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Campaigns"}))
      }, [])
      
    return(
        <Campaigns />
    )
}

export default CampaignsPage