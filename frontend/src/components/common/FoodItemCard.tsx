import type { ICombo, IDetailCombo, IProduct } from "@/types/product"

const ProductCard = ({ product, quantity, onIncrease, onDecrease }: { product: IProduct, quantity: number, onIncrease: () => void, onDecrease: () => void }) => {
  return (
    <div className="bg-white/10 rounded overflow-hidden border border-white/10 hover:border-yellow-300/50 transition-all">
      <div className="aspect-square relative">
        <img 
          src={product.anhSanPham} 
          alt={product.tenSanPham}
          className="w-full h-full object-cover hover:scale-104 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h4 className="text-white font-semibold text-center mb-2">{product.tenSanPham}</h4>
        <p className="text-yellow-300 font-anton text-center text-base md:text-2xl">
          {Number(product.giaTien).toLocaleString()} VNĐ
        </p>
        <div className="flex items-center mt-8 md:p-1 px-2 mx-auto w-fit bg-yellow-300 rounded">
          <button
            onClick={onDecrease}
            className="md:w-7 md:h-7 rounded-full hover:bg-purple-700 hover:text-white cursor-pointer to-pink-500 text-black font-bold transition-all"
          >
            −
          </button>
          <span className="text-black text-sm md:text-xl font-anton min-w-16 text-center md:min-w-20">
            {quantity}
          </span>
          <button
            onClick={onIncrease}
            className="md:w-7 md:h-7 rounded-full hover:bg-purple-700 hover:text-white cursor-pointer to-pink-500 text-black font-bold transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

const ComboCard = ({ combo, quantity, onIncrease, onDecrease }: {
  combo: ICombo;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) => {
  return (
    <div className="relative bg-white/5 backdrop-blur-sm rounded border border-white/10 
                    hover:border-yellow-300/50 overflow-hidden hover:border-yellow-300 transition-all 
                    flex flex-col h-full">
      
      {/* Ảnh */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={combo.anhCombo}
          alt={combo.tenCombo}
          className="w-full h-full object-cover hover:scale-104 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl md:text-2xl font-anton text-yellow-300 text-center mb-3">
          {combo.tenCombo}
        </h3>

        <div className="space-y-2 text-gray-300 text-sm mb-5 flex-1">
          {combo.chiTietCombos.map((ct: IDetailCombo) => (
            <div key={ct.maSanPham} className="flex items-center gap-2">
              <span className="text-yellow-300">•</span>
              <span>{ct.soLuong}x {ct.tenSanPham}</span>
            </div>
          ))}
        </div>

        {/* Phần giá + button - đẩy xuống dưới cùng */}
        <div className="mt-auto">
          <div className="text-center space-y-1 mb-6">
            {combo.giaGoc && combo.giaGoc > combo.giaBan && (
              <p className="text-sm md:text-base font-anton text-white/60 line-through">
                {Number(combo.giaGoc).toLocaleString()} VNĐ
              </p>
            )}
            <p className="text-xl md:text-3xl font-anton text-yellow-300">
              {Number(combo.giaBan).toLocaleString()} VNĐ
            </p>
          </div>

          {/* Giữ nguyên style button cũ của bạn */}
          <div className="flex items-center justify-between mt-8 p-1 bg-yellow-300 w-fit mx-auto rounded">
            <button
              onClick={onDecrease}
              className="w-7 h-7 rounded-full hover:bg-purple-700 hover:text-white cursor-pointer to-pink-500 text-black font-bold transition-all"
            >
              −
            </button>
            <span className="text-black text-xl font-anton min-w-16 text-center min-w-20">
              {quantity}
            </span>
            <button
              onClick={onIncrease}
              className="w-7 h-7 rounded-full hover:bg-purple-700 hover:text-white cursor-pointer to-pink-500 text-black font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProductCard, ComboCard }