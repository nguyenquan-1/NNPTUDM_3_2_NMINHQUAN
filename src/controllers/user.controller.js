const mongoose = require("mongoose");
const User = require("../models/user");
const Role = require("../models/role");

// C - Create User
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    // check role tồn tại và chưa bị xoá mềm
    if (!mongoose.Types.ObjectId.isValid(role))
      return res.status(400).json({ message: "Invalid role id" });

    const roleDoc = await Role.findOne({ _id: role, isDeleted: false });
    if (!roleDoc) return res.status(404).json({ message: "Role not found" });

    const user = await User.create({
      username,
      password, // sẽ được hash trong pre('save')
      email,
      fullName: fullName ?? "",
      avatarUrl: avatarUrl ?? "https://i.sstatic.net/l60Hf.png",
      role
    });

    // không trả password
    const userSafe = await User.findById(user._id).select("-password").populate("role");
    return res.status(201).json({ message: "Created user", data: userSafe });
  } catch (err) {
    if (err.code === 11000) {
      // có thể trùng username hoặc email
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    return res.status(400).json({ message: err.message });
  }
};

// R - Get all Users (không lấy user đã xoá mềm)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .populate("role")
      .sort({ createdAt: -1 });

    return res.json({ message: "OK", data: users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// R - Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findOne({ _id: id, isDeleted: false })
      .select("-password")
      .populate("role");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "OK", data: user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// U - Update User (chú ý update password phải dùng save để hash)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, fullName, avatarUrl, role, status, loginCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (fullName !== undefined) user.fullName = fullName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (status !== undefined) user.status = status;

    if (loginCount !== undefined) user.loginCount = loginCount;

    if (role !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(role))
        return res.status(400).json({ message: "Invalid role id" });

      const roleDoc = await Role.findOne({ _id: role, isDeleted: false });
      if (!roleDoc) return res.status(404).json({ message: "Role not found" });

      user.role = role;
    }

    // nếu có password mới → pre('save') sẽ hash
    if (password !== undefined) user.password = password;

    await user.save();

    const userSafe = await User.findById(user._id).select("-password").populate("role");
    return res.json({ message: "Updated user", data: userSafe });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    return res.status(400).json({ message: err.message });
  }
};

// D - Soft delete User
exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    await user.save();

    return res.json({ message: "Soft deleted user" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 2) POST /enable (username + email đúng -> status=true)
exports.enableUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: "username and email are required" });
    }

    const user = await User.findOne({
      username,
      email: email.toLowerCase(),
      isDeleted: false
    });

    if (!user) return res.status(404).json({ message: "User not found or info not match" });

    user.status = true;
    await user.save();

    const userSafe = await User.findById(user._id).select("-password").populate("role");
    return res.json({ message: "User enabled", data: userSafe });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 3) POST /disable (username + email đúng -> status=false)
exports.disableUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: "username and email are required" });
    }

    const user = await User.findOne({
      username,
      email: email.toLowerCase(),
      isDeleted: false
    });

    if (!user) return res.status(404).json({ message: "User not found or info not match" });

    user.status = false;
    await user.save();

    const userSafe = await User.findById(user._id).select("-password").populate("role");
    return res.json({ message: "User disabled", data: userSafe });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};