import React from "react";
import "./../../App";
import { useState, useRef, useEffect } from "react";
import { CodeSharp } from "@material-ui/icons";

export const InsurerFrontPage = () => {
  const [selected,setSelected] = useState(null);
  const [data,setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [id,setId] = useState("");
  const [username,setUsername] = useState("");
  const [duration,setDuration] = useState("");
  const [premium,setPremium] = useState("");
  const [hospitals,setHospitals] = useState("");
  const [amount,setAmount] = useState("");
  const email=localStorage.getItem('userEmail');

  const modalRef = useRef(null);



  const toggle = (i,id) => {
    if(selected === i){
      
      return setSelected(null);
    }
    
    return setSelected(i);
  }

  

  const handleAddUser = () => {
    console.log(email);
    setShowModal(true);
  };

  const handleSubmit = async() => {
    console.log("AAya")

    const response = await fetch(`http://localhost:5000/registerPolicy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({ id:id,
                email:email,username:username,
                duration:duration,premium:premium,hospitals:hospitals,
                amount:amount,
            })
        })

        // const response = await fetch(`http://localhost:5000/signup`,{
        //     method:'POST',
        //     headers:{
        //         'Content-Type':'application/json'
        //     },
        //     body:JSON.stringify({username:username,email:email,dob:dob,
        //         role:selectedOption,mobile:mobile,password:password,address:address})
        // });

        const json = await response.json();
       console.log("json:"+json);
        if(!json.success){
            alert("Enter Valid Credentials");
        }

    // Here you can handle the form submission, for now, let's just log the form data
    //console.log(formData);
    // Clear the form data
    setId("");
    setUsername("");
    setDuration("");
    setPremium("");
    setHospitals("");
    setAmount("");
    // Close the modal after submission
    setShowModal(false);
  };


  const fetchPolicies = async () => {
    console.log(localStorage.getItem('userEmail'))
    await fetch("http://localhost:5000/insurerPolicies", {
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
        await setData(response);
        console.log(response);
    })



    // await res.map((data)=>{
    //    console.log(data)
    // })


}

  useEffect(() => {
    fetchPolicies();
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    
    <div className="wrappper">
      <h1>Welcome to HealthCare!</h1>
      <div className="accordion">
      
        {data.map((item,i)=>{
          return (<div className="item" key={i}>
          <div className="title" onClick={() => toggle(i,item.ID)}>
            <h2>{item.ID}</h2>
            <span>{selected === i ?'-':'+'}</span>
          </div>
          <div className={selected === i ? "content show" : "content"}>
            <h3>Company: {item.Company}</h3>
            <h3>Duration: {item.Duration} years</h3>
            <h3>Premium: Rs.{item.Premium} monthly</h3>
            <h3>Hospitals covered under policy: {item.Hospitals}</h3>
            <h3>Benefits: Rs.{item.Amount}</h3>
            
            
          </div>
        </div>)
        }
      )}
       
      </div>
      <button onClick={handleAddUser}>Add Policy</button>
      {showModal && (
        <div className="modal-container">
          <div className="modal">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <div >
              <label>ID:</label>
              <input type="text"  value={id} onChange={(e) => setId(e.target.value)} />

              <label>Company:</label>
              <input type="text"  value={username} onChange={(e) => setUsername(e.target.value)} />

              <label>Duration:</label>
              <input type="text"  value={duration} onChange={(e) => setDuration(e.target.value)} />
              
              <label>Premium:</label>
              <input type="text" value={premium} onChange={(e) => setPremium(e.target.value)} />
              
              <label>Hospitals:</label>
              <input type="text"  value={hospitals} onChange={(e) => setHospitals(e.target.value)} />

              <label>Amount:</label>
              <input type="text"  value={amount} onChange={(e) => setAmount(e.target.value)} />

              <button type="submit" onClick={handleSubmit}>Add Policy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  
  )
};


export default InsurerFrontPage;
