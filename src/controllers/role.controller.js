const mongoose = require("mongoose");
const Role = require("../models/role");

// C - Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    const role = await Role.create({ name, description });
    return res.status(201).json({ message: "Created role", data: role });
  } catch (err) {
    // Duplicate key
    if (err.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(400).json({ message: err.message });
  }
};

// R - Get all Roles (không lấy role đã xoá mềm)
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false }).sort({ createdAt: -1 });
    return res.json({ message: "OK", data: roles });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// R - Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid role id" });

    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) return res.status(404).json({ message: "Role not found" });

    return res.json({ message: "OK", data: role });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// U - Update Role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid role id" });

    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;

    await role.save();
    return res.json({ message: "Updated role", data: role });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(400).json({ message: err.message });
  }
};

// D - Soft delete Role
exports.softDeleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid role id" });

    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.isDeleted = true;
    await role.save();

    return res.json({ message: "Soft deleted role" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};