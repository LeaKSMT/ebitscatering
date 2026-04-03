import { getAdminDecorations } from "../utils/AdminData";

function AdminDecorations() {
    const decorations = getAdminDecorations();

    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {decorations.map((item) => (
                <div
                    key={item.name}
                    className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-[#d4af37] to-[#1db784] text-white px-6 py-4 font-bold text-2xl">
                        {item.name}
                    </div>

                    <div className="p-6">
                        <span className="inline-flex rounded-full bg-[#0b4a3a] text-white px-3 py-1 text-sm font-bold">
                            {item.category}
                        </span>
                        <p className="text-gray-500 mt-4">
                            Available for {item.category} events
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminDecorations;