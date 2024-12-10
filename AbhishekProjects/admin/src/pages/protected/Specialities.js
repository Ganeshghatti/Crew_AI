import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Specialities from '../../features/specialities'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Specialities"}))
      }, [])


    return(
        <Specialities />
    )
}

export default InternalPage