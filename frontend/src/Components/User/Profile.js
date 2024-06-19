import React, { Fragment, useEffect, useState } from 'react'
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

    const [userDetails, setUserDetails] = useState({"result2":{}})

    const fetchUserDetails = async () => {
        console.log(localStorage.getItem('userEmail'))
        await fetch("http://localhost:5000/getUserDetails", {
            // credentials: 'include',
            // Origin:"http://localhost:3000/login",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                email:localStorage.getItem('userEmail')
            })
        }).then(async (res) => {
            let response = await res.json();
            await setUserDetails(response);
            console.log(response);
        })



        // await res.map((data)=>{
        //    console.log(data)
        // })


    }

    useEffect(() => {
        fetchUserDetails()
    }, [])


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
                     <p>{userDetails.Name}</p>
                 </div>
                 <div>
                     <h4>Email</h4>
                     <p>{userDetails.ID}</p>
                 </div>
                 <div>
                     <h4>Date of Birth</h4>
                     <p>{userDetails.Dob}</p>
                 </div>
                 <div>
                     <h4>Mobile Number</h4>
                     <p>{userDetails.Mobile}</p>
                 </div>
                 
 
                 <div>
                     <Link to="/client/policies">My Policies</Link>
                     <Link to="/password/update">Change Password</Link>
                 </div>
 
             </div>
         </div>
     </Fragment>
  )
}

export default Profile