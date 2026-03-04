const router = require("express").Router();
const roleCtrl = require("../controllers/role.controller");

router.post("/", roleCtrl.createRole);
router.get("/", roleCtrl.getAllRoles);
router.get("/:id", roleCtrl.getRoleById);
router.put("/:id", roleCtrl.updateRole);
router.delete("/:id", roleCtrl.softDeleteRole);

module.exports = router;