import React from 'react';

const WorkApprovalList: React.FC = () => {
  return (
    <div className="max-h-[480px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Navn</th>
            <th className="text-left p-2">Regitype</th>
            <th className="text-left p-2">Beskrivelse</th>
            <th className="text-left p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ole Normann</td>
            <td>Dataarbeid</td>
            <td>Jeg fikset X</td>
            <td>Godkjenn/underkjenn</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default WorkApprovalList;