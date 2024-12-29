import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import CampaignNew from '../../features/campaignnew'

function CampaignNewPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "New Campaigns"}))
      }, [])
      
    return(
        <CampaignNew />
    )
}

export default CampaignNewPage