import { ADD_ONS, formatCurrency } from "../utils/AdminData";

function AdminPricing() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#0b4a3a] text-white px-6 py-4 font-bold text-2xl">
                    Base Pricing
                </div>

                <div className="p-10 text-center">
                    <p className="text-2xl text-gray-500">Standard Rate Per Guest</p>
                    <h2 className="text-6xl font-extrabold text-[#d4af37] mt-4">₱400</h2>
                    <p className="text-gray-500 mt-3">
                        Includes: Food, Table Setup, Service Staff
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#1db784] text-white px-6 py-4 font-bold text-2xl">
                    Add-ons Pricing
                </div>

                <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ADD_ONS.map((item) => (
                        <div
                            key={item.name}
                            className="rounded-[20px] bg-[#f8fafc] p-5 border border-gray-100"
                        >
                            <h3 className="text-2xl font-bold text-[#0f4d3c]">{item.name}</h3>
                            <p className="text-4xl font-extrabold text-[#d4af37] mt-4">
                                {formatCurrency(item.price)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminPricing;