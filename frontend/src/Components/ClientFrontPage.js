import './../App.css'
import { useState } from 'react';

function ClientFrontPage() {
  const [selected,setSelected] = useState(null);

  const toggle = (i) => {
    if(selected === i){
      return setSelected(null);
    }

    return setSelected(i);
  }
  return (
    
    <div className="wrappper">
      <h1>Welcome to HealthCare!</h1>
      <div className="accordion">
      
        {data.map((item,i)=>{
          return (<div className="item" key={i}>
          <div className="title" onClick={() => toggle(i)}>
            <h2>{item.name}</h2>
            <span>{selected === i ?'-':'+'}</span>
          </div>
          <div className={selected === i ? "content show" : "content"}>
            <div>{item.content}</div>
            <button>Issue Policy</button>
          </div>
        </div>)
        }
      )}
       
      </div>
    </div>
  
  )
}

const data = [
  {
    name:'HealthPolicy1',
    content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },
  {
    name:'HealthPolicy1',
    content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },
  {
    name:'HealthPolicy1',
    content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },
  {
    name:'HealthPolicy1',
    content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since the 1500 when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },

]

export default ClientFrontPage;