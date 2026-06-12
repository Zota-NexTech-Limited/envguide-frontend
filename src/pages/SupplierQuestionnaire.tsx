import React from "react";
import { ClipboardList } from "lucide-react";

const SupplierQuestionnaire: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Questionnaire Under Update
        </h1>
        <p className="text-gray-600 leading-relaxed">
          We are upgrading our supplier questionnaire to a new format. Please
          check back shortly — your link will be reactivated automatically.
        </p>
        <p className="text-xs text-gray-400 mt-6">
          If you need assistance, contact your Enviraan administrator.
        </p>
      </div>
    </div>
  );
};

export default SupplierQuestionnaire;
