import React from 'react';

const FormInput = ({ label, name, type = "text", register, errors, placeholder, ...rest }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input
                type={type}
                {...register(name)}
                placeholder={placeholder}
                className={`w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900 transition-all ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
            />
            {errors[name] && <span className="text-xs text-red-500">{errors[name].message}</span>}
        </div>
    );
};

export default FormInput;