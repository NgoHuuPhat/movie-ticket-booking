import "dotenv/config"
import { prisma } from '../src/lib/prisma'
import { generateIncrementalId } from '../src/utils/generateId.utils'
import bcrypt from 'bcrypt'

async function main() {

  // Type user seed
  const khachHang = await prisma.lOAINGUOIDUNG.upsert({
    where: { maLoaiNguoiDung: 'KH' },
    update: {},
    create: { maLoaiNguoiDung: 'KH', tenLoaiNguoiDung: 'Người dùng thường', moTa: 'Người dùng bình thường' }
  })
  const nhanVien = await prisma.lOAINGUOIDUNG.upsert({
    where: { maLoaiNguoiDung: 'NV' },
    update: {},
    create: { maLoaiNguoiDung: 'NV', tenLoaiNguoiDung: 'Nhân viên', moTa: 'Nhân viên rạp chiếu phim' }
  })
  const admin = await prisma.lOAINGUOIDUNG.upsert({
    where: { maLoaiNguoiDung: 'ADMIN' },
    update: {},
    create: { maLoaiNguoiDung: 'ADMIN', tenLoaiNguoiDung: 'Quản trị viên', moTa: 'Người quản lý toàn bộ hệ thống' }
  })
  await prisma.lOAINGUOIDUNG.upsert({
    where: { maLoaiNguoiDung: 'VIP' },
    update: {},
    create: { maLoaiNguoiDung: 'VIP', tenLoaiNguoiDung: 'Người dùng VIP', moTa: 'Người dùng hạng VIP' }
  })

  // Users seed
  const maNguoiDungAdmin = await generateIncrementalId(prisma.nGUOIDUNG, 'maNguoiDung', 'ND')
  const maNguoiDungKhachHang = await generateIncrementalId(prisma.nGUOIDUNG, 'maNguoiDung', 'ND')
  const maNguoiDungNhanVien = await generateIncrementalId(prisma.nGUOIDUNG, 'maNguoiDung', 'ND')

  const adminUser = await prisma.nGUOIDUNG.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      maNguoiDung: maNguoiDungAdmin,
      hoTen: 'Admin User',
      email: 'admin@gmail.com',
      matKhau: await bcrypt.hash('12345678', 10),
      soDienThoai: '0901111111',
      maLoaiNguoiDung: admin.maLoaiNguoiDung,
      ngaySinh: new Date(),
      gioiTinh: 'Nu'
    }
  })

  const khUser = await prisma.nGUOIDUNG.upsert({
    where: { email: 'kh@gmail.com' },
    update: {},
    create: {
      maNguoiDung: maNguoiDungKhachHang,
      hoTen: 'Khach Hang',
      email: 'kh@gmail.com',
      matKhau: await bcrypt.hash('12345678', 10),
      soDienThoai: '0903333333',
      maLoaiNguoiDung: khachHang.maLoaiNguoiDung,
      ngaySinh: new Date(),
      gioiTinh: 'Nam',
    }
  })
  
  const nvUser = await prisma.nGUOIDUNG.upsert({
    where: { email: 'nv@gmail.com' },
    update: {},
    create: {
      maNguoiDung: maNguoiDungNhanVien,
      hoTen: 'Nhan Vien',
      email: 'nv@gmail.com',
      matKhau: await bcrypt.hash('12345678', 10),
      soDienThoai: '0905555555',
      maLoaiNguoiDung: nhanVien.maLoaiNguoiDung,
      ngaySinh: new Date(),
      gioiTinh: 'Nam'
    }
  })

  // Cinema seed
  const rap = await prisma.rAP.upsert({
    where: { maRap: 'RAP001' },
    update: {},
    create: {
      maRap: 'RAP001',
      tenRap: 'Rạp Chiếu phim Lê Độ',
      diaChi: '46 Trần Phú, Hải Châu, Đà Nẵng',
      soDienThoai: '0236 3822 574',
      email: 'ttphpcbdn@gmail.com'
    }
  })

  console.log({ adminUser, khUser, nvUser, rap })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })