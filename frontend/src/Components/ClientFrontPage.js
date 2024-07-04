import './../App.css';
import { useEffect, useRef, useState } from 'react';

function ClientFrontPage() {
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nominee, setNominee] = useState("");
  const [relation, setRelation] = useState("");
  const [mobile, setMobile] = useState("");
  const [adhaar, setAdhaar] = useState("");
  const [policy, setPolicy] = useState("");

  const modalRef = useRef(null);

  const toggle = (i, id) => {
    if (selected === i) {
      setPolicy("");
      return setSelected(null);
    }
    setPolicy(id);
    return setSelected(i);
  }

  const handleAddUser = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5000/issuePolicy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: localStorage.getItem('userEmail'),
        policy: policy,
        nominee: nominee,
        relation: relation,
        mobile: mobile,
        adhaar: adhaar
      })
    });

    const json = await response.json();
    if (!json.success) {
      alert("Enter Valid Credentials");
    }

    setNominee("");
    setRelation("");
    setMobile("");
    setAdhaar("");
    setShowModal(false);
  };

  const fetchPolicies = async () => {
    await fetch("http://localhost:5000/getPolicies", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: localStorage.getItem('userEmail')
      })
    }).then(async (res) => {
      let response = await res.json();
      setData(response);
    });
  };

  useEffect(() => {
    fetchPolicies();
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="wrapper">
      <div className="accordion">
        {data.map((item, i) => (
          <div className="item" key={i}>
            <div className="title" onClick={() => toggle(i, item.ID)}>
              <h2>{item.ID}</h2>
              <span>{selected === i ? '-' : '+'}</span>
            </div>
            <div className={selected === i ? "content show" : "content"}>
              <h3>Company: {item.Company}</h3>
              <h3>Duration: {item.Duration} years</h3>
              <h3>Premium: Rs.{item.Premium} monthly</h3>
              <h3>Hospitals covered under policy: {item.Hospitals}</h3>
              <h3>Benefits: Rs.{item.Amount}</h3>
              <button onClick={handleAddUser}>Issue Policy</button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-container">
          <div ref={modalRef} className="modal">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <div>
              <label>Nominee Name:</label>
              <input type="text" value={nominee} onChange={(e) => setNominee(e.target.value)} />

              <label>Relation:</label>
              <input type="text" value={relation} onChange={(e) => setRelation(e.target.value)} />

              <label>Mobile Number:</label>
              <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />

              <label>Adhaar Number:</label>
              <input type="text" value={adhaar} onChange={(e) => setAdhaar(e.target.value)} />

              <button type="submit" onClick={handleSubmit}>Issue Policy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientFrontPage;
