import React, { Fragment, useEffect } from 'react'
//import MetaData from '../layout/MetaData'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
//import Loader from '../layout/Loader/Loader';
import {useNavigate} from 'react-router-dom'
import "./Profile.css"

const Profile = () => {
    // const history= useNavigate();
    // const {user,loading,isAuthenticated} = useSelector(state=>state.user);
    // useEffect(()=>{
    //     if(isAuthenticated === false){
    //         history("/login");
    //     }
    // },[history,isAuthenticated])
  return (
   

         <Fragment >
         
 
         <div className='profileContainer'>
             <div>
                 <h1>My Profile</h1>
                 <img src={''} alt={''}/>
                 {/* <Link to="/me/update">Edit Profile</Link> */}
             </div>
             <div>
                 <div>
                     <h4>Full Name</h4>
                     <p>{"Pranil"}</p>
                 </div>
                 <div>
                     <h4>Email</h4>
                     <p>{"pranil20214023@mnnit.ac.in"}</p>
                 </div>
                 <div>
                     <h4>Joined On</h4>
                     <p>{"7/04/2024"}</p>
                 </div>
 
                 <div>
                     <Link to="/policies">My Policies</Link>
                     <Link to="/password/update">Change Password</Link>
                 </div>
 
             </div>
         </div>
     </Fragment>
  )
}

export default Profile