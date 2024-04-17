import React from "react";
import "./../../App";
import { useState, useRef, useEffect } from "react";

export const InsurerFrontPage = () => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    prescriptionName: "",
    policyUsed: "",
  });

  const modalRef = useRef(null);

  const toggle = (i) => {
    if (selected === i) {
      return setSelected(null);
    }

    return setSelected(i);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddUser = () => {
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle the form submission, for now, let's just log the form data
    console.log(formData);
    // Clear the form data
    setFormData({
      userName: "",
      prescriptionName: "",
      policyUsed: "",
    });
    // Close the modal after submission
    setShowModal(false);
  };

  useEffect(() => {
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
        {data.map((item, i) => {
          return (
            <div className="item" key={i}>
              <div className="title" onClick={() => toggle(i)}>
                <h2>{item.name}</h2>
                <span>{selected === i ? "-" : "+"}</span>
              </div>
              <div className={selected === i ? "content show" : "content"}>
                <div>{item.content}</div>
                <button>Resolve Policy</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleAddUser}>Add User</button>

      {showModal && (
        <div className="modal-container">
          <div ref={modalRef} className="modal">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <form onSubmit={handleSubmit}>
              <label>User Name:</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
              />

              <label>Prescription Name:</label>
              <input
                type="text"
                name="prescriptionName"
                value={formData.prescriptionName}
                onChange={handleInputChange}
              />

              <label>Policy Used:</label>
              <input
                type="text"
                name="policyUsed"
                value={formData.policyUsed}
                onChange={handleInputChange}
              />

              <button type="submit">Add User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const data = [
  {
    name: "User1",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  },
  {
    name: "User2",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  },
  {
    name: "User3",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  },
  {
    name: "User4",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  },
];
export default InsurerFrontPage;
