import React from "react";

export default function CallTable(props) {
  const keys = props.keys;
  const data = props.data;


  return (
    <div>
      <table className='table table-striped'>
        <thead>
          <tr>
            {keys.map(key => (
              <td key={key}>{key}</td>
            ))}
          </tr>
        </thead>
        <tbody>
            {
                data.map((val, index) => (
                    <tr key = {index}>
                      {(Object.keys(val)).map(key => (
                        <td>{val[key]}</td>
                      ))}
                    </tr>
                ))
            }
        </tbody>
      </table>
    </div>
  );
}
