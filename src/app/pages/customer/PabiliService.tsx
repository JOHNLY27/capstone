import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Utensils, Pill, ShoppingCart, Plus, Minus, MapPin } from "lucide-react";

export function PabiliService() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [items, setItems] = useState([
    { name: "", quantity: 1, notes: "" },
  ]);

  const categories = [
    { id: "food", label: "Food", icon: Utensils },
    { id: "medicine", label: "Medicine", icon: Pill },
    { id: "groceries", label: "Groceries", icon: ShoppingCart },
  ];

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, notes: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/customer/active-orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Pabili Service</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct Shopping Assistance</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-2xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${
                    selectedCategory === category.id ? "text-[#D4AF37]" : "text-gray-300"
                  }`} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedCategory === category.id ? "text-[#D4AF37]" : "text-gray-400"
                  }`}>
                    {category.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-900">
              Items to Buy
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Item name (e.g., Chickenjoy with Rice)"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={item.notes}
                    onChange={(e) => updateItem(index, "notes", e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Store/Restaurant Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Jollibee Gaisano Mall"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Delivery Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Your address in Butuan City"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic px-1">Nearest available riders will be alerted to this location.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Instructions
          </label>
          <textarea
            placeholder="Any special requests or instructions..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0047AB] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0047AB]/30 active:scale-95 transition-all"
        >
          Dispatch Order
        </button>
      </form>
    </div>
  );
}
