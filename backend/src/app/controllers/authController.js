const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { email, password, name } = req.body;
    console.log(req.body);

    const existingUser = await prisma.user.findUnique({ where : { email } });
    if (existingUser) return res.status(400).json({ message: "Email đã được đăng ký" });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
    
        res.status(201).json({ message: "Đăng ký người dùng thành công", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Không tìm thấy người dùng" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Mật khẩu không chính xác" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "Đăng nhập thành công", token, name: user.name, email: user.email, userId: user.id });
}

const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const { userId } = req.user;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email }
        });

        res.json({ message: "Thông tin hồ sơ đã được cập nhật thành công", user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật hồ sơ", error:error.message });
    }
}

const changePassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { userId } = req.user;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Mật khẩu cũ không chính xác" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    
        res.json({ message: "Thay đổi mật khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
    }
}

module.exports = { register, login, updateProfile, changePassword };